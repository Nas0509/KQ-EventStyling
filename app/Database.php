<?php
declare(strict_types=1);

final class Database
{
    public static function connect(): PDO
    {
        $privateDirectory = rtrim((string)(getenv('KQ_PRIVATE_DIR') ?: dirname(__DIR__) . '/var'), "/\\");
        $path = getenv('KQ_DB_PATH') ?: $privateDirectory . '/kq.sqlite';
        $db = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $db->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000');
        return $db;
    }
}
