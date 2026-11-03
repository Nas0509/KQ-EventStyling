<?php
declare(strict_types=1);
require_once __DIR__ . '/Database.php';
date_default_timezone_set('Asia/Manila');
ini_set('display_errors', '0');
ini_set('session.use_strict_mode', '1');
session_name('kq_session');
// Keep the PHP session cookie for 30 days. The remember token below restores
// the session if Render clears its temporary session files during a restart.
ini_set('session.gc_maxlifetime', '2592000');
function ensurePrivateDirectoryWritable(string $path): bool
{
    if ((!is_dir($path) && !@mkdir($path, 0700, true)) || !is_dir($path)) return false;
    $probe = rtrim($path, "/\\") . DIRECTORY_SEPARATOR . '.write-check-' . bin2hex(random_bytes(8));
    $handle = @fopen($probe, 'x');
    if ($handle === false) return false;
    fclose($handle);
    return @unlink($probe);
}

// Keep private uploads and PHP sessions outside the public document root.
$privateDirectory = rtrim((string)(getenv('KQ_PRIVATE_DIR') ?: dirname(__DIR__) . '/var'), "/\\");
$GLOBALS['KQ_PRIVATE_DIR'] = $privateDirectory;
$sessionDirectory = (string)(getenv('KQ_SESSION_PATH') ?: $privateDirectory . '/sessions');
if (!ensurePrivateDirectoryWritable($sessionDirectory)) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['data' => null, 'error' => ['message' => 'Session storage is unavailable. Please try again shortly.']]);
    exit;
}
session_save_path($sessionDirectory);
$isHttps = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
    || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
session_set_cookie_params([
    'lifetime' => 2592000,
    'httponly' => true, 'secure' => $isHttps,
    'samesite' => 'Lax', 'path' => '/',
]);
session_start();
$_SESSION['last_seen'] = time();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");

