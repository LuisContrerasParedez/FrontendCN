Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DeploymentConfig {
    param([Parameter(Mandatory = $true)][string] $ProjectRoot)

    $configPath = Join-Path $ProjectRoot '.tools\despliegueProduccion.local.ps1'
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw 'Falta .tools/despliegueProduccion.local.ps1. Usa la plantilla despliegueProduccion.local.example.ps1.'
    }

    $configText = [System.IO.File]::ReadAllText($configPath)
    if (($configText -match '-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----') -or ($configText -match '(?im)^\s*(?:Password|Passphrase|PrivateKeyContent)\s*=')) {
        throw 'despliegueProduccion.local.ps1 contiene material sensible no permitido.'
    }

    $config = & $configPath
    if ($config -isnot [hashtable]) {
        throw 'despliegueProduccion.local.ps1 debe devolver una tabla de configuracion.'
    }

    $requiredKeys = @(
        'SshHost', 'SshUser', 'SshPort', 'PrivateKeyPath', 'RemotePublicPath',
        'PublicUrl', 'ApiPublicUrl', 'BackupRetention'
    )
    foreach ($key in $requiredKeys) {
        if (-not $config.ContainsKey($key)) {
            throw "Falta el valor obligatorio de despliegue: $key"
        }
    }

    if ([string]$config.SshHost -notmatch '\A[A-Za-z0-9.-]+\z') {
        throw 'El host SSH no es valido.'
    }
    if ([string]$config.SshUser -notmatch '\A[A-Za-z0-9._-]+\z') {
        throw 'El usuario SSH no es valido.'
    }

    $port = 0
    if (-not [int]::TryParse([string]$config.SshPort, [ref]$port) -or $port -lt 1 -or $port -gt 65535) {
        throw 'El puerto SSH no es valido.'
    }
    $config.SshPort = $port

    $remotePublicPath = [string]$config.RemotePublicPath
    if ($remotePublicPath -notmatch '\A/[A-Za-z0-9._/-]+\z' -or $remotePublicPath.Contains('//') -or $remotePublicPath.Contains('/../')) {
        throw 'La ruta remota no es valida: RemotePublicPath'
    }
    $publicUri = $null
    if (-not [Uri]::TryCreate([string]$config.PublicUrl, [UriKind]::Absolute, [ref]$publicUri) -or $publicUri.Scheme -ne 'https') {
        throw 'PublicUrl debe ser una URL HTTPS absoluta.'
    }
    $config.PublicUrl = $publicUri.AbsoluteUri.TrimEnd('/')

    $apiUri = $null
    if (-not [Uri]::TryCreate([string]$config.ApiPublicUrl, [UriKind]::Absolute, [ref]$apiUri) -or $apiUri.Scheme -ne 'https' -or $apiUri.AbsolutePath.TrimEnd('/') -ne '/api') {
        throw 'ApiPublicUrl debe ser una URL HTTPS absoluta que termine en /api.'
    }
    if ($apiUri.Host -eq $publicUri.Host) {
        throw 'ApiPublicUrl debe utilizar el subdominio independiente del WS.'
    }
    $config.ApiPublicUrl = $apiUri.AbsoluteUri.TrimEnd('/')

    $retention = 0
    if (-not [int]::TryParse([string]$config.BackupRetention, [ref]$retention) -or $retention -lt 5 -or $retention -gt 50) {
        throw 'BackupRetention debe ser un numero entre 5 y 50.'
    }
    $config.BackupRetention = $retention

    $keyPath = [System.IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables([string]$config.PrivateKeyPath))
    if (-not (Test-Path -LiteralPath $keyPath -PathType Leaf)) {
        throw 'La clave privada SSH no existe en la ruta configurada.'
    }
    $normalizedProject = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\') + '\'
    if ($keyPath.StartsWith($normalizedProject, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'La clave SSH debe permanecer fuera del proyecto.'
    }
    $keyHeader = [System.IO.File]::ReadLines($keyPath) | Select-Object -First 1
    if ($keyHeader -notmatch '^-----BEGIN (OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----$') {
        throw 'El archivo configurado no tiene un formato de clave privada reconocido.'
    }
    if ($env:OS -eq 'Windows_NT') {
        $acl = Get-Acl -LiteralPath $keyPath
        $broadSids = @('S-1-1-0', 'S-1-5-11', 'S-1-5-32-545')
        foreach ($entry in $acl.Access) {
            try {
                $sid = $entry.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value
            } catch {
                continue
            }
            $canRead = ([int64]$entry.FileSystemRights -band [int64][System.Security.AccessControl.FileSystemRights]::ReadData) -ne 0
            if ($sid -in $broadSids -and $entry.AccessControlType -eq 'Allow' -and $canRead) {
                throw 'La clave SSH permite lectura a un grupo amplio de Windows.'
            }
        }
    }
    $config.PrivateKeyPath = $keyPath

    foreach ($command in @('ssh.exe', 'scp.exe', 'tar.exe', 'powershell.exe')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "No se encontro el comando requerido: $command"
        }
    }

    return $config
}

