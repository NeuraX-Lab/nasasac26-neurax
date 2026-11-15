param([switch]$NoBrowser)
& (Join-Path $PSScriptRoot 'Start-AgroTwinV4.ps1') -NoBrowser:$NoBrowser