final class ApiError extends RuntimeException
{
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}
function fail(int $status, string $message): never { throw new ApiError($status, $message); }
function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['data' => $data, 'error' => null], JSON_THROW_ON_ERROR);
    exit;
}
function query(PDO $db, string $sql, array $values = []): PDOStatement
{
    $statement = $db->prepare($sql);
    $statement->execute($values);
    $GLOBALS['kq_last_mutation_count'] = $statement->rowCount();
    return $statement;
}
function lastMutationCount(): int { return (int)($GLOBALS['kq_last_mutation_count'] ?? 0); }
function lastInsertId(PDO $db): int
{
    return (int)($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'pgsql'
        ? $db->query('SELECT lastval()')->fetchColumn()
        : $db->lastInsertId());
}
function text(array $data, string $key, int $min = 1, int $max = 200): string
{
    if (!isset($data[$key]) || !is_string($data[$key])) fail(422, "Invalid $key.");
    $value = trim($data[$key]);
    if (mb_strlen($value) < $min || mb_strlen($value) > $max) fail(422, "$key must contain $min to $max characters.");
    return $value;
}
function number(array $data, string $key, int $min, int $max): int
{
    $value = filter_var($data[$key] ?? null, FILTER_VALIDATE_INT);
    if ($value === false || $value === null || $value < $min || $value > $max) fail(422, "Invalid $key.");
    return $value;
}
function eventDate(array $data, string $key = 'event_date', bool $future = true): string
{
    $value = text($data, $key, 10, 10);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value || ($future && ($value <= date('Y-m-d') || $value > date('Y-m-d', strtotime('+2 years'))))) {
        fail(422, $future ? 'Choose a valid date from tomorrow through the next two years.' : 'Invalid date.');
    }
    return $value;
}
function slot(array $data): string
{
    $value = text($data, 'slot');
    if (!in_array($value, ['MORNING','AFTERNOON','NIGHT'], true)) fail(422, 'Invalid time slot.');
    return $value;
}
function currentUser(PDO $db, bool $required = true): ?array
{
    $user = query($db, 'SELECT id,name,email,phone,role FROM users WHERE id=?', [$_SESSION['user_id'] ?? 0])->fetch();
    if (!$user && $required) fail(401, 'Please sign in.');
    return $user ?: null;
}
function rememberCookieOptions(int $expires): array
{
    $isHttps = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    return ['expires'=>$expires,'path'=>'/','secure'=>$isHttps,'httponly'=>true,'samesite'=>'Lax'];
}
function rememberUser(PDO $db, int $userId): void
{
    $oldToken = $_COOKIE['kq_remember'] ?? '';
    if (is_string($oldToken) && preg_match('/^[a-f0-9]{64}$/D', $oldToken)) {
        query($db, 'DELETE FROM remember_tokens WHERE token_hash=?', [hash('sha256', $oldToken)]);
    }
    $token = bin2hex(random_bytes(32));
    $expires = time() + 2592000;
    query($db, 'INSERT INTO remember_tokens(user_id,token_hash,expires_at) VALUES(?,?,?)', [$userId,hash('sha256',$token),$expires]);
    setcookie('kq_remember', $token, rememberCookieOptions($expires));
    $_COOKIE['kq_remember'] = $token;
}
function restoreRememberedUser(PDO $db): void
{
    if (!empty($_SESSION['user_id'])) return;
    $token = $_COOKIE['kq_remember'] ?? '';
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) return;
    $row = query($db, 'SELECT user_id FROM remember_tokens WHERE token_hash=? AND expires_at>?', [hash('sha256',$token),time()])->fetch();
    if (!$row) {
        setcookie('kq_remember', '', rememberCookieOptions(time()-3600));
        unset($_COOKIE['kq_remember']);
        return;
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$row['user_id'];
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function forgetRememberedUser(PDO $db): void
{
    $token = $_COOKIE['kq_remember'] ?? '';
    if (is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token)) {
        query($db, 'DELETE FROM remember_tokens WHERE token_hash=?', [hash('sha256',$token)]);
    }
    setcookie('kq_remember', '', rememberCookieOptions(time()-3600));
    unset($_COOKIE['kq_remember']);
}
function admin(array $user): void { if ($user['role'] !== 'admin') fail(403, 'Administrator access required.'); }
function audit(PDO $db, int $userId, string $action, array $details): void
{
    query($db, 'INSERT INTO audit_log(user_id,action,details_json) VALUES(?,?,?)', [$userId,$action,json_encode($details, JSON_THROW_ON_ERROR)]);
}
function notifyUser(PDO $db, int $userId, string $kind, string $title, string $message, ?int $relatedId = null): void
{
    query($db, 'INSERT INTO notifications(user_id,kind,title,message,related_id) VALUES(?,?,?,?,?)', [$userId,$kind,$title,$message,$relatedId]);
}
function postJson(string $url, array $headers, array $payload, int $timeout = 55): array
{
    $headerLines = array_merge(['Content-Type: application/json'], $headers);
    $context = stream_context_create(['http'=>[
        'method'=>'POST', 'header'=>implode("\r\n",$headerLines),
        'content'=>json_encode($payload,JSON_THROW_ON_ERROR), 'timeout'=>$timeout, 'ignore_errors'=>true,
    ]]);
    $response = @file_get_contents($url,false,$context);
    $status = 0;
    foreach ($http_response_header ?? [] as $line) if (preg_match('/^HTTP\/\S+\s+(\d+)/',$line,$match)) $status=(int)$match[1];
    if ($response === false) throw new RuntimeException('External AI request failed.');
    $decoded = json_decode($response,true);
    if (!is_array($decoded)) throw new RuntimeException('External AI returned an unreadable response.');
    return ['status'=>$status,'body'=>$decoded];
}
/** Transactions and unique slot locks protect schedule writes on both supported databases. */
function transaction(PDO $db, callable $operation): mixed
{
    $db->beginTransaction();
    try { $result = $operation(); $db->commit(); return $result; }
    catch (Throwable $e) { if ($db->inTransaction()) $db->rollBack(); throw $e; }
}