function ConvertTo-PosixArgument {
    param([Parameter(Mandatory = $true)][string] $Value)

    return "'" + $Value.Replace("'", "'`"'`"'") + "'"
}

function Get-SshBaseArguments {
    param([Parameter(Mandatory = $true)][hashtable] $Config)

    return @(
        '-i', [string]$Config.PrivateKeyPath,
        '-p', [string]$Config.SshPort,
        '-o', 'BatchMode=no',
        '-o', 'IdentitiesOnly=yes',
        '-o', 'PreferredAuthentications=publickey',
        '-o', 'NumberOfPasswordPrompts=3',
        '-o', 'StrictHostKeyChecking=yes',
        '-o', 'ConnectTimeout=15',
        '-o', 'ServerAliveInterval=15',
        '-o', 'ServerAliveCountMax=2'
    )
}

function Invoke-SshScript {
    param(
        [Parameter(Mandatory = $true)][hashtable] $Config,
        [Parameter(Mandatory = $true)][string] $Script,
        [string[]] $Arguments = @(),
        [switch] $ReturnOutput
    )

    $target = ([string]$Config.SshUser) + '@' + ([string]$Config.SshHost)
    $remoteArguments = @($Arguments | ForEach-Object { ConvertTo-PosixArgument -Value $_ })
    # Base64 avoids PowerShell converting LF to CRLF before the script reaches POSIX sh.
    $normalizedScript = $Script.Replace("`r`n", "`n").Replace("`r", "`n")
    $encodedScript = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($normalizedScript))
    $remoteCommand = 'printf %s ' + $encodedScript + ' | base64 -d | sh -s -- ' + ($remoteArguments -join ' ')
    $sshArguments = @(Get-SshBaseArguments -Config $Config) + @($target, $remoteCommand)
    $output = & ssh.exe @sshArguments 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        foreach ($line in @($output)) {
            Write-Host ([string]$line) -ForegroundColor Red
        }
        throw "La operacion SSH fallo con codigo $exitCode."
    }

    if ($ReturnOutput) {
        return @($output)
    }

    foreach ($line in @($output)) {
        if ([string]$line -ne '') {
            Write-Host ([string]$line)
        }
    }
}

function Send-DeploymentFile {
    param(
        [Parameter(Mandatory = $true)][hashtable] $Config,
        [Parameter(Mandatory = $true)][string] $LocalPath,
        [Parameter(Mandatory = $true)][string] $RemotePath
    )

    $target = ([string]$Config.SshUser) + '@' + ([string]$Config.SshHost) + ':' + $RemotePath
    $arguments = @(
        '-i', [string]$Config.PrivateKeyPath,
        '-P', [string]$Config.SshPort,
        '-o', 'BatchMode=no',
        '-o', 'IdentitiesOnly=yes',
        '-o', 'PreferredAuthentications=publickey',
        '-o', 'NumberOfPasswordPrompts=3',
        '-o', 'StrictHostKeyChecking=yes',
        '-o', 'ConnectTimeout=15',
        '--', $LocalPath, $target
    )
    & scp.exe @arguments
    if ($LASTEXITCODE -ne 0) {
        throw 'No fue posible transferir el paquete al servidor.'
    }
}

