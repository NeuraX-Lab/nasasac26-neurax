param([switch]$Prepare)
. (Join-Path $PSScriptRoot 'AgroTwinV4.Common.ps1')
$context = Get-DemoContext
if ($Prepare) { Initialize-Demo $context }
New-Item -ItemType Directory -Force -Path $context.logs | Out-Null
$checks = @()
function Check([string]$Name, [scriptblock]$Action) {
    try { $detail = & $Action; $script:checks += [pscustomobject]@{name=$Name; status='PASS'; detail=($detail -join "`n")} }
    catch { $script:checks += [pscustomobject]@{name=$Name; status='BLOCKED'; detail=$_.Exception.Message} }
}
Check 'Node/frontend dependencies' {
    & $context.node --version
    foreach ($path in @('vite/bin/vite.js','typescript/bin/tsc','@playwright/test/cli.js')) {
        if (!(Test-Path (Join-Path $context.frontend "node_modules/$path"))) { throw "Missing $path; run Start with automatic preparation." }
    }
}
Check 'Python/backend dependencies' {
    if (!$context.python) { throw 'No V4 virtual environment; use Start-AgroTwinV4.ps1.' }
    & $context.python -X utf8 -c 'import sys,fastapi,pydantic,pandas,numpy,sklearn,uvicorn,httpx; print(sys.version); print(fastapi.__version__,pydantic.__version__,sklearn.__version__)'
    if ($LASTEXITCODE) { throw 'Python imports failed; use a compatible isolated environment.' }
}
Check 'Selected artifacts/data/evidence' {
    Push-Location $context.lab
    try {
        & $context.python -X utf8 -c 'from scripts.selected_v4_api import SelectedEngine,API_SHA256,CONTRACT_SHA256; e=SelectedEngine(); assert len(e.models)==6 and e.band_override is None; print(e.run_id, len(e.m), sum(e.rag.source_valid(c) for c in e.rag.cards), len(e.rag.cards))'
        if ($LASTEXITCODE) { throw 'V4 integration source/model/data verification failed. Use backend feat/v4-dashboard-api (c01519e or compatible), not the earlier selected API alone.' }
    } finally { Pop-Location }
}
Check 'A1/H1 source' {
    if (!(Test-Path (Join-Path $context.a1 'neurax/agrotwin/service.py'))) { throw 'Pinned A1 checkout absent; Start prepares it.' }
    if ((& git -C $context.a1 rev-parse HEAD) -ne $script:A1Pin) { throw 'A1 source pin differs.' }
    'A1/H1 pinned; independent from selected ML V4.'
}
foreach ($service in @(@('frontend',5174),@('a1',8000),@('v4',8184))) {
    $role=$service[0]; $port=[int]$service[1]
    Check "Port $port / $role" {
        if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) {
            Test-DemoIdentity $role $context | Out-Null; 'Compatible service running'
        } else { 'Port available; service will be started' }
    }
}
$v2 = @(Get-NetTCPConnection -State Listen -LocalPort 8182 -ErrorAction SilentlyContinue)
$ports = @([System.IO.Ports.SerialPort]::GetPortNames())
$devices = @(Get-CimInstance Win32_SerialPort -ErrorAction SilentlyContinue | Select-Object DeviceID,Name,PNPDeviceID)
$pnp = @(Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object { $_.Class -eq 'Ports' } | Select-Object Status,Class,FriendlyName)
$report = [pscustomobject]@{
    generated_at_utc=[DateTime]::UtcNow.ToString('o'); checks=$checks; context=$context
    legacy_8182_running=($v2.Count -gt 0); legacy_8182_required=$false
    serial_ports=$ports; serial_devices=$devices; serial_pnp=$pnp
    hardware_verification='NOT_TESTED'; usb_permission='User gesture required in Chromium; never bypassed'
    browser='Use Chrome/Edge on localhost; Web Serial is checked again by the browser smoke test'
    readiness=$(if ($checks.status -contains 'BLOCKED') {'NOT_READY'} else {'PARTIAL'})
}
$report | ConvertTo-Json -Depth 12 | Set-Content (Join-Path $context.logs 'preflight.json') -Encoding utf8
$checks | Format-Table name,status,detail -Wrap
Write-Host "Preflight: $($report.readiness). Serial ports: $($ports -join ', '). Physical board-to-browser verification is separate."
if ($checks.status -contains 'BLOCKED') { throw 'Preflight blocked. Read artifacts/local-demo-v4/preflight.json.' }
