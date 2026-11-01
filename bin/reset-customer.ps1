$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$phpPath = Join-Path $env:USERPROFILE 'Downloads\php-8.5.12-1-nts-Win32-vs17-x64\php.exe'
if (-not (Test-Path -LiteralPath $phpPath)) {
    $phpCommand = Get-Command php.exe -ErrorAction SilentlyContinue
    if ($phpCommand) { $phpPath = $phpCommand.Source }
}
if (-not (Test-Path -LiteralPath $phpPath)) {
    Write-Error 'Hindi makita ang php.exe. I-check ang PHP folder at subukang muli.'
    exit 1
}

$email = (Read-Host 'Email address ng customer account na ire-reset').Trim()
if ($email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw 'Maglagay ng valid na email address.' }
$securePassword = Read-Host 'Bagong password (12+ characters, uppercase/lowercase, number at symbol)' -AsSecureString
$secureConfirm = Read-Host 'Ulitin ang bagong password' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$confirmPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConfirm)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $confirm = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($confirmPointer)
    if ($password -cne $confirm) { throw 'Hindi magkapareho ang dalawang password. Walang binago.' }
    $env:KQ_CUSTOMER_EMAIL = $email
    $env:KQ_CUSTOMER_PASSWORD = $password
    Set-Location -LiteralPath $projectRoot
    & $phpPath (Join-Path $PSScriptRoot 'reset-customer.php')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmPointer)
    Remove-Item Env:KQ_CUSTOMER_PASSWORD, Env:KQ_CUSTOMER_EMAIL -ErrorAction SilentlyContinue
    $securePassword.Dispose()
    $secureConfirm.Dispose()
}
