<?php
declare(strict_types=1);

$root = dirname(__DIR__);
require_once $root . '/app/Database.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line only.\n");
    exit(1);
}

$email = trim((string)(getenv('KQ_ADMIN_EMAIL') ?: ''));
$password = (string)(getenv('KQ_ADMIN_PASSWORD') ?: '');
$name = trim((string)(getenv('KQ_ADMIN_NAME') ?: 'KQ Administrator'));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Set KQ_ADMIN_EMAIL to the administrator email before running this script.\n");
    exit(1);
}
if (strlen($password) < 12 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
    fwrite(STDERR, "Set KQ_ADMIN_PASSWORD to a unique password with at least 12 characters, upper/lowercase letters, and a number.\n");
    exit(1);
}
if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    fwrite(STDERR, "KQ_ADMIN_NAME must contain 2 to 80 characters.\n");
    exit(1);
}

try {
    $db = Database::connect();
    $adminCount = (int)$db->query("SELECT count(*) FROM users WHERE role='admin'")->fetchColumn();
    if ($adminCount > 0) {
        fwrite(STDERR, "An administrator account already exists. Create additional admin accounts through a reviewed, authenticated process.\n");
        exit(1);
    }
    $statement = $db->prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)');
    $statement->execute([$name, strtolower($email), password_hash($password, PASSWORD_DEFAULT), 'admin']);
    fwrite(STDOUT, "Administrator account created for $email. Remove KQ_ADMIN_PASSWORD from the environment now.\n");
} catch (PDOException $error) {
    fwrite(STDERR, $error->getCode() === '23000' ? "That email is already registered.\n" : "Administrator setup failed: {$error->getMessage()}\n");
    exit(1);
} catch (Throwable $error) {
    fwrite(STDERR, "Administrator setup failed: {$error->getMessage()}\n");
    exit(1);
}
