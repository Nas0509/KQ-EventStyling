<?php
declare(strict_types=1);

$root = dirname(__DIR__);
$databaseUrl = trim((string)(getenv('KQ_DATABASE_URL') ?: ''));
if ($databaseUrl !== '') {
    if (!extension_loaded('pdo_pgsql')) {
        fwrite(STDERR, "PHP extension pdo_pgsql is required for the hosted database.\n");
        exit(1);
    }
    try {
        require_once $root . '/app/Database.php';
        $db = Database::connect();
        $schema = file_get_contents($root . '/database/schema.postgres.sql');
        if ($schema === false) throw new RuntimeException('PostgreSQL schema file is missing.');
        $db->exec($schema);
        fwrite(STDOUT, "Hosted database schema is ready.\n");
    } catch (Throwable $error) {
        fwrite(STDERR, "Hosted database setup failed. Check the private KQ_DATABASE_URL setting and Supabase SQL access.\n");
        error_log($error->getMessage());
        exit(1);
    }
    exit(0);
}
$directory = rtrim((string)(getenv('KQ_PRIVATE_DIR') ?: $root . DIRECTORY_SEPARATOR . 'var'), "/\\");
$path = getenv('KQ_DB_PATH') ?: $directory . DIRECTORY_SEPARATOR . 'kq.sqlite';
$databaseDirectory = dirname($path);

if (!is_dir($databaseDirectory) && !mkdir($databaseDirectory, 0700, true) && !is_dir($databaseDirectory)) {
    fwrite(STDERR, "Could not create the database directory.\n");
    exit(1);
}

if (!extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "PHP extension pdo_sqlite is required. Enable it and try again.\n");
    exit(1);
}

try {
    $db = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $migrations = [
        'users' => ['phone' => "TEXT NOT NULL DEFAULT ''"],
        'packages' => ['description' => "TEXT NOT NULL DEFAULT ''"],
        'bookings' => [
            'event_type' => "TEXT NOT NULL DEFAULT ''", 'event_time' => "TEXT NOT NULL DEFAULT ''",
            'venue_city' => "TEXT NOT NULL DEFAULT ''", 'venue_address' => "TEXT NOT NULL DEFAULT ''",
            'theme' => "TEXT NOT NULL DEFAULT ''", 'colors' => "TEXT NOT NULL DEFAULT ''",
            'design_reference_path' => 'TEXT', 'ai_estimated_package' => "TEXT NOT NULL DEFAULT ''",
            'ai_estimated_price_cents' => 'INTEGER', 'ai_estimate_explanation' => "TEXT NOT NULL DEFAULT ''",
            'ai_detected_features_json' => "TEXT NOT NULL DEFAULT '[]'",
            'package_label' => "TEXT NOT NULL DEFAULT ''", 'unpriced' => 'INTEGER NOT NULL DEFAULT 0',
        ],
        'expenses' => ['category' => "TEXT NOT NULL DEFAULT 'General'", 'archived_at' => 'TEXT'],
        'change_requests' => ['event_time' => "TEXT", 'reservation_fee_nonrefundable' => "INTEGER NOT NULL DEFAULT 0"],
        'inventory' => ['reorder' => "INTEGER NOT NULL DEFAULT 0", 'category' => "TEXT NOT NULL DEFAULT 'General'", 'unit_cost_cents' => "INTEGER NOT NULL DEFAULT 0"],
    ];
    foreach ($migrations as $table => $columns) {
        $exists = $db->prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?");
        $exists->execute([$table]);
        if (!$exists->fetchColumn()) continue;
        $present = array_column($db->query("PRAGMA table_info(\"$table\")")->fetchAll(), 'name');
        foreach ($columns as $column => $definition) {
            if (!in_array($column, $present, true)) $db->exec("ALTER TABLE \"$table\" ADD COLUMN \"$column\" $definition");
        }
    }
    $db->exec(file_get_contents($root . '/database/schema.sql'));
    $db->exec("UPDATE packages SET description=CASE name
        WHEN 'Simple Styling' THEN 'Thematic venue styling with a 7x8 ft backdrop, balloon garland and props, celebrant name styro cut, grass mat, and basic backdrop lights.'
        WHEN 'Package A' THEN 'Thematic venue styling with customized 3-panel 8x12 ft backdrop, balloon garland, character standee and props, name cut, grass mat, lights, souvenir rack, cake pedestal, wooden bench, and number lighted standee.'
        WHEN 'Package B' THEN 'Package A inclusions plus thematic ceiling treatment with 100 balloon drops and 10 clusters, and a balloon entrance arch.'
        WHEN 'Package C' THEN '4-panel 8x16 ft backdrop, ceiling swag with 200 balloon drops, 10 clusters and 10 hanging decals, 5 balloon centerpieces, character standee, props, name cut, grass mat, lights, souvenir rack, cake pedestal, bench, number light, and lighted entrance arch.'
        WHEN 'Package D' THEN '5-panel 8x20 ft backdrop, ceiling swag with 300 balloon drops, 20 clusters and 20 hanging mylar decals, 10 balloon centerpieces, character standee, props, name cut, grass mat, lights, souvenir rack, cake pedestal, bench, number light, and lighted entrance arch.'
        WHEN 'Package E' THEN '5-panel 8x20 ft backdrop, ceiling swag with 600 balloon drops, 30 clusters and 20 hanging decals, 10 balloon centerpieces, character standee, props, name cut, grass mat, lights, souvenir rack, bench, number light, and lighted entrance arch with character standee.'
        ELSE description END");
    @chmod($path, 0600);
    if ($databaseDirectory === $directory) @chmod($directory, 0700);
    fwrite(STDOUT, "Database is ready at $path\n");
} catch (Throwable $error) {
    fwrite(STDERR, "Database setup failed: {$error->getMessage()}\n");
    exit(1);
}
