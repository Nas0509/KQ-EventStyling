<?php
declare(strict_types=1);
require_once __DIR__ . '/Database.php';
date_default_timezone_set('Asia/Manila');
ini_set('display_errors', '0');
ini_set('session.use_strict_mode', '1');
session_name('kq_session');
// Keep session files outside the public web root and avoid relying on a machine-wide PHP temp directory.
$sessionDirectory = dirname(__DIR__) . '/var/sessions';
if (!is_dir($sessionDirectory)) mkdir($sessionDirectory, 0700, true);
session_save_path($sessionDirectory);
session_set_cookie_params([
    'httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax', 'path' => '/',
]);
session_start();
if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > 1800) {
    $_SESSION = [];
    session_regenerate_id(true);
}
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
    return $statement;
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
    $user = query($db, 'SELECT id,name,email,role FROM users WHERE id=?', [$_SESSION['user_id'] ?? 0])->fetch();
    if (!$user && $required) fail(401, 'Please sign in.');
    return $user ?: null;
}
function admin(array $user): void { if ($user['role'] !== 'admin') fail(403, 'Administrator access required.'); }
function audit(PDO $db, int $userId, string $action, array $details): void
{
    query($db, 'INSERT INTO audit_log(user_id,action,details_json) VALUES(?,?,?)', [$userId,$action,json_encode($details, JSON_THROW_ON_ERROR)]);
}
/** IMMEDIATE serializes availability checks and writes; unique slot locks provide a second safeguard. */
function transaction(PDO $db, callable $operation): mixed
{
    $db->exec('BEGIN IMMEDIATE');
    try { $result = $operation(); $db->exec('COMMIT'); return $result; }
    catch (Throwable $e) { $db->exec('ROLLBACK'); throw $e; }
}
