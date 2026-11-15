[CmdletBinding(SupportsShouldProcess)]
param()
. (Join-Path $PSScriptRoot 'AgroTwinV4.Common.ps1')
$manifest = Join-Path $script:DemoLogs 'owned-processes.json'
if (!(Test-Path $manifest)) { Write-Host 'No owned process manifest; nothing stopped.'; return }
$remaining = @()
foreach ($entry in @(Get-DemoOwned)) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$entry.pid)" -ErrorAction SilentlyContinue
    if (!$process) { continue }
    $recorded = ([DateTime]$entry.createdUtc).ToUniversalTime()
    if (!$entry.commandLine -or $process.CommandLine -ne $entry.commandLine -or
        [Math]::Abs(($process.CreationDate.ToUniversalTime()-$recorded).TotalSeconds) -gt 1) {
        Write-Warning "PID $($entry.pid) ownership differs; not stopped."
        $remaining += $entry; continue
    }
    # A Windows virtualenv Python launcher may own a child interpreter.
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$([int]$entry.pid)" -ErrorAction SilentlyContinue)
    foreach ($child in $children) {
        if ($child.CommandLine -and $child.CommandLine.Contains('--app-dir') -and $child.CommandLine.Contains($entry.root) -and
            $child.CreationDate -ge $process.CreationDate -and $child.Name -match '^python(w)?\.exe$') {
            if ($PSCmdlet.ShouldProcess("$($entry.role) child PID $($child.ProcessId)",'Stop launcher-owned service')) { Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue }
        }
    }
    if ($PSCmdlet.ShouldProcess("$($entry.role) PID $($entry.pid)",'Stop launcher-owned service')) {
        Stop-Process -Id ([int]$entry.pid) -ErrorAction SilentlyContinue
    } else { $remaining += $entry }
}
if (!$WhatIfPreference) { Save-DemoOwned $remaining }
