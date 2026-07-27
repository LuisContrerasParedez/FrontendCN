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
