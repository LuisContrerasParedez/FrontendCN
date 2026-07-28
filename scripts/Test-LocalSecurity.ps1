[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$secretScanner = Join-Path $PSScriptRoot 'Test-Secrets.ps1'

function Assert-Condition {
    param([bool] $Condition, [string] $Message)

    if (-not $Condition) {
        throw $Message
    }
}

$gitignore = [IO.File]::ReadAllText((Join-Path $projectRoot '.gitignore'))
foreach ($exclusion in @('node_modules/', 'dist/', 'deploy/', '.tools/*', '.deploy-work/', '.env*', '*.pem', '*.ppk', '*.key')) {
    Assert-Condition $gitignore.Contains($exclusion) "Falta exclusion obligatoria: $exclusion"
}

Assert-Condition (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'api'))) 'El frontend todavia contiene la carpeta api.'

$envExample = [IO.File]::ReadAllText((Join-Path $projectRoot '.env.example'))
Assert-Condition ($envExample -match '(?m)^VITE_API_BASE_URL=https://wspagina\.centranorte\.com\.gt/api\s*$') 'La API de produccion debe utilizar el subdominio HTTPS independiente.'
Assert-Condition ($envExample -notmatch '(?m)^VITE_API_PROXY_TARGET=') '.env.example no debe mezclar el proxy local con produccion.'

$localExample = [IO.File]::ReadAllText((Join-Path $projectRoot '.env.local.example'))
Assert-Condition ($localExample -match '(?m)^VITE_API_PROXY_TARGET=http://127\.0\.0\.1:8080\s*$') 'El proxy local debe apuntar a WS_PaginaCN en PHP.'
Assert-Condition ($localExample -match '(?m)^VITE_API_BASE_URL=/api\s*$') 'El desarrollo local debe conservar el proxy /api.'

$localEnvPath = Join-Path $projectRoot '.env.local'
Assert-Condition (Test-Path -LiteralPath $localEnvPath -PathType Leaf) 'Falta .env.local para desarrollo.'
$localEnv = [IO.File]::ReadAllText($localEnvPath)
Assert-Condition ($localEnv -match '(?m)^VITE_API_BASE_URL=/api\s*$') '.env.local debe utilizar /api.'

$viteConfig = [IO.File]::ReadAllText((Join-Path $projectRoot 'vite.config.js'))
Assert-Condition ($viteConfig -match 'envDir:\s*false') 'Vite debe desactivar la carga implicita que mezcla .env.local en produccion.'

$apacheRules = [IO.File]::ReadAllText((Join-Path $projectRoot '.htaccess'))
Assert-Condition ($apacheRules.Contains('Strict-Transport-Security')) 'Falta HSTS en el frontend.'
Assert-Condition ($apacheRules.Contains('upgrade-insecure-requests')) 'Falta bloquear contenido HTTP mixto mediante CSP.'
Assert-Condition ($apacheRules.Contains('https://wspagina.centranorte.com.gt')) 'La CSP no permite el subdominio independiente del WS.'

$deployScript = [IO.File]::ReadAllText((Join-Path $projectRoot 'deploy.ps1'))
Assert-Condition ($deployScript -match 'for persistent in imagenes; do') 'El despliegue debe conservar unicamente imagenes.'
Assert-Condition ($deployScript -notmatch 'for persistent in imagenes api') 'El frontend no debe conservar una API anidada.'

$frontendFiles = Get-ChildItem -Path (Join-Path $projectRoot 'src'), (Join-Path $projectRoot 'public') -Recurse -Force -File
foreach ($file in $frontendFiles) {
    $content = [IO.File]::ReadAllText($file.FullName)
    Assert-Condition ($file.Extension -notin @('.php', '.sql')) "El frontend contiene un archivo de servidor: $($file.FullName)"
    Assert-Condition ($content -notmatch '(?i)db\.(?:local|production)?\.php|CN_DB_(?:USER|PASSWORD)') "El frontend referencia configuracion de base de datos: $($file.FullName)"
    Assert-Condition ($content -notmatch '(?i)VITE_[A-Z0-9_]*(?:PASSWORD|PASSWD|SECRET|TOKEN|PRIVATE_KEY|CREDENTIAL)') "El frontend contiene una variable VITE_ sensible: $($file.FullName)"
}

$distPath = Join-Path $projectRoot 'dist'
Assert-Condition (Test-Path -LiteralPath (Join-Path $distPath 'index.html') -PathType Leaf) 'dist/index.html no existe.'
Assert-Condition (Test-Path -LiteralPath (Join-Path $distPath 'assets') -PathType Container) 'dist/assets no existe.'
$serverFiles = @(Get-ChildItem -LiteralPath $distPath -Recurse -Force -File | Where-Object { $_.Extension -in @('.php', '.sql') })
Assert-Condition ($serverFiles.Count -eq 0) 'dist contiene archivos de servidor.'

foreach ($target in @((Join-Path $projectRoot 'src'), (Join-Path $projectRoot 'public'), $distPath)) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $secretScanner -Path $target
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo el analisis de secretos para: $target"
    }
}

Write-Host 'Validacion de seguridad del frontend completada.' -ForegroundColor Green
