<?php
declare(strict_types=1);
$root = dirname(__DIR__);
putenv('KQ_DB_PATH=' . $root . '/var/service-test.sqlite');
@unlink($root . '/var/service-test.sqlite');
require_once $root . '/app/bootstrap.php';
require_once $root . '/app/BookingService.php';
$db = Database::connect();
$db->exec(file_get_contents($root . '/database/schema.sql'));
query($db, 'INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', ['Customer','customer@test.local',password_hash('StrongPass123', PASSWORD_DEFAULT),'customer']);
query($db, 'INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', ['Admin','admin@test.local',password_hash('StrongPass123', PASSWORD_DEFAULT),'admin']);
$customer=['id'=>1,'role'=>'customer']; $admin=['id'=>2,'role'=>'admin'];
$service = new BookingService($db);
$booking = $service->create(['package_id'=>1,'event_date'=>date('Y-m-d',strtotime('+7 days')),'slot'=>'MORNING','venue'=>'Quezon City','phone'=>'09171234567','guests'=>20,'distance_km'=>15,'notes'=>'Test'], $customer);
if ((int)$booking['total_cents'] !== 680000 || (int)$booking['deposit_cents'] !== 204000) throw new RuntimeException('Server pricing calculation failed.');
query($db, "INSERT INTO payments(booking_id,reference,amount_cents,status) VALUES(?,?,?, 'verified')", [$booking['id'],'TEST-001',$booking['deposit_cents']]);
$service->review((int)$booking['id'], 'approved', $admin);
if ((int)query($db,'SELECT count(*) FROM schedule_locks WHERE booking_id=?',[$booking['id']])->fetchColumn() !== 1) throw new RuntimeException('Schedule lock was not created.');
try { $service->create(['package_id'=>1,'event_date'=>$booking['event_date'],'slot'=>'MORNING','venue'=>'Quezon City','phone'=>'09171234568','guests'=>20,'distance_km'=>10,'notes'=>'Conflict'], $customer); throw new RuntimeException('Conflict was incorrectly accepted.'); }
catch (ApiError $error) { if ($error->status !== 409) throw $error; }
echo "Service rules passed: price, payment-gated approval, schedule lock, and conflict rejection.\n";
