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
Assert-Condition ($envExample -match '(?m)^VITE_SITE_URL=https://centranorte\.com\.gt\s*$') 'El origen canonico de produccion no es el esperado.'
Assert-Condition ($envExample -notmatch '(?im)^VITE_SITE_URL=https?://[^/\s]*beta[^/\s]*') 'La plantilla de produccion conserva un dominio beta.'
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
Assert-Condition ($viteConfig -notmatch '(?i)https?://[^/\s]*beta[^/\s]*') 'Vite conserva una URL beta quemada.'

$apacheRules = [IO.File]::ReadAllText((Join-Path $projectRoot '.htaccess'))
Assert-Condition ($apacheRules.Contains('Strict-Transport-Security')) 'Falta HSTS en el frontend.'
Assert-Condition ($apacheRules.Contains('upgrade-insecure-requests')) 'Falta bloquear contenido HTTP mixto mediante CSP.'
Assert-Condition ($apacheRules.Contains('https://wspagina.centranorte.com.gt')) 'La CSP no permite el subdominio independiente del WS.'
Assert-Condition ($apacheRules.Contains('https://www.googletagmanager.com')) 'La CSP no permite Google Tag Manager.'
Assert-Condition ($apacheRules.Contains('https://*.google-analytics.com')) 'La CSP no permite las conexiones de Google Analytics.'

$sourceIndex = [IO.File]::ReadAllText((Join-Path $projectRoot 'index.html'))
$gtmContainerId = 'GTM-N7HCM3QF'
$gaMeasurementId = 'G-F4QC3V325B'
$inlineScriptPattern = '(?is)<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>'

function Get-InlineScriptHash {
    param([string] $Code)

    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        return 'sha256-' + [Convert]::ToBase64String($sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($Code)))
    } finally {
        $sha256.Dispose()
    }
}

# La CSP no lleva 'unsafe-inline': cada script en linea entra por su propio
# hash. La revision es entonces que ninguno quede fuera de la lista, no que
# haya uno solo. El conteo sigue siendo estricto para que sumar un tercero sea
# una decision explicita y no un descuido.
$sourceInlineScripts = [regex]::Matches($sourceIndex, $inlineScriptPattern)
Assert-Condition ($sourceInlineScripts.Count -eq 2) 'index.html debe contener unicamente los dos cargadores inline autorizados: GTM y gtag.'
foreach ($inlineScript in $sourceInlineScripts) {
    $hash = Get-InlineScriptHash $inlineScript.Groups[1].Value
    Assert-Condition ($apacheRules.Contains("'$hash'")) "La CSP no contiene el hash vigente de un script inline de index.html: $hash"
}
Assert-Condition (@($sourceInlineScripts | Where-Object { $_.Groups[1].Value.Contains($gtmContainerId) }).Count -eq 1) 'El cargador inline no corresponde al contenedor GTM autorizado.'
Assert-Condition (@($sourceInlineScripts | Where-Object { $_.Groups[1].Value.Contains($gaMeasurementId) }).Count -eq 1) 'La etiqueta inline de gtag no corresponde a la medicion autorizada.'
Assert-Condition ($sourceIndex.Contains("gtag/js?id=$gaMeasurementId")) 'Falta el cargador de gtag.js de la medicion autorizada.'
Assert-Condition ($sourceIndex -match '(?is)<body[^>]*>\s*<!-- Google Tag Manager \(noscript\) -->\s*<noscript>') 'El fallback noscript de GTM debe aparecer inmediatamente despues de body.'
Assert-Condition ($sourceIndex.Contains("ns.html?id=$gtmContainerId")) 'El fallback noscript no corresponde al contenedor GTM autorizado.'

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
$distIndex = [IO.File]::ReadAllText((Join-Path $distPath 'index.html'))
# Lo que sirve Apache es dist, no la fuente: si el build reformateara un script
# en linea, su hash dejaria de coincidir y la CSP lo bloquearia en produccion.
$distInlineScripts = [regex]::Matches($distIndex, $inlineScriptPattern)
Assert-Condition ($distInlineScripts.Count -eq 2) 'dist/index.html debe contener unicamente los dos cargadores inline autorizados: GTM y gtag.'
foreach ($inlineScript in $distInlineScripts) {
    $hash = Get-InlineScriptHash $inlineScript.Groups[1].Value
    Assert-Condition ($apacheRules.Contains("'$hash'")) "La CSP no autoriza un script inline generado en dist: $hash"
}
Assert-Condition (@($distInlineScripts | Where-Object { $_.Groups[1].Value.Contains($gtmContainerId) }).Count -eq 1) 'El build no contiene el cargador GTM autorizado.'
Assert-Condition ($distIndex.Contains("gtag/js?id=$gaMeasurementId")) 'El build no contiene el cargador de gtag.js autorizado.'
$serverFiles = @(Get-ChildItem -LiteralPath $distPath -Recurse -Force -File | Where-Object { $_.Extension -in @('.php', '.sql') })
Assert-Condition ($serverFiles.Count -eq 0) 'dist contiene archivos de servidor.'

foreach ($target in @((Join-Path $projectRoot 'src'), (Join-Path $projectRoot 'public'), $distPath)) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $secretScanner -Path $target
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo el analisis de secretos para: $target"
    }
}

Write-Host 'Validacion de seguridad del frontend completada.' -ForegroundColor Green
