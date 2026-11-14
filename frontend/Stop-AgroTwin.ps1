$ErrorActionPreference = 'Stop'
$manifest = Join-Path $PSScriptRoot 'artifacts/local-demo/started-processes.json'
if (!(Test-Path -LiteralPath $manifest)) { Write-Output 'No launcher-owned process manifest; no services stopped.'; return }
foreach ($entry in @(Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json)) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$entry.pid)" -ErrorAction SilentlyContinue
    if (!$process) { continue }
    $expected = if ($entry.role -eq 'api') { 'uvicorn neurax.api:app --host 127.0.0.1 --port 8000' } elseif ($entry.role -eq 'frontend') { 'node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort' } else { throw 'Unknown process role; refusing to stop.' }
    if (!$process.CommandLine.Contains($expected)) { throw "PID $($entry.pid) changed ownership; refusing to stop." }
    # PID plus recorded creation time protects against stopping an unrelated reused PID.
    if (!$entry.createdUtc -or [Math]::Abs(($process.CreationDate.ToUniversalTime()-[DateTime]::Parse($entry.createdUtc).ToUniversalTime()).TotalSeconds) -gt 1) { throw 'Process creation time differs; refusing to stop.' }
    Stop-Process -Id ([int]$entry.pid)
    Write-Output "Stopped launcher-owned $($entry.role) PID $($entry.pid)."
}
