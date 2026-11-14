param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$frontendRoot = $PSScriptRoot
$labRoot = [IO.Path]::GetFullPath((Join-Path $frontendRoot '../../neurax-fieldshift-lab'))
$pythonExecutable = Join-Path $labRoot '.venv/Scripts/python.exe'
$nodeCommand = Get-Command node -CommandType Application -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (!$nodeExecutable) {
    $candidates = @()
    if ($env:AGROTWIN_NODE) { $candidates += $env:AGROTWIN_NODE }
    $candidates += (Join-Path $env:ProgramFiles 'nodejs/node.exe')
    $candidates += (Join-Path $env:LOCALAPPDATA 'Programs/nodejs/node.exe')
    $candidates += (Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
    $runtimePackages = @(Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' -ErrorAction SilentlyContinue | Sort-Object Version -Descending)
    foreach ($runtime in $runtimePackages) { $candidates += (Join-Path $runtime.InstallLocation 'dependencies/node/bin/node.exe') }
    $nodeExecutable = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
if (!$nodeExecutable) { throw 'Node.js was not found. Install Node.js or set AGROTWIN_NODE to the full path of node.exe, then retry.' }
Write-Output "Using Node: $nodeExecutable"
if (!(Test-Path -LiteralPath $pythonExecutable) -or !(Test-Path -LiteralPath (Join-Path $frontendRoot 'node_modules/vite/bin/vite.js'))) {
    throw 'Install the sibling lab .venv and frontend dependencies first. See README.md.'
}
$logRoot = Join-Path $frontendRoot 'artifacts/local-demo'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$started = @()
function Wait-LocalService([string]$Uri) {
    for ($attempt=0; $attempt -lt 30; $attempt++) {
        try { return Invoke-WebRequest -Uri $Uri -TimeoutSec 2 -UseBasicParsing } catch { Start-Sleep -Milliseconds 300 }
    }
    throw "Local service did not become ready: $Uri. Inspect artifacts/local-demo."
}
if (Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue) {
    $registry = Invoke-RestMethod 'http://127.0.0.1:8000/v1/analysis/sources' -TimeoutSec 3
    if (!($registry.sources | Where-Object id -eq 'IMPLEMENTATION-POLICY')) { throw 'Port 8000 is occupied by another service.' }
} else {
    $service = Start-Process -FilePath $pythonExecutable -ArgumentList @('-m','uvicorn','neurax.api:app','--host','127.0.0.1','--port','8000') -WorkingDirectory $labRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logRoot 'api.log') -RedirectStandardError (Join-Path $logRoot 'api-error.log')
    $started += @{pid=$service.Id; role='api'; root=$labRoot; createdUtc=$service.StartTime.ToUniversalTime().ToString('o')}
    Wait-LocalService 'http://127.0.0.1:8000/v1/analysis/sources' | Out-Null
}
if (Get-NetTCPConnection -State Listen -LocalPort 5174 -ErrorAction SilentlyContinue) {
    $site = Invoke-WebRequest 'http://127.0.0.1:5174' -TimeoutSec 3 -UseBasicParsing
    if ($site.Content -notmatch 'AgroTwin') { throw 'Port 5174 is occupied by another app.' }
} else {
    $service = Start-Process -FilePath $nodeExecutable -ArgumentList @('node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5174','--strictPort') -WorkingDirectory $frontendRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logRoot 'frontend.log') -RedirectStandardError (Join-Path $logRoot 'frontend-error.log')
    $started += @{pid=$service.Id; role='frontend'; root=$frontendRoot; createdUtc=$service.StartTime.ToUniversalTime().ToString('o')}
    Wait-LocalService 'http://127.0.0.1:5174' | Out-Null
}
if ($started.Count) { ConvertTo-Json -InputObject @($started) | Set-Content -LiteralPath (Join-Path $logRoot 'started-processes.json') -Encoding utf8 }
Write-Output 'AgroTwin ready: http://127.0.0.1:5174 (local only). Stop foreground services with Ctrl+C; launcher-owned processes are listed in artifacts/local-demo/started-processes.json.'
if (!$NoBrowser) { Start-Process 'http://127.0.0.1:5174' }
