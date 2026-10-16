$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$version = 'v24.22.0'
$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString() -eq 'Arm64') { 'arm64' } else { 'x64' }
New-Item -ItemType Directory -Force "$root/.runtime" | Out-Null
if (!(Test-Path "$root/.runtime/node/node.exe")) {
  $file = "node-$version-win-$arch.zip"
  $temp = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString())
  New-Item -ItemType Directory $temp | Out-Null
  try {
    Invoke-WebRequest "https://nodejs.org/dist/$version/$file" -OutFile "$temp/$file"
    $sums = (Invoke-WebRequest "https://nodejs.org/dist/$version/SHASUMS256.txt").Content
    $expected = (($sums -split "`n" | Where-Object { $_.Trim().EndsWith("  $file") }) -split '\s+')[0]
    if (!$expected -or (Get-FileHash "$temp/$file" -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw 'Checksum failed' }
    Expand-Archive "$temp/$file" $temp
    Move-Item "$temp/node-$version-win-$arch" "$root/.runtime/node"
  } finally { Remove-Item $temp -Recurse -Force }
}
$env:PATH = "$root/.runtime/node;" + $env:PATH
$env:PLAYWRIGHT_BROWSERS_PATH = "$root/.runtime/browsers"
Push-Location $root
try {
  & "$root/.runtime/node/npm.cmd" ci --no-audit --no-fund
  if ($LASTEXITCODE) { throw 'npm ci failed' }
  & node node_modules/playwright/cli.js install chromium
  if ($LASTEXITCODE) { throw 'Chromium installation failed' }
  & node scripts/doctor.mjs
  if ($LASTEXITCODE) { throw 'Browser smoke test failed' }
} finally { Pop-Location }
