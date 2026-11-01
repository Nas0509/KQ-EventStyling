$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$phpCommand = Get-Command php.exe -ErrorAction SilentlyContinue
$phpPath = if ($phpCommand) { $phpCommand.Source } else { $null }
if (-not $phpPath) {
    $downloadFolder = Join-Path $env:USERPROFILE 'Downloads'
    $phpFolder = Get-ChildItem -LiteralPath $downloadFolder -Directory -Filter 'php-*-nts-Win*-x64' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($phpFolder) { $phpPath = Join-Path $phpFolder.FullName 'php.exe' }
}
if (-not $phpPath -or -not (Test-Path -LiteralPath $phpPath)) {
    throw 'Hindi makita ang php.exe. Ilagay ang PHP sa PATH o sa Downloads folder.'
}

$phpRoot = Split-Path -Parent $phpPath
$extensionDirectory = Join-Path $phpRoot 'ext'
foreach ($extension in @('php_openssl.dll', 'php_fileinfo.dll')) {
    if (-not (Test-Path -LiteralPath (Join-Path $extensionDirectory $extension))) {
        throw "Kulang ang PHP extension file: $extension"
    }
}

$sender = (Read-Host 'Ilagay ang Gmail address na gagamitin sa pagpapadala').Trim()
if ($sender -notmatch '^[^\s@]+@gmail\.com$') { throw 'Maglagay ng valid na @gmail.com address.' }
$securePassword = Read-Host 'Ilagay ang 16-character Google App Password (nakatago ang input)' -AsSecureString
if ($securePassword.Length -lt 16) { throw 'Hindi kumpleto ang Google App Password.' }
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:SMTP_HOST = 'smtp.gmail.com'
    $env:SMTP_PORT = '587'
    $env:SMTP_ENCRYPTION = 'tls'
    $env:SMTP_USERNAME = $sender
    $env:SMTP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer).Replace(' ', '')
    $env:KQ_MAIL_FROM = $sender
    $env:KQ_APP_URL = 'http://localhost:8080'

    Set-Location -LiteralPath $projectRoot
    Write-Host 'Nagsisimula ang local site sa http://localhost:8080. Panatilihing bukas ang window na ito.'
    Write-Host 'Pindutin ang Ctrl+C kapag tapos nang mag-test; aalisin ang temporary email settings.'
    & $phpPath -d "extension_dir=$extensionDirectory" -d extension=openssl -d extension=fileinfo -S localhost:8080 -t public
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    Remove-Item Env:SMTP_PASSWORD, Env:SMTP_USERNAME, Env:SMTP_HOST, Env:SMTP_PORT, Env:SMTP_ENCRYPTION, Env:KQ_MAIL_FROM, Env:KQ_APP_URL -ErrorAction SilentlyContinue
}
