$ErrorActionPreference = 'Stop'
$script:DemoFrontend = $PSScriptRoot
$script:DemoLogs = Join-Path $PSScriptRoot 'artifacts/local-demo-v4'
$script:A1Pin = '54bce495514fb3235fe7bd2d0df4ab001f74cca0'

function Get-DemoContext {
    $lab = $env:AGROTWIN_LAB_ROOT
    if (!$lab) {
        $ancestor = [IO.DirectoryInfo]$PSScriptRoot
        for ($i=0; $i -lt 6 -and $ancestor; $i++) {
            $candidate = Join-Path $ancestor.FullName 'neurax-fieldshift-lab'
            if (Test-Path (Join-Path $candidate 'scripts/selected_v4_api.py')) { $lab = $candidate; break }
            $ancestor = $ancestor.Parent
        }
    }
    if (!$lab) { throw 'Set AGROTWIN_LAB_ROOT to the selected V4 backend checkout.' }
    $lab = [IO.Path]::GetFullPath($lab)
    $a1 = $env:AGROTWIN_A1_ROOT
    if (!$a1) { $a1 = Join-Path $PSScriptRoot '../.agrotwin-runtime/a1' }
    $python = $env:AGROTWIN_PYTHON
    if (!$python) {
        $python = @('.venv-geo-eda/Scripts/python.exe','.venv-dashboard-v4/Scripts/python.exe','.venv/Scripts/python.exe') |
            ForEach-Object { Join-Path $lab $_ } | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }
    $node = $env:AGROTWIN_NODE
    if (!$node) { $command = Get-Command node -CommandType Application -ErrorAction SilentlyContinue; if ($command) { $node = $command.Source } }
    if (!$node) { throw 'Node.js was not found. Install Node or set AGROTWIN_NODE.' }
    [pscustomobject]@{ frontend=$PSScriptRoot; lab=$lab; a1=[IO.Path]::GetFullPath($a1); python=$python; node=$node; logs=$script:DemoLogs }
}

function Initialize-Demo($Context) {
    if (!(Test-Path (Join-Path $Context.a1 'neurax/agrotwin/service.py'))) {
        if (Test-Path -LiteralPath $Context.a1) { throw 'A1 path exists without compatible source; refusing to overwrite.' }
        & git -C $Context.lab cat-file -e $script:A1Pin 2>$null
        if ($LASTEXITCODE) {
            & git -C $Context.lab fetch origin ai/v5-viet-handoff
            if ($LASTEXITCODE) { throw 'Could not fetch the pinned A1/H1 source.' }
        }
        & git -C $Context.lab worktree add --detach $Context.a1 $script:A1Pin
        if ($LASTEXITCODE) { throw 'Could not create isolated A1/H1 worktree.' }
    }
    $actual = & git -C $Context.a1 rev-parse HEAD
    if ($actual -ne $script:A1Pin) { throw "A1/H1 must use pinned commit $script:A1Pin." }
    if (!$Context.python) {
        $Context.python = Join-Path $Context.lab '.venv-dashboard-v4/Scripts/python.exe'
        & python -m venv (Join-Path $Context.lab '.venv-dashboard-v4')
        if ($LASTEXITCODE) { throw 'Python venv creation failed.' }
        & $Context.python -m pip install -r (Join-Path $Context.lab 'integration/requirements-dashboard-v4.txt')
        if ($LASTEXITCODE) { throw 'V4 dependency install failed; inspect pip output.' }
    }
    if (!(Test-Path (Join-Path $Context.frontend 'node_modules/vite/bin/vite.js'))) {
        Push-Location $Context.frontend
        try { & npm ci; if ($LASTEXITCODE) { throw 'npm ci failed.' } } finally { Pop-Location }
    }
    if (!(Test-Path (Join-Path $Context.lab 'runs/research-selected/artifact-manifest.json'))) {
        & $Context.python -X utf8 (Join-Path $Context.lab 'scripts/install_selected_v4.py') --repo $Context.lab
        if ($LASTEXITCODE) { throw 'Install the verified selected-V4 runtime bundle; no output can be fabricated.' }
    }
}

