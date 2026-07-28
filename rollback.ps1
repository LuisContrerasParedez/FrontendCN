[CmdletBinding()]
param(
    [string] $Version,
    [switch] $List,
    [switch] $ConfirmRollback
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
. (Join-Path $projectRoot 'scripts\Deploy.Common.ps1')

$config = $null
$operationVersion = (Get-Date).ToString('yyyyMMdd-HHmmss')
$remoteActivated = $false
$remotePrepared = $false

$listBackupsScript = @'
set -eu
public_root="$1"
parent="${public_root%/*}"
backups="$parent/.deploy-backups"
[ -d "$backups" ] || exit 0
find "$backups" -maxdepth 1 -type f -name '*.tar.gz' -printf '%T@ %f\n' | sort -rn | awk '{print $2}'
'@

$prepareRollbackScript = @'
set -eu
public_root="$1"
backup_name="$2"
operation="$3"
parent="${public_root%/*}"
backups="$parent/.deploy-backups"
selected="$backups/$backup_name"
staging="$parent/.rollback-staging-$operation"
lock="$parent/.centranorte-deploy-lock"
current_tmp="$backups/.pre-rollback-$operation.tmp.tar.gz"
lock_acquired=0

cleanup_prepare_on_error() {
    status=$?
    if [ "$status" -ne 0 ] && [ "$lock_acquired" = "1" ]; then
        rm -rf "$staging"
        rm -f "$current_tmp"
        rm -rf "$lock"
    fi
    exit "$status"
}
trap cleanup_prepare_on_error EXIT

[ ! -e "$staging" ]
if ! mkdir -m 700 "$lock"; then
    echo "Existe otra operacion de despliegue o rollback en curso." >&2
    exit 39
fi
lock_acquired=1
printf '%s' "$operation" > "$lock/version"
chmod 600 "$lock/version"
[ -f "$selected" ]
tar -tzf "$selected" >/dev/null
mkdir -m 755 "$staging"
tar --warning=no-timestamp -xzf "$selected" -C "$staging"

for required in index.html .htaccess; do
    [ -f "$staging/$required" ] || { echo "El respaldo no contiene $required" >&2; exit 41; }
done
[ -d "$staging/assets" ]

forbidden="$(find "$staging" -type f \( -name 'db.local.php' -o -name 'db.production.php' -o -name '*.local.php' -o -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.ppk' -o -name '*.key' \) -print -quit)"
[ -z "$forbidden" ] || { echo "El respaldo contiene un archivo prohibido." >&2; exit 42; }

find "$staging" -type d -exec chmod 755 {} +
find "$staging" -type f -exec chmod 644 {} +

[ -d "$public_root" ]
current_backup="$backups/pre-rollback-$operation.tar.gz"
tar -czf "$current_tmp" -C "$public_root" .
[ -s "$current_tmp" ]
tar -tzf "$current_tmp" >/dev/null
chmod 600 "$current_tmp"
mv "$current_tmp" "$current_backup"

trap - EXIT
echo "Rollback preparado y version actual respaldada."
'@

$activateRollbackScript = @'
set -eu
public_root="$1"
operation="$2"
parent="${public_root%/*}"
staging="$parent/.rollback-staging-$operation"
previous="$parent/.rollback-previous-$operation"

[ -d "$staging" ]
[ ! -e "$previous" ]
mv "$public_root" "$previous"
if ! mv "$staging" "$public_root"; then
    mv "$previous" "$public_root"
    exit 43
fi
echo "Respaldo activado temporalmente."
'@

$restoreRollbackScript = @'
set -eu
public_root="$1"
operation="$2"
parent="${public_root%/*}"
previous="$parent/.rollback-previous-$operation"
failed="$parent/.rollback-failed-$operation"

if [ -e "$previous" ]; then
    mv "$public_root" "$failed"
    mv "$previous" "$public_root"
    rm -rf "$failed"
fi
echo "Version previa al rollback restaurada."
'@

$finalizeRollbackScript = @'
set -eu
public_root="$1"
operation="$2"
retention="$3"
parent="${public_root%/*}"
previous="$parent/.rollback-previous-$operation"
backups="$parent/.deploy-backups"
lock="$parent/.centranorte-deploy-lock"

count=0
for backup in $(ls -1t "$backups"/*.tar.gz 2>/dev/null || true); do
    count=$((count + 1))
    if [ "$count" -gt "$retention" ]; then
        rm -f -- "$backup"
    fi
done
rm -rf "$previous"
if [ -f "$lock/version" ] && [ "$(cat "$lock/version")" = "$operation" ]; then
    rm -rf "$lock"
fi
echo "Rollback finalizado."
'@

$cleanupRollbackScript = @'
set -eu
public_root="$1"
operation="$2"
parent="${public_root%/*}"
staging="$parent/.rollback-staging-$operation"
lock="$parent/.centranorte-deploy-lock"
if [ -f "$lock/version" ] && [ "$(cat "$lock/version")" = "$operation" ]; then
    rm -rf "$staging"
    rm -rf "$lock"
fi
'@

try {
    $config = Get-DeploymentConfig -ProjectRoot $projectRoot
    $availableBackups = @(Invoke-SshScript -Config $config -Script $listBackupsScript -Arguments @([string]$config.RemotePublicPath) -ReturnOutput |
        ForEach-Object { ([string]$_).Trim() } |
        Where-Object { $_ -match '\A(?:backup|pre-rollback)-\d{8}-\d{6}\.tar\.gz\z' })

    if ($List) {
        if ($availableBackups.Count -eq 0) {
            Write-Host 'No hay respaldos remotos disponibles.'
        } else {
            Write-Host 'Respaldos remotos:' -ForegroundColor Cyan
            $availableBackups | ForEach-Object { Write-Host ("  $_") }
        }
        return
    }

    if ($availableBackups.Count -eq 0) {
        throw 'No hay respaldos remotos disponibles.'
    }

    $backupName = $null
    if ($Version) {
        if ($Version -notmatch '\A\d{8}-\d{6}\z') {
            throw 'Version debe usar el formato yyyyMMdd-HHmmss.'
        }
        $candidateNames = @("backup-$Version.tar.gz", "pre-rollback-$Version.tar.gz")
        $backupName = $candidateNames | Where-Object { $_ -in $availableBackups } | Select-Object -First 1
        if (-not $backupName) {
            throw 'No existe un respaldo remoto para la version solicitada.'
        }
    } else {
        $backupName = $availableBackups[0]
    }

    Write-Host ("Respaldo seleccionado: {0}" -f $backupName) -ForegroundColor Yellow
    Write-Host ("Destino: {0}" -f $config.RemotePublicPath)
    if (-not $ConfirmRollback) {
        $confirmation = Read-Host "Escribe exactamente 'REVERTIR' para continuar"
        if ($confirmation -cne 'REVERTIR') {
            throw 'Rollback cancelado por el usuario.'
        }
    }

    $remotePrepared = $true
    Invoke-SshScript -Config $config -Script $prepareRollbackScript -Arguments @(
        [string]$config.RemotePublicPath,
        [string]$backupName,
        $operationVersion
    )
    Invoke-SshScript -Config $config -Script $activateRollbackScript -Arguments @(
        [string]$config.RemotePublicPath,
        $operationVersion
    )
    $remoteActivated = $true

    try {
        Test-PublicDeployment -PublicUrl ([string]$config.PublicUrl)
    } catch {
        Write-Host 'El respaldo no supero las pruebas HTTP. Restaurando version previa.' -ForegroundColor Red
        Invoke-SshScript -Config $config -Script $restoreRollbackScript -Arguments @(
            [string]$config.RemotePublicPath,
            $operationVersion
        )
        $remoteActivated = $false
        throw
    }

    Invoke-SshScript -Config $config -Script $finalizeRollbackScript -Arguments @(
        [string]$config.RemotePublicPath,
        $operationVersion,
        [string]$config.BackupRetention
    )
    $remotePrepared = $false

    try {
        [pscustomobject]@{
            LastRollbackBackup = [string]$backupName
            PublicUrl = [string]$config.PublicUrl
            CompletedAt = (Get-Date).ToString('o')
        } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot '.tools\deploy.state.json') -Encoding UTF8
    } catch {
        Write-Host 'Rollback exitoso, pero no se pudo actualizar el estado local.' -ForegroundColor Yellow
    }

    Write-Host 'Rollback completado y validado.' -ForegroundColor Green
} catch {
    if ($config -and $remotePrepared) {
        try {
            if ($remoteActivated) {
                Invoke-SshScript -Config $config -Script $restoreRollbackScript -Arguments @(
                    [string]$config.RemotePublicPath,
                    $operationVersion
                )
            }
            Invoke-SshScript -Config $config -Script $cleanupRollbackScript -Arguments @(
                [string]$config.RemotePublicPath,
                $operationVersion
            )
        } catch {
            Write-Host 'No fue posible completar la limpieza remota del rollback.' -ForegroundColor Red
        }
    }
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
