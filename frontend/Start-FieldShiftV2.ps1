param([string]$RuntimeRoot = (Join-Path $PSScriptRoot '../../fieldshift-v2-runtime-cc674716'))
$ErrorActionPreference='Stop'
$runtime=(Resolve-Path -LiteralPath $RuntimeRoot).Path
if(Get-NetTCPConnection -State Listen -LocalPort 8182 -ErrorAction SilentlyContinue){
 $status=Invoke-RestMethod 'http://127.0.0.1:8182/api/v2/status' -TimeoutSec 3
 if($status.schema_version -ne 'fieldshift-2'){throw '8182 is occupied by an incompatible service.'}
 Write-Output 'Reusing FieldShift v2 on localhost:8182';return
}
$python=Join-Path $runtime '.venv-v2-runtime/Scripts/python.exe'
if(!(Test-Path -LiteralPath $python)){throw 'V2 runtime environment missing; see LOCAL_ACCEPTANCE.md.'}
$p=Start-Process -FilePath $python -ArgumentList '-X','utf8','-m','uvicorn','scripts.v2_api:app','--host','127.0.0.1','--port','8182' -WorkingDirectory $runtime -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtime 'api.stdout.log') -RedirectStandardError (Join-Path $runtime 'api.stderr.log') -PassThru
@{pid=$p.Id;port=8182;purpose='AgroTwin live v2 integration';startedUtc=$p.StartTime.ToUniversalTime().ToString('o');root=$runtime}|ConvertTo-Json|Set-Content (Join-Path $runtime 'api-process.json')
for($i=0;$i -lt 40;$i++) {try{$status=Invoke-RestMethod 'http://127.0.0.1:8182/api/v2/status' -TimeoutSec 2;if($status.schema_version -eq 'fieldshift-2'){Write-Output 'FieldShift v2 ready on localhost:8182';return}}catch{};Start-Sleep -Milliseconds 250}
throw 'FieldShift v2 did not become ready; inspect api.stderr.log.'
