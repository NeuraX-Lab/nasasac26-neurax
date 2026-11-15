param([switch]$NoBrowser)
. (Join-Path $PSScriptRoot 'AgroTwinV4.Common.ps1')
& (Join-Path $PSScriptRoot 'Preflight-AgroTwinV4.ps1') -Prepare
$context = Get-DemoContext
New-Item -ItemType Directory -Force -Path $context.logs | Out-Null
$context | ConvertTo-Json | Set-Content (Join-Path $context.logs 'context.json') -Encoding utf8
Start-DemoService 'a1' 8000 $context.python @('-X','utf8','-m','uvicorn','neurax.api:app','--app-dir',('"'+$context.a1+'"'),'--host','127.0.0.1','--port','8000') $context.a1 $context
Start-DemoService 'v4' 8184 $context.python @('-X','utf8','-m','uvicorn','scripts.selected_v4_api:app','--app-dir',('"'+$context.lab+'"'),'--host','127.0.0.1','--port','8184') $context.lab $context
Start-DemoService 'frontend' 5174 $context.node @('node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5174','--strictPort') $context.frontend $context
Write-Host 'Services started/reused: http://127.0.0.1:5174/w/my-thanh/farmer'
Write-Host 'Run ./Test-AgroTwinV4.ps1 for demo verification. Connect USB by choosing its port at 115200 in Dashboard.'
if (!$NoBrowser) { Start-Process 'http://127.0.0.1:5174/w/my-thanh/farmer' }
