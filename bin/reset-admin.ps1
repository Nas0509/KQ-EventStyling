$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$phpPath = 'C:\Users\langc\Downloads\php-8.5.12-1-nts-Win32-vs17-x64\php.exe'
if (-not (Test-Path -LiteralPath $phpPath)) {
    $phpCommand = Get-Command php.exe -ErrorAction SilentlyContinue
    if ($phpCommand) { $phpPath = $phpCommand.Source }
}
if (-not (Test-Path -LiteralPath $phpPath)) {
    Write-Error 'Hindi makita ang php.exe. I-check ang PHP folder at subukang muli.'
    exit 1
}
$securePassword = Read-Host 'Bagong admin password (12+ characters, uppercase/lowercase at number)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:KQ_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    & $phpPath (Join-Path $PSScriptRoot 'reset-admin.php')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    Remove-Item Env:KQ_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    $securePassword.Dispose()
}
