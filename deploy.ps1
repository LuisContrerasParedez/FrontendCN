[CmdletBinding()]
param(
    [switch] $ConfirmDeploy,
    [switch] $DryRun,
    [switch] $SkipBuild,
    [switch] $NoBackup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
. (Join-Path $projectRoot 'scripts\Deploy.Common.ps1')

$deployPath = Join-Path $projectRoot 'deploy'
$workPath = Join-Path $projectRoot '.deploy-work'
$statePath = Join-Path $projectRoot '.tools\deploy.state.json'
$version = (Get-Date).ToString('yyyyMMdd-HHmmss')
$packageName = "centranorte-$version.tar.gz"
$packagePath = Join-Path $workPath $packageName
$remoteActivated = $false
$remoteTouched = $false
$config = $null
$remotePackage = $null

function Remove-LocalTemporaryPath {
    param([Parameter(Mandatory = $true)][string] $TargetPath)

    if (-not (Test-Path -LiteralPath $TargetPath)) {
        return
    }

    $resolvedProject = [System.IO.Path]::GetFullPath($projectRoot).TrimEnd('\')
    $resolvedTarget = [System.IO.Path]::GetFullPath($TargetPath).TrimEnd('\')
    $allowedTargets = @(
        [System.IO.Path]::GetFullPath($deployPath).TrimEnd('\'),
        [System.IO.Path]::GetFullPath($workPath).TrimEnd('\')
    )
    if ($resolvedTarget -notin $allowedTargets -or -not $resolvedTarget.StartsWith($resolvedProject + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'Se rechazo la limpieza de una ruta local fuera del alcance permitido.'
    }

    Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}

function Invoke-RequiredCommand {
    param(
        [Parameter(Mandatory = $true)][string] $FilePath,
        [string[]] $Arguments = @()
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FilePath fallo con codigo $LASTEXITCODE."
    }
}

function Copy-DirectoryContents {
    param(
        [Parameter(Mandatory = $true)][string] $Source,
        [Parameter(Mandatory = $true)][string] $Destination
    )

    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
    }
}

$prepareRemoteScript = @'
set -eu
public_root="$1"
package_path="$2"
version="$3"
no_backup="$4"
parent="${public_root%/*}"
staging="$parent/.deploy-staging-$version"
backups="$parent/.deploy-backups"
lock="$parent/.centranorte-deploy-lock"

[ -f "$lock/version" ]
[ "$(cat "$lock/version")" = "$version" ]
[ "$public_root" != "/" ]
[ -f "$package_path" ]
[ ! -e "$staging" ]

mkdir -m 755 "$staging"
tar -xzf "$package_path" -C "$staging"

for required in index.html .htaccess; do
    [ -f "$staging/$required" ] || { echo "Falta archivo obligatorio en staging: $required" >&2; exit 21; }
done
[ -d "$staging/assets" ]

if [ "$no_backup" = "0" ] && [ -d "$public_root" ]; then
    mkdir -p -m 755 "$backups"
    backup_tmp="$backups/.backup-$version.tmp.tar.gz"
    backup_final="$backups/backup-$version.tar.gz"
    [ ! -e "$backup_final" ]
    tar -czf "$backup_tmp" -C "$public_root" .
    [ -s "$backup_tmp" ]
    tar -tzf "$backup_tmp" >/dev/null
    chmod 600 "$backup_tmp"
    mv "$backup_tmp" "$backup_final"
    echo "Respaldo remoto validado: backup-$version.tar.gz"
elif [ "$no_backup" = "1" ]; then
    echo "ADVERTENCIA: publicacion preparada sin respaldo." >&2
else
    echo "No existe una version activa que respaldar."
fi

# Las imagenes administradas en produccion no forman parte del paquete de Vite.
# Se copian a la nueva version antes del intercambio atomico. Si un despliegue
# anterior ya las omitio, se recuperan del respaldo mas reciente que las tenga.
persistent_restored=0
if [ -d "$public_root/imagenes" ]; then
    mkdir -p "$staging/imagenes"
    cp -a "$public_root/imagenes/." "$staging/imagenes/"
    persistent_restored=1
    echo "Contenido persistente conservado: imagenes"
elif [ -d "$backups" ]; then
    for backup in $(ls -1t "$backups"/*.tar.gz 2>/dev/null || true); do
        if tar -tzf "$backup" | grep -qE '^\./imagenes(/|$)'; then
            tar -xzf "$backup" -C "$staging" ./imagenes
            persistent_restored=1
            echo "Contenido persistente recuperado desde $(basename "$backup"): imagenes"
            break
        fi
    done
fi
if [ "$persistent_restored" = "0" ]; then
    echo "AVISO: no existe una carpeta imagenes activa ni recuperable en los respaldos." >&2
fi

forbidden="$(find "$staging" -type f \( -name 'db.local.php' -o -name 'db.production.php' -o -name '*.local.php' -o -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.ppk' -o -name '*.key' \) -print -quit)"
[ -z "$forbidden" ] || { echo "Staging contiene un archivo prohibido." >&2; exit 22; }
if grep -RIl --exclude='*.svg' -- 'BEGIN .*PRIVATE KEY' "$staging" | grep -q .; then
    echo "Staging contiene material de clave privada." >&2
    exit 23
fi

find "$staging" -type d -exec chmod 755 {} +
find "$staging" -type f -exec chmod 644 {} +

echo "Staging remoto validado."
'@

$preflightRemoteScript = @'
set -eu
public_root="$1"
package_path="$2"
version="$3"
parent="${public_root%/*}"
staging="$parent/.deploy-staging-$version"
previous="$parent/.deploy-previous-$version"
lock="$parent/.centranorte-deploy-lock"
lock_acquired=0

cleanup_lock_on_error() {
    status=$?
    if [ "$status" -ne 0 ] && [ "$lock_acquired" = "1" ]; then
        rm -rf "$lock"
    fi
    exit "$status"
}
trap cleanup_lock_on_error EXIT

[ -d "$parent" ]
[ ! -e "$package_path" ]
[ ! -e "$staging" ]
[ ! -e "$previous" ]
if ! mkdir -m 700 "$lock"; then
    echo "Existe otra operacion de despliegue o rollback en curso." >&2
    exit 19
fi
lock_acquired=1
printf '%s' "$version" > "$lock/version"
chmod 600 "$lock/version"
trap - EXIT
echo "Bloqueo remoto adquirido."
'@

$activateRemoteScript = @'
set -eu
public_root="$1"
version="$2"
parent="${public_root%/*}"
staging="$parent/.deploy-staging-$version"
previous="$parent/.deploy-previous-$version"

[ -d "$staging" ]
[ ! -e "$previous" ]

if [ -e "$public_root" ]; then
    mv "$public_root" "$previous"
fi

if ! mv "$staging" "$public_root"; then
    if [ -e "$previous" ] && [ ! -e "$public_root" ]; then
        mv "$previous" "$public_root"
    fi
    exit 30
fi

echo "Version activada: $version"
'@

$restoreRemoteScript = @'
set -eu
public_root="$1"
version="$2"
parent="${public_root%/*}"
previous="$parent/.deploy-previous-$version"
failed="$parent/.deploy-failed-$version"

if [ -e "$previous" ]; then
    if [ -e "$public_root" ]; then
        mv "$public_root" "$failed"
    fi
    mv "$previous" "$public_root"
    rm -rf "$failed"
    echo "Version anterior restaurada automaticamente."
else
    rm -rf "$public_root"
    echo "La primera publicacion fallida fue retirada." >&2
fi
'@

$finalizeRemoteScript = @'
set -eu
public_root="$1"
package_path="$2"
version="$3"
retention="$4"
parent="${public_root%/*}"
previous="$parent/.deploy-previous-$version"
backups="$parent/.deploy-backups"
lock="$parent/.centranorte-deploy-lock"

rm -f "$package_path"

if [ -d "$backups" ]; then
    count=0
    for backup in $(ls -1t "$backups"/backup-*.tar.gz 2>/dev/null || true); do
        count=$((count + 1))
        if [ "$count" -gt "$retention" ]; then
            rm -f -- "$backup"
        fi
    done
fi

rm -rf "$previous"
if [ -f "$lock/version" ] && [ "$(cat "$lock/version")" = "$version" ]; then
    rm -rf "$lock"
fi

echo "Limpieza remota completada."
'@

$cleanupRemoteScript = @'
set -eu
public_root="$1"
package_path="$2"
version="$3"
parent="${public_root%/*}"
staging="$parent/.deploy-staging-$version"
lock="$parent/.centranorte-deploy-lock"

if [ -f "$lock/version" ] && [ "$(cat "$lock/version")" = "$version" ]; then
    rm -rf "$staging"
    rm -f "$package_path"
    rm -rf "$lock"
fi
'@

try {
    Write-Host "Preparando despliegue $version" -ForegroundColor Cyan
    $config = Get-DeploymentConfig -ProjectRoot $projectRoot

    if ($NoBackup -and -not (Test-Path -LiteralPath $statePath -PathType Leaf)) {
        throw '-NoBackup no puede utilizarse en el primer despliegue.'
    }

    if (-not $SkipBuild) {
        if (-not (Get-Command 'C:\Program Files\nodejs\npm.cmd' -ErrorAction SilentlyContinue)) {
            throw 'No se encontro npm.cmd.'
        }
        $npm = 'C:\Program Files\nodejs\npm.cmd'
        if (Test-Path -LiteralPath (Join-Path $projectRoot 'package-lock.json')) {
            try {
                Invoke-RequiredCommand -FilePath $npm -Arguments @('ci')
            } catch {
                if ($_.Exception.Message -match 'codigo -4048') {
                    throw "npm ci no pudo actualizar node_modules porque un archivo esta en uso. Cierra cualquier 'npm run dev' o proceso Vite de este proyecto y vuelve a ejecutar el despliegue."
                }
                throw
            }
        } else {
            Invoke-RequiredCommand -FilePath $npm -Arguments @('install')
        }
        Invoke-RequiredCommand -FilePath $npm -Arguments @('audit', '--audit-level=high')
        Invoke-RequiredCommand -FilePath $npm -Arguments @('run', 'build')
    } else {
        Write-Host 'SkipBuild activo: se utilizara el dist existente.' -ForegroundColor Yellow
        Invoke-RequiredCommand -FilePath 'C:\Program Files\nodejs\npm.cmd' -Arguments @('audit', '--audit-level=high')
    }

    $distPath = Join-Path $projectRoot 'dist'
    if (-not (Test-Path -LiteralPath (Join-Path $distPath 'index.html') -PathType Leaf)) {
        throw 'Falta dist/index.html.'
    }
    if (-not (Test-Path -LiteralPath (Join-Path $distPath 'assets') -PathType Container)) {
        throw 'Falta dist/assets.'
    }

    Remove-LocalTemporaryPath -TargetPath $deployPath
    Remove-LocalTemporaryPath -TargetPath $workPath
    New-Item -ItemType Directory -Path $deployPath, $workPath -Force | Out-Null
    Copy-DirectoryContents -Source $distPath -Destination $deployPath
    Copy-Item -LiteralPath (Join-Path $projectRoot '.htaccess') -Destination $deployPath -Force

    $requiredPackageFiles = @('index.html', '.htaccess')
    foreach ($required in $requiredPackageFiles) {
        if (-not (Test-Path -LiteralPath (Join-Path $deployPath $required) -PathType Leaf)) {
            throw "Falta un archivo obligatorio en deploy: $required"
        }
    }

    $scanner = Join-Path $projectRoot 'scripts\Test-Secrets.ps1'
    $scannerArguments = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $scanner,
        '-Path', $deployPath
    )
    & powershell.exe @scannerArguments
    if ($LASTEXITCODE -ne 0) {
        throw 'El paquete no supero el analisis de secretos.'
    }

    Write-Host 'Contenido final del paquete:' -ForegroundColor Cyan
    Get-ChildItem -LiteralPath $deployPath -Recurse -Force -File |
        ForEach-Object { $_.FullName.Substring($deployPath.Length + 1).Replace('\', '/') } |
        Sort-Object |
        ForEach-Object { Write-Host ("  $_") }

    Invoke-RequiredCommand -FilePath 'tar.exe' -Arguments @('-czf', $packagePath, '-C', $deployPath, '.')
    Invoke-RequiredCommand -FilePath 'tar.exe' -Arguments @('-tzf', $packagePath)
    if (-not (Test-Path -LiteralPath $packagePath -PathType Leaf) -or (Get-Item -LiteralPath $packagePath).Length -eq 0) {
        throw 'El paquete tar.gz no fue creado correctamente.'
    }

    Write-Host ("Version: {0}" -f $version)
    Write-Host ("URL: {0}" -f $config.PublicUrl)
    Write-Host ("Destino: {0}" -f $config.RemotePublicPath)
    Write-Host ("Respaldo: {0}" -f (-not $NoBackup))

    if ($DryRun) {
        Write-Host 'DryRun completado: no se realizo ninguna conexion ni cambio remoto.' -ForegroundColor Green
        return
    }

    $isFirstDeployment = -not (Test-Path -LiteralPath $statePath -PathType Leaf)
    if ($isFirstDeployment -or -not $ConfirmDeploy) {
        $expectedConfirmation = if ($isFirstDeployment) { 'PUBLICAR PRIMER DESPLIEGUE' } else { 'PUBLICAR' }
        $confirmation = Read-Host "Escribe exactamente '$expectedConfirmation' para continuar"
        if ($confirmation -cne $expectedConfirmation) {
            throw 'Despliegue cancelado por el usuario.'
        }
    }
    if ($NoBackup) {
        Write-Host 'ADVERTENCIA: se solicito publicar sin respaldo.' -ForegroundColor Red
        $confirmation = Read-Host "Escribe exactamente 'SIN RESPALDO' para continuar"
        if ($confirmation -cne 'SIN RESPALDO') {
            throw 'Despliegue sin respaldo cancelado.'
        }
    }

    $remoteParent = ([string]$config.RemotePublicPath).Substring(0, ([string]$config.RemotePublicPath).LastIndexOf('/'))
    $remotePackage = $remoteParent + '/.deploy-upload-' + $version + '.tar.gz'
    Invoke-SshScript -Config $config -Script $preflightRemoteScript -Arguments @(
        [string]$config.RemotePublicPath,
        $remotePackage,
        $version
    )
    $remoteTouched = $true
    Send-DeploymentFile -Config $config -LocalPath $packagePath -RemotePath $remotePackage

    Invoke-SshScript -Config $config -Script $prepareRemoteScript -Arguments @(
        [string]$config.RemotePublicPath,
        $remotePackage,
        $version,
        $(if ($NoBackup) { '1' } else { '0' })
    )

    Invoke-SshScript -Config $config -Script $activateRemoteScript -Arguments @(
        [string]$config.RemotePublicPath,
        $version
    )
    $remoteActivated = $true

    try {
        Test-PublicDeployment -PublicUrl ([string]$config.PublicUrl)
    } catch {
        Write-Host 'Las pruebas HTTP fallaron. Iniciando restauracion automatica.' -ForegroundColor Red
        Invoke-SshScript -Config $config -Script $restoreRemoteScript -Arguments @(
            [string]$config.RemotePublicPath,
            $version
        )
        $remoteActivated = $false
        throw
    }

    Invoke-SshScript -Config $config -Script $finalizeRemoteScript -Arguments @(
        [string]$config.RemotePublicPath,
        $remotePackage,
        $version,
        [string]$config.BackupRetention
    )
    $remoteTouched = $false

    try {
        [pscustomobject]@{
            LastSuccessfulVersion = $version
            PublicUrl = [string]$config.PublicUrl
            CompletedAt = (Get-Date).ToString('o')
        } | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
    } catch {
        Write-Host 'Despliegue exitoso, pero no se pudo actualizar el estado local.' -ForegroundColor Yellow
    }

    Write-Host "Despliegue $version completado y validado." -ForegroundColor Green
} catch {
    if ($remoteTouched -and $config -and $remotePackage) {
        try {
            if ($remoteActivated) {
                Invoke-SshScript -Config $config -Script $restoreRemoteScript -Arguments @(
                    [string]$config.RemotePublicPath,
                    $version
                )
            }
            Invoke-SshScript -Config $config -Script $cleanupRemoteScript -Arguments @(
                [string]$config.RemotePublicPath,
                $remotePackage,
                $version
            )
        } catch {
            Write-Host 'No fue posible completar la limpieza remota automatica; revisa staging por SSH.' -ForegroundColor Red
        }
    }
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    try {
        Remove-LocalTemporaryPath -TargetPath $deployPath
        Remove-LocalTemporaryPath -TargetPath $workPath
    } catch {
        Write-Host 'No fue posible eliminar todos los temporales locales.' -ForegroundColor Yellow
    }
}
