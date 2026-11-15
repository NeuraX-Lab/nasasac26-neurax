[CmdletBinding(SupportsShouldProcess)]
param()
& (Join-Path $PSScriptRoot 'Stop-AgroTwinV4.ps1') -WhatIf:$WhatIfPreference
