param(
    [Parameter(Mandatory = $true)]
    [string] $Url,
    [int[]] $Widths = @(360, 390, 768, 1024, 1280, 1440),
    [int] $Height = 900,
    [int] $WaitMilliseconds = 1800,
    [string] $ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',
    [string] $ScreenshotDir = '',
    [switch] $FullPage
)

$ErrorActionPreference = 'Stop'
$port = 9333
$profilePath = Join-Path $PSScriptRoot '..\.tools\chrome-responsive-cdp'
$chromeProcess = Start-Process -FilePath $ChromePath -ArgumentList @(
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    "--remote-debugging-port=$port",
    "--user-data-dir=$profilePath",
    'about:blank'
) -WindowStyle Hidden -PassThru

function Invoke-CdpCommand {
    param(
        [System.Net.WebSockets.ClientWebSocket] $Socket,
        [int] $Id,
        [string] $Method,
        [hashtable] $Params = @{}
    )

    $json = @{ id = $Id; method = $Method; params = $Params } | ConvertTo-Json -Depth 8 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $segment = [System.ArraySegment[byte]]::new($bytes)
    [void] $Socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()

    do {
        $message = [System.IO.MemoryStream]::new()
        do {
            $buffer = New-Object byte[] 65536
            $receiveSegment = [System.ArraySegment[byte]]::new($buffer)
            $result = $Socket.ReceiveAsync($receiveSegment, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
            $message.Write($buffer, 0, $result.Count)
        } while (-not $result.EndOfMessage)
        $responseText = [System.Text.Encoding]::UTF8.GetString($message.ToArray())
        $message.Dispose()
        $response = $responseText | ConvertFrom-Json
    } while ($response.id -ne $Id)

    return $response
}

try {
    $targets = $null
    for ($attempt = 0; $attempt -lt 20 -and $null -eq $targets; $attempt++) {
        try {
            $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json" -TimeoutSec 2
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    if ($null -eq $targets -or $targets.Count -eq 0) {
        throw 'Chrome no publicó un destino de depuración.'
    }

    $pageTarget = $targets | Where-Object { $_.type -eq 'page' -and $_.url -eq 'about:blank' } | Select-Object -First 1
    if ($null -eq $pageTarget) {
        $pageTarget = $targets | Where-Object { $_.type -eq 'page' -and $_.url -notlike 'chrome-extension://*' } | Select-Object -First 1
    }
    if ($null -eq $pageTarget) {
        throw 'Chrome no publicó una pestaña navegable.'
    }

    $socket = [System.Net.WebSockets.ClientWebSocket]::new()
    [void] $socket.ConnectAsync([Uri] $pageTarget.webSocketDebuggerUrl, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $commandId = 1
    [void] (Invoke-CdpCommand -Socket $socket -Id $commandId -Method 'Page.enable')

    if ($ScreenshotDir) {
        $ScreenshotDir = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $ScreenshotDir))
        [void] (New-Item -ItemType Directory -Path $ScreenshotDir -Force)
    }

    foreach ($width in $Widths) {
        $commandId++
        [void] (Invoke-CdpCommand -Socket $socket -Id $commandId -Method 'Emulation.setDeviceMetricsOverride' -Params @{
            width = $width
            height = $Height
            deviceScaleFactor = 1
            mobile = ($width -lt 768)
        })
        $commandId++
        $navigation = Invoke-CdpCommand -Socket $socket -Id $commandId -Method 'Page.navigate' -Params @{ url = $Url }
        if ($navigation.result.errorText -and $navigation.result.errorText -ne 'net::ERR_ABORTED') {
            throw ('Chrome no pudo abrir la URL: ' + $navigation.result.errorText)
        }
        Start-Sleep -Milliseconds $WaitMilliseconds
        $commandId++
        $evaluation = Invoke-CdpCommand -Socket $socket -Id $commandId -Method 'Runtime.evaluate' -Params @{
            expression = '(()=>{const menu=document.querySelector(".menu-toggle");const clientWidth=document.documentElement.clientWidth;const offenders=[...document.querySelectorAll("body *")].map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.right>clientWidth+.5||x.r.left<-.5).slice(0,10).map(x=>({tag:x.el.tagName.toLowerCase(),className:typeof x.el.className==="string"?x.el.className:"",left:Math.round(x.r.left),right:Math.round(x.r.right),width:Math.round(x.r.width)}));window.scrollTo({left:200,top:window.scrollY,behavior:"auto"});const horizontalScrollX=Math.round(window.scrollX);return {url:location.href,clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,horizontalScrollX,theme:document.body.dataset.theme,appReady:!!document.querySelector(".site-shell"),menuVisible:menu?getComputedStyle(menu).display!=="none":null,offenders}})()'
            returnByValue = $true
        }
        $value = $evaluation.result.result.value
        if ($null -eq $value) {
            throw ('Chrome no devolvió métricas: ' + ($evaluation | ConvertTo-Json -Depth 10 -Compress))
        }
        $valid = $value.appReady -and [int] $value.scrollWidth -le [int] $value.clientWidth -and [int] $value.bodyWidth -le [int] $value.clientWidth -and [int] $value.horizontalScrollX -eq 0
        Write-Output ("WIDTH={0} CLIENT={1} DOCUMENT={2} BODY={3} HSCROLL={4} THEME={5} MENU={6} APP={7} URL={8} OK={9}" -f $width, $value.clientWidth, $value.scrollWidth, $value.bodyWidth, $value.horizontalScrollX, $value.theme, $value.menuVisible, $value.appReady, $value.url, $valid)
        if (-not $valid) {
            Write-Output ('OFFENDERS=' + ($value.offenders | ConvertTo-Json -Depth 5 -Compress))
            throw "Se detectó desplazamiento horizontal a ${width}px."
        }
        if ($ScreenshotDir) {
            $commandId++
            $capture = Invoke-CdpCommand -Socket $socket -Id $commandId -Method 'Page.captureScreenshot' -Params @{
                format = 'png'
                fromSurface = $true
                captureBeyondViewport = [bool] $FullPage
            }
            $capturePath = Join-Path $ScreenshotDir ("responsive-{0}x{1}.png" -f $width, $Height)
            [System.IO.File]::WriteAllBytes($capturePath, [System.Convert]::FromBase64String($capture.result.data))
        }
    }

    $socket.Dispose()
} finally {
    Stop-Process -Id $chromeProcess.Id -Force -ErrorAction SilentlyContinue
}
