<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/app/Database.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}

$email = strtolower(trim((string)(getenv('KQ_CUSTOMER_EMAIL') ?: '')));
$password = (string)(getenv('KQ_CUSTOMER_PASSWORD') ?: '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Set KQ_CUSTOMER_EMAIL to the customer's registered email.\n");
    exit(1);
}
if (strlen($password) < 12 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password)
    || !preg_match('/\d/', $password) || !preg_match('/[^A-Za-z0-9]/', $password)) {
    fwrite(STDERR, "Choose at least 12 characters with uppercase and lowercase letters, a number, and a symbol.\n");
    exit(1);
}

try {
    $db = Database::connect();
    $account = $db->prepare("SELECT id FROM users WHERE email=? AND role='customer'");
    $account->execute([$email]);
    $userId = $account->fetchColumn();
    if (!$userId) {
        fwrite(STDERR, "No customer account matches that email in this local database. No password was changed.\n");
        exit(1);
    }

    $db->beginTransaction();
    $update = $db->prepare("UPDATE users SET password_hash=? WHERE id=? AND role='customer'");
    $update->execute([password_hash($password, PASSWORD_DEFAULT), (int)$userId]);
    $tokens = $db->prepare('UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE user_id=? AND used_at IS NULL');
    $tokens->execute([(int)$userId]);
    $audit = $db->prepare('INSERT INTO audit_log(user_id,action,details_json) VALUES(?,?,?)');
    $audit->execute([(int)$userId, 'auth.customer_password_reset_cli', '{}']);
    $db->commit();
    fwrite(STDOUT, "Customer password updated in the local database. Sign in with the same email and the new password.\n");
} catch (Throwable) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, "Password reset failed safely. Check that the local database is available.\n");
    exit(1);
}
