<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/app/Database.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}
$password = (string)(getenv('KQ_ADMIN_PASSWORD') ?: '');
if (strlen($password) < 12 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
    fwrite(STDERR, "Choose at least 12 characters with uppercase and lowercase letters and a number.\n");
    exit(1);
}
try {
    $db = Database::connect();
    $admins = (int)$db->query("SELECT count(*) FROM users WHERE role='admin'")->fetchColumn();
    if ($admins !== 1) {
        fwrite(STDERR, "Expected exactly one administrator account; no password was changed.\n");
        exit(1);
    }
    $db->beginTransaction();
    $statement = $db->prepare("UPDATE users SET password_hash=? WHERE role='admin'");
    $statement->execute([password_hash($password, PASSWORD_DEFAULT)]);
    $adminId = (int)$db->query("SELECT id FROM users WHERE role='admin'")->fetchColumn();
    $audit = $db->prepare("INSERT INTO audit_log(user_id,action,details_json) VALUES(?,?,?)");
    $audit->execute([$adminId,'auth.admin_password_reset','{}']);
    $db->exec('DELETE FROM login_attempts');
    $db->commit();
    fwrite(STDOUT, "Admin password updated. Sign in with the same admin email and the new password.\n");
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, "Password reset failed safely. Check that the local database is available.\n");
    exit(1);
}
