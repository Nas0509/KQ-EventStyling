<?php
declare(strict_types=1);

final class Database
{
    public static function connect(): PDO
    {
        $databaseUrl = trim((string)(getenv('KQ_DATABASE_URL') ?: ''));
        if ($databaseUrl !== '') {
            $parts = parse_url($databaseUrl);
            if (!is_array($parts) || empty($parts['host']) || empty($parts['path'])) {
                throw new RuntimeException('KQ_DATABASE_URL is not a valid PostgreSQL connection URL.');
            }
            $database = ltrim($parts['path'], '/');
            $query = [];
            parse_str((string)($parts['query'] ?? ''), $query);
            $sslMode = preg_replace('/[^a-z]/i', '', (string)($query['sslmode'] ?? 'require')) ?: 'require';
            $dsn = 'pgsql:host=' . $parts['host']
                . ';port=' . (int)($parts['port'] ?? 5432)
                . ';dbname=' . $database
                . ';sslmode=' . $sslMode;
            $db = new PDO($dsn, rawurldecode((string)($parts['user'] ?? '')), rawurldecode((string)($parts['pass'] ?? '')), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $db->exec('SET search_path TO kq_php');
            return $db;
        }

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
