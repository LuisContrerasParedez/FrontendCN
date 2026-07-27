[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $Path,

    [string] $ReferenceSecretFile
)

$ErrorActionPreference = 'Stop'

function Add-Finding {
    param(
        [System.Collections.Generic.List[object]] $List,
        [string] $File,
        [string] $Rule
    )

    [void] $List.Add([pscustomobject]@{
        File = $File
        Rule = $Rule
    })
}

$resolvedRoot = (Resolve-Path -LiteralPath $Path).Path
if (-not (Test-Path -LiteralPath $resolvedRoot -PathType Container)) {
    throw "La ruta a analizar no es una carpeta: $Path"
}

$referenceSecrets = New-Object 'System.Collections.Generic.List[string]'
if ($ReferenceSecretFile) {
    $resolvedReference = (Resolve-Path -LiteralPath $ReferenceSecretFile).Path
    $referenceContent = [System.IO.File]::ReadAllText($resolvedReference)
    $matches = [regex]::Matches(
        $referenceContent,
        '(?i)[''"](?:username|password)[''"]\s*=>\s*[''"]([^''"]+)[''"]'
    )

    foreach ($match in $matches) {
        $candidate = $match.Groups[1].Value
        if (($candidate.Length -ge 4) -and ($candidate -notmatch '^(TU_|PLACEHOLDER|CHANGE_ME)') -and (-not $referenceSecrets.Contains($candidate))) {
            [void] $referenceSecrets.Add($candidate)
        }
    }
}

$forbiddenNamePatterns = @(
    '(?i)^db\.(local|production)\.php$',
    '(?i)\.local\.php$',
    '(?i)^\.env(?:\..*)?$',
    '(?i)\.(pem|ppk|key|p12|pfx)$',
    '(?i)^id_(rsa|dsa|ecdsa|ed25519)$',
    '(?i)(password|secret|credential|token)',
    '(?i)\.(bak|backup|old|orig|save|sql|sqlite|7z)$'
)

$contentRules = @(
    [pscustomobject]@{
        Name = 'private-key'
        Pattern = '-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'
    },
    [pscustomobject]@{
        Name = 'credential-assignment'
        Pattern = '(?im)(?:password|passwd|pwd|secret|token|api[_-]?key)\s*(?:=>|=|:)\s*[''"](?!TU_|PLACEHOLDER|CHANGE_ME)[^''"\r\n]{6,}[''"]'
    },
    [pscustomobject]@{
        Name = 'environment-secret'
        Pattern = '(?im)^\s*(?:PASSWORD|PASSWD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)\s*=\s*(?!TU_|PLACEHOLDER|CHANGE_ME)[^\s#]{6,}\s*$'
    },
    [pscustomobject]@{
        Name = 'database-url-with-password'
        Pattern = '(?i)(?:mysql|mariadb):\/\/[^:\s]+:[^@\s]+@'
    },
    [pscustomobject]@{
        Name = 'known-token-format'
        Pattern = '(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{30,})'
    }
)

$textExtensions = @(
    '', '.css', '.conf', '.cmd', '.htaccess', '.html', '.ini', '.js', '.json',
    '.jsx', '.map', '.md', '.php', '.ps1', '.svg', '.txt', '.xml'
)

$findings = New-Object 'System.Collections.Generic.List[object]'
$files = Get-ChildItem -LiteralPath $resolvedRoot -Recurse -Force -File

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($resolvedRoot.Length).TrimStart('\', '/')

    foreach ($pattern in $forbiddenNamePatterns) {
        if ($file.Name -match $pattern) {
            Add-Finding -List $findings -File $relativePath -Rule 'forbidden-filename'
            break
        }
    }

    if ($file.Length -gt 10MB -or $textExtensions -notcontains $file.Extension.ToLowerInvariant()) {
        continue
    }

    $content = [System.IO.File]::ReadAllText($file.FullName)
    foreach ($rule in $contentRules) {
        if ($content -match $rule.Pattern) {
            Add-Finding -List $findings -File $relativePath -Rule $rule.Name
        }
    }

    foreach ($secret in $referenceSecrets) {
        if ($content.IndexOf($secret, [System.StringComparison]::Ordinal) -ge 0) {
            Add-Finding -List $findings -File $relativePath -Rule 'matches-local-secret'
            break
        }
    }
}

$uniqueFindings = @($findings | Sort-Object File, Rule -Unique)
if ($uniqueFindings.Count -gt 0) {
    Write-Host 'El analisis detecto archivos o contenido sensible. No se muestran los valores encontrados.' -ForegroundColor Red
    foreach ($finding in $uniqueFindings) {
        Write-Host ("  {0} [{1}]" -f $finding.File, $finding.Rule) -ForegroundColor Red
    }
    exit 1
}

Write-Host ("Analisis de secretos correcto: {0}" -f $resolvedRoot) -ForegroundColor Green
