$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$env:PATH = "$root/.runtime/node;" + $env:PATH
$env:PLAYWRIGHT_BROWSERS_PATH = "$root/.runtime/browsers"
& "$root/.runtime/node/node.exe" "$root/scripts/build.mjs" @args
exit $LASTEXITCODE