function Invoke-DeploymentHttpRequest {
    param(
        [Parameter(Mandatory = $true)][string] $Url,
        [string] $Origin = ''
    )

    if (-not (Get-Command 'curl.exe' -ErrorAction SilentlyContinue)) {
        throw 'curl.exe es obligatorio para las pruebas HTTP de despliegue.'
    }

    $requestId = [Guid]::NewGuid().ToString('N')
    $headersPath = Join-Path ([IO.Path]::GetTempPath()) ("cn-http-$requestId.headers")
    $bodyPath = Join-Path ([IO.Path]::GetTempPath()) ("cn-http-$requestId.body")

    try {
        $curlArguments = @(
            '--silent',
            '--show-error',
            '--max-time', '30',
            '--max-redirs', '0',
            '--request', 'GET',
            '--user-agent', 'Mozilla/5.0 CentraNorteDeploymentCheck/1.0',
            '--header', 'Cache-Control: no-cache, no-store',
            '--header', 'Pragma: no-cache'
        )
        if ($Origin -ne '') {
            $curlArguments += @('--header', "Origin: $Origin")
        }
        $curlArguments += @(
            '--dump-header', $headersPath,
            '--output', $bodyPath,
            '--write-out', '%{http_code}',
            '--', $Url
        )
        $statusOutput = & curl.exe @curlArguments
        if ($LASTEXITCODE -ne 0) {
            throw "curl.exe fallo con codigo $LASTEXITCODE."
        }

        $statusText = (@($statusOutput) -join '').Trim()
        if ($statusText -notmatch '\A\d{3}\z') {
            throw 'curl.exe no devolvio un estado HTTP valido.'
        }

        return [pscustomobject]@{
            StatusCode = [int]$statusText
            Content = [IO.File]::ReadAllText($bodyPath)
            RawHeaders = [IO.File]::ReadAllText($headersPath)
        }
    } finally {
        Remove-Item -LiteralPath $headersPath, $bodyPath -Force -ErrorAction SilentlyContinue
    }
}

function Test-PublicDeployment {
    param(
        [Parameter(Mandatory = $true)][string] $PublicUrl,
        [Parameter(Mandatory = $true)][string] $ApiPublicUrl
    )

    $tests = @(
        @{ Base = $PublicUrl; Path = '/'; Api = $false },
        @{ Base = $PublicUrl; Path = '/locales'; Api = $false },
        @{ Base = $PublicUrl; Path = '/eventos'; Api = $false },
        @{ Base = $PublicUrl; Path = '/promociones'; Api = $false },
        @{ Base = $ApiPublicUrl; Path = '/locales?limite=1'; Api = $true },
        @{ Base = $ApiPublicUrl; Path = '/eventos'; Api = $true },
        @{ Base = $ApiPublicUrl; Path = '/promociones'; Api = $true },
        @{ Base = $ApiPublicUrl; Path = '/rutas'; Api = $true }
    )

    foreach ($test in $tests) {
        $url = $test.Base.TrimEnd('/') + $test.Path
        $response = Invoke-DeploymentHttpRequest -Url $url
        if ([int]$response.StatusCode -ne 200) {
            throw "La prueba HTTP fallo para $($test.Path) con estado $($response.StatusCode)."
        }
        if ($response.Content -match '(?i)Stack trace|/home/|[A-Z]:\\|password') {
            throw "La respuesta expone informacion interna en $($test.Path)."
        }
        if ($response.RawHeaders -notmatch '(?im)^X-Content-Type-Options:\s*nosniff\s*$') {
            throw "Falta X-Content-Type-Options en $($test.Path)."
        }

        if ($test.Api) {
            try {
                $payload = $response.Content | ConvertFrom-Json
            } catch {
                throw "La API no devolvio JSON valido en $($test.Path)."
            }
        }

        Write-Host ("HTTP 200 {0}" -f $test.Path) -ForegroundColor Green
    }

    $expectedOrigin = $PublicUrl.TrimEnd('/')
    $corsResponse = Invoke-DeploymentHttpRequest -Url ($ApiPublicUrl.TrimEnd('/') + '/locales?limite=1') -Origin $expectedOrigin
    $escapedOrigin = [regex]::Escape($expectedOrigin)
    if ($corsResponse.RawHeaders -notmatch "(?im)^Access-Control-Allow-Origin:\s*$escapedOrigin\s*$") {
        throw "La API no autoriza el origen de produccion: $expectedOrigin"
    }
    Write-Host "CORS de produccion validado: $expectedOrigin" -ForegroundColor Green

}
