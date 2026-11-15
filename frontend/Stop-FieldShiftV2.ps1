[CmdletBinding(SupportsShouldProcess)]
param([string]$RuntimeRoot=(Join-Path $PSScriptRoot '../../fieldshift-v2-runtime-cc674716'))
$ErrorActionPreference='Stop'
$runtime=(Resolve-Path -LiteralPath $RuntimeRoot).Path
$file=Join-Path $runtime 'api-process.json'
if(!(Test-Path -LiteralPath $file)){Write-Output 'No owned v2 process recorded.';return}
$entry=Get-Content -LiteralPath $file -Raw|ConvertFrom-Json
$root=Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$entry.pid)" -ErrorAction SilentlyContinue
if(!$root){Write-Output 'Recorded v2 process has exited.';return}
$expected='-m uvicorn scripts.v2_api:app --host 127.0.0.1 --port 8182'
if(!$root.CommandLine.Contains($runtime) -or !$root.CommandLine.Contains($expected)){throw 'V2 process identity changed; refusing to stop.'}
$stamp=if($entry.createdUtc){$entry.createdUtc}else{$entry.started}
if(!$stamp){throw 'No creation timestamp; refusing to stop.'}
$date=if($stamp -is [DateTime]){$stamp.ToUniversalTime()}else{[DateTime]::Parse($stamp,[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime()}
if([Math]::Abs(($root.CreationDate.ToUniversalTime()-$date).TotalSeconds) -gt 2){throw 'V2 PID was reused; refusing to stop.'}
$children=@(Get-CimInstance Win32_Process -Filter "ParentProcessId=$([int]$entry.pid)" -ErrorAction SilentlyContinue | Where-Object Name -ne 'conhost.exe')
foreach($child in $children){if(!$child.CommandLine.Contains($expected)){throw 'Unexpected child process; refusing to stop.'}}
foreach($process in @($children)+@($root)){if($PSCmdlet.ShouldProcess("v2 PID $($process.ProcessId)",'Stop owned localhost service')){Stop-Process -Id ([int]$process.ProcessId) -ErrorAction SilentlyContinue}}
