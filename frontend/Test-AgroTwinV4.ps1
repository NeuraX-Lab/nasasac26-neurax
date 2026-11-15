param([switch]$ApiOnly, [string]$HardwareEvidence)
. (Join-Path $PSScriptRoot 'AgroTwinV4.Common.ps1')
$context = Get-DemoContext
New-Item -ItemType Directory -Force -Path $context.logs | Out-Null
$failures = @(); $verified = @(); $browserPassed = $false
try {
    foreach ($role in @('a1','v4','frontend')) { Test-DemoIdentity $role $context | Out-Null }
    $verified += 'Service identities'
    $status = Get-DemoJson 'http://127.0.0.1:5174/api/v4/status'
    if ($status.evidence_sources.status -ne 'ready' -or $status.model_count -ne 6) { throw 'Incomplete selected artifacts/evidence.' }
    $verified += 'Six selected artifacts and evidence bytes'
    foreach ($name in @('overview','forecasts','metrics','evidence')) {
        $value = Get-DemoJson "http://127.0.0.1:5174/api/v4/$name"
        if ($value.selected_system -ne 'v4' -or $value.api_schema_version -ne 'fieldshift-dashboard-1') { throw "Unexpected $name provider/schema." }
        if ($name -in 'overview','forecasts' -and $value.forecasts.Count -ne 6) { throw "Incomplete $name forecasts." }
        if ($name -eq 'metrics' -and $value.independent_test -ne $false) { throw 'Metrics lost the reused-test limitation.' }
        if ($name -eq 'evidence' -and !$value.cards.Count) { throw 'Evidence corpus empty.' }
        $value | ConvertTo-Json -Depth 40 | Set-Content (Join-Path $context.logs "http-$name.json") -Encoding utf8
    }
    $verified += 'Overview/forecasts/metrics/evidence HTTP contracts'
    $body = @{region_id='MT-BLOCK-01';farm=@{current_crop='rice';goal='water';irrigation='limited';drainage='poor';window_start='2026-12-01';window_end='2027-02-28'};question='T2M'} | ConvertTo-Json
    $http = Invoke-WebRequest 'http://127.0.0.1:5174/api/v4/analyze' -Method Post -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing -TimeoutSec 30
    $raw = [Text.Encoding]::UTF8.GetString($http.RawContentStream.ToArray())
    $result = $raw | ConvertFrom-Json
    if ($result.selected_system -ne 'v4' -or $result.run_id -notmatch '^v4-[a-f0-9]{32}$' -or
        $result.inference.execution_mode -ne 'fresh_model_inference' -or $result.inference.cached -ne $false -or
        $result.inference.prediction_count -ne 6 -or $result.forecasts.Count -ne 6 -or $result.question -ne 'T2M') { throw 'Fresh V4 inference receipt invalid.' }
    foreach ($f in $result.forecasts) {
        if ($null -eq $f.value -or $f.lower -gt $f.value -or $f.value -gt $f.upper -or $f.coverage_guaranteed -ne $false -or
            $f.uncertainty_method -ne 'v3 pooled empirical bands') { throw 'Invalid forecast bounds/uncertainty.' }
    }
    if (!$result.rag.source_bytes_verified -or !$result.rag.citations.Count) { throw 'No verified RAG citation.' }
    if (($result.decision.options | Where-Object {$_.id -in 'R1','R2' -and $_.status -eq 'blocked'}).Count -ne 2) { throw 'Drainage constraint did not block R1/R2.' }
    $raw | Set-Content (Join-Path $context.logs 'http-analysis.json') -Encoding utf8
    $verified += @('Fresh V4 inference','Research forecasts/pooled intervals','Verified RAG citations','Rotation constraints')
    if (!$ApiOnly) {
        Push-Location $context.frontend
        try {
            $process = Start-Process -FilePath $context.node -ArgumentList @('node_modules/@playwright/test/cli.js','test','tests/e2e/live-v4.spec.ts','--trace','on','--output','artifacts/local-demo-v4/browser-results','--reporter','json') -WorkingDirectory $context.frontend -WindowStyle Hidden -Wait -PassThru `
                -RedirectStandardOutput (Join-Path $context.logs 'browser-report.json') -RedirectStandardError (Join-Path $context.logs 'browser-stderr.log')
            if ($process.ExitCode) { throw 'Browser verification failed; inspect browser-report.json and browser-results traces.' }
            $browserPassed = $true
            $verified += 'Dashboard end-to-end, persistence, mobile, EN/VI, Web Serial capability'
        } finally { Pop-Location }
    }
} catch { $failures += $_.Exception.Message }
$hardware = $null
if ($HardwareEvidence) {
    try {
        $receiptPath = (Resolve-Path -LiteralPath $HardwareEvidence).Path
        $hardware = Get-Content -LiteralPath $receiptPath -Raw -Encoding utf8 | ConvertFrom-Json
        $age = [DateTime]::UtcNow - ([DateTime]$hardware.captured_at_utc).ToUniversalTime()
        if ($hardware.verification -ne 'PHYSICAL_HARDWARE_VERIFIED' -or !$hardware.user_granted_web_serial -or
            !$hardware.live_updates_observed -or !$hardware.reconnect_owner_confirmed -or $age.TotalHours -gt 24 -or $age.TotalSeconds -lt 0) {
            throw 'Hardware receipt must describe observed real USB, user permission and reconnect, within 24 hours.'
        }
        if ($hardware.native_port -notin @([IO.Ports.SerialPort]::GetPortNames())) { throw 'Referenced physical serial device is not currently enumerated.' }
        $device = @(Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object {
            $_.Status -eq 'OK' -and $_.InstanceId -like "*VID_$($hardware.usb_vendor_id)&PID_$($hardware.usb_product_id)*"
        })
        if (!$device.Count) { throw 'No healthy physical USB device matching the receipt VID/PID is present.' }
        foreach ($item in $hardware.files) {
            $path = Join-Path (Split-Path $receiptPath) $item.path
            if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256) { throw 'Hardware evidence hash mismatch.' }
        }
    } catch { $failures += $_.Exception.Message; $hardware = $null }
}
$report = [pscustomobject]@{
    generated_at_utc=[DateTime]::UtcNow.ToString('o')
    readiness=$(if ($failures.Count) {'NOT_READY'} elseif ($browserPassed -and $hardware) {'READY'} else {'PARTIAL'})
    software=$(if ($failures.Count) {'FAIL'} elseif ($browserPassed) {'SOFTWARE_VERIFIED'} else {'API_ONLY'})
    physical_hardware=$(if ($hardware) {'PHYSICAL_HARDWARE_VERIFIED (referenced manual Web Serial receipt)'} else {'NOT_TESTED by this automated test; browser mocks never certify hardware'})
    physical_receipt=$HardwareEvidence
    serial_ports=@([IO.Ports.SerialPort]::GetPortNames()); verified=$verified; failures=$failures
    run_id=$(if ($result) {$result.run_id} else {$null})
    remaining=$(if ($hardware -and $browserPassed) {'Research demo only; calibration, field location and agronomic validity remain unverified'} else {'Supply recent physical Web Serial evidence after user-authorized observation; otherwise keep PARTIAL'})
}
$report | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $context.logs 'readiness.json') -Encoding utf8
$report | Format-List
if ($failures.Count) { throw ($failures -join '; ') }