function Get-DemoJson([string]$Uri) {
    $response = Invoke-WebRequest -Uri $Uri -TimeoutSec 8 -UseBasicParsing
    [Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray()) | ConvertFrom-Json
}
function Test-DemoIdentity([string]$Role, $Context) {
    switch ($Role) {
        'v4' {
            $value = Get-DemoJson 'http://127.0.0.1:8184/api/v4/status'
            $hash = (Get-FileHash (Join-Path $Context.lab 'scripts/selected_v4_api.py') -Algorithm SHA256).Hash.ToLowerInvariant()
            $contractHash = (Get-FileHash (Join-Path $Context.lab 'scripts/selected_v4_contract.py') -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($value.service -ne 'agrotwin-selected-v4' -or $value.selected_system -ne 'v4' -or
                $value.api_schema_version -ne 'fieldshift-dashboard-1' -or $value.model_count -ne 6 -or
                $value.implementation_sha256 -ne $hash -or $value.contract_sha256 -ne $contractHash -or [IO.Path]::GetFullPath($value.runtime_root) -ne $Context.lab) {
                throw 'Port 8184 has an incompatible V4 service.'
            }
        }
        'a1' {
            $value = Get-DemoJson 'http://127.0.0.1:8000/v1/analysis/sources'
            $expected = Get-Content (Join-Path $Context.a1 'neurax/resources/agrotwin/sources.json') -Raw -Encoding utf8 | ConvertFrom-Json
            if ($value.version -ne $expected.version -or
                ($value.sources | ConvertTo-Json -Depth 20 -Compress) -ne ($expected.sources | ConvertTo-Json -Depth 20 -Compress)) {
                throw 'Port 8000 has an incompatible A1/H1 source registry.'
            }
        }
        'frontend' {
            $value = Get-DemoJson 'http://127.0.0.1:5174/__agrotwin_demo'
            if ($value.selected_system -ne 'v4' -or [IO.Path]::GetFullPath($value.root) -ne $Context.frontend) {
                throw 'Port 5174 belongs to another checkout or provider.'
            }
        }
        default { throw 'Unknown service role.' }
    }
    return $true
}

function Expand-DemoOwned($Value) {
    if ($null -eq $Value) { return }
    if ($Value -is [Array]) { foreach ($item in $Value) { Expand-DemoOwned $item }; return }
    if ($Value.PSObject.Properties['pid']) { Write-Output $Value; return }
    # Windows PowerShell can serialize an annotated JSON array as value/Count.
    if ($Value.PSObject.Properties['value']) { Expand-DemoOwned $Value.value; return }
    throw 'Unrecognized ownership record; refusing to discard it.'
}
function Get-DemoOwned {
    $manifest = Join-Path $script:DemoLogs 'owned-processes.json'
    if (Test-Path $manifest) { Expand-DemoOwned (Get-Content $manifest -Raw | ConvertFrom-Json) }
}
function Save-DemoOwned($Entries) {
    New-Item -ItemType Directory -Force -Path $script:DemoLogs | Out-Null
    $json = @(Expand-DemoOwned $Entries | ForEach-Object { ConvertTo-Json -InputObject $_ -Depth 10 -Compress })
    ('[' + ($json -join ',') + ']') | Set-Content (Join-Path $script:DemoLogs 'owned-processes.json') -Encoding utf8
}

function Start-DemoService([string]$Role, [int]$Port, [string]$Executable, [string[]]$Arguments, [string]$Root, $Context) {
    if (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue) {
        Test-DemoIdentity $Role $Context | Out-Null
        Write-Host "Reusing compatible $Role on $Port; it will not be newly claimed."
        return
    }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $p = Start-Process -FilePath $Executable -ArgumentList $Arguments -WorkingDirectory $Root -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $Context.logs "$Role-$stamp.log") -RedirectStandardError (Join-Path $Context.logs "$Role-$stamp-error.log")
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($p.Id)"
    $entry = [pscustomobject]@{ pid=$p.Id; role=$Role; root=$Root; createdUtc=$process.CreationDate.ToUniversalTime().ToString('o'); commandLine=$process.CommandLine }
    $manifest = Join-Path $Context.logs 'owned-processes.json'
    $entries = @(Get-DemoOwned)
    $entries += $entry
    Save-DemoOwned $entries # Persist ownership before waiting, including failed startup.
    for ($i=0; $i -lt 60; $i++) {
        try { Test-DemoIdentity $Role $Context | Out-Null; return } catch { Start-Sleep -Milliseconds 500 }
    }
    throw "$Role did not become ready on $Port. See $($Context.logs); Stop-AgroTwinV4 only stops owned processes."
}
