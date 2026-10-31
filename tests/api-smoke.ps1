$ErrorActionPreference = 'Stop'
$php = 'C:\xampp\php\php.exe'
Remove-Item -LiteralPath "$PSScriptRoot\..\var\smoke.sqlite" -ErrorAction SilentlyContinue
$env:KQ_DB_PATH = "$PSScriptRoot\..\var\smoke.sqlite"
& $php "$PSScriptRoot\..\bin\init-db.php" | Out-Null
$syntax = Get-ChildItem "$PSScriptRoot\..\app", "$PSScriptRoot\..\public", "$PSScriptRoot\..\bin" -Filter *.php -Recurse | ForEach-Object { & $php -l $_.FullName; if ($LASTEXITCODE) { throw "Syntax error in $($_.FullName)" } }
if (-not (Select-String -InputObject $syntax -Pattern 'No syntax errors' -Quiet)) { throw 'PHP lint did not run.' }
Write-Host 'PHP syntax and database bootstrap passed.'
