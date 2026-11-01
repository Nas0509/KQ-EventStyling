<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/app/Database.php';

$directory = $argv[1] ?? dirname(__DIR__) . '/var/supabase-export';
$apply = in_array('--apply', $argv, true);
$files = [
    'profiles','bookings','payments','booking_change_requests',
    'ocular_inspection_requests','inventory','expenses','user_notifications',
];

function readCsv(string $path): array
{
    if (!is_file($path)) throw new RuntimeException('Missing CSV file: ' . basename($path));
    $handle = fopen($path, 'rb');
    if (!$handle) throw new RuntimeException('Cannot open CSV file: ' . basename($path));
    $headers = fgetcsv($handle, null, ',', '"', '\\');
    if (!$headers) { fclose($handle); return []; }
    $headers = array_map(static fn($v) => trim((string)$v, "\xEF\xBB\xBF \t\n\r\0\x0B\""), $headers);
    $rows = [];
    while (($values = fgetcsv($handle, null, ',', '"', '\\')) !== false) {
        if (count($values) !== count($headers)) continue;
        $row = array_combine($headers, $values);
        if ($row !== false) $rows[] = $row;
    }
    fclose($handle);
    return $rows;
}
function value(array $row, string $key, string $fallback = ''): string
{
    $v = $row[$key] ?? null;
    return $v === null || trim((string)$v) === '' ? $fallback : trim((string)$v);
}
function cents(string $amount): int
{
    return max(0, (int)round((float)str_replace([',','₱','$'], '', $amount) * 100));
}
function localDate(string $date, string $fallback): string
{
    $date = substr(trim($date), 0, 10);
    return preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date) ? $date : $fallback;
}
function statusValue(string $value, array $allowed, string $fallback): string
{
    $value = strtolower(trim($value));
    return in_array($value, $allowed, true) ? $value : $fallback;
}
function mappedId(PDO $db, string $entity, string $legacy): ?int
{
    if ($legacy === '') return null;
    $s = $db->prepare('SELECT local_id FROM supabase_import_map WHERE entity=? AND source_id=?');
    $s->execute([$entity,$legacy]);
    $id = $s->fetchColumn();
    return $id === false ? null : (int)$id;
}
function saveMap(PDO $db, string $entity, string $legacy, int $local): void
{
    $s = $db->prepare('INSERT OR IGNORE INTO supabase_import_map(entity,source_id,local_id) VALUES(?,?,?)');
    $s->execute([$entity,$legacy,$local]);
}
function userFor(PDO $db, array $profiles, string $legacyId, string $email = ''): ?int
{
    $id = mappedId($db, 'profiles', $legacyId);
    if ($id) return $id;
    $profile = $profiles[$legacyId] ?? null;
    $email = strtolower($email ?: value($profile ?? [], 'email'));
    if ($email === '') return null;
    $s = $db->prepare('SELECT id FROM users WHERE email=?');
    $s->execute([$email]);
    $id = $s->fetchColumn();
    if ($id !== false) return (int)$id;
    if (!$profile) return null;
    $name = value($profile, 'full_name', 'KQ Customer');
    $phone = value($profile, 'contact_number');
    $phone = preg_replace('/\s+/', '', $phone);
    if (preg_match('/^\+63(9\d{9})$/', $phone, $m)) $phone = '0' . $m[1];
    $insert = $db->prepare("INSERT INTO users(name,email,phone,password_hash,role,created_at) VALUES(?,?,?,?, 'customer',?)");
    $insert->execute([$name,$email,$phone,password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT),value($profile,'created_at',date('Y-m-d H:i:s'))]);
    $id = (int)$db->lastInsertId();
    saveMap($db, 'profiles', $legacyId, $id);
    return $id;
}

try {
    $csv = [];
    foreach ($files as $file) {
        $path = rtrim($directory, '/\\') . DIRECTORY_SEPARATOR . $file . '.csv';
        $csv[$file] = in_array($file, ['inventory','expenses'], true) && !is_file($path) ? [] : readCsv($path);
    }
    $db = Database::connect();
    $db->beginTransaction();
    $db->exec('CREATE TABLE IF NOT EXISTS supabase_import_map(entity TEXT NOT NULL, source_id TEXT NOT NULL, local_id INTEGER NOT NULL, PRIMARY KEY(entity,source_id))');
    $profiles = [];
    foreach ($csv['profiles'] as $row) if (value($row,'id') !== '') $profiles[value($row,'id')] = $row;
    $counts = array_fill_keys($files, 0);
    $warnings = [];
    foreach ($csv['profiles'] as $row) {
        $source = value($row,'id'); $email = strtolower(value($row,'email'));
        if ($source === '' || $email === '') { $warnings[]='A profile row has no ID or email and was skipped.'; continue; }
        if (mappedId($db,'profiles',$source)) continue;
        $s=$db->prepare('SELECT id FROM users WHERE email=?'); $s->execute([$email]); $existing=$s->fetchColumn();
        if ($existing !== false) { saveMap($db,'profiles',$source,(int)$existing); continue; }
        userFor($db,$profiles,$source); $counts['profiles']++;
    }

    foreach ($csv['bookings'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'bookings',$source)) continue;
        $userId=userFor($db,$profiles,value($row,'user_id'),value($row,'email'));
        if (!$userId) { $warnings[]='A booking could not be linked to a profile and was skipped.'; continue; }
        $sourcePackage=value($row,'package'); $category=strtoupper(value($row,'package_type'));
        $total=cents(value($row,'amount','0')); $unpriced=$total<1;
        $packageName=$sourcePackage;
        if ($sourcePackage===''||strcasecmp($sourcePackage,'Not selected')===0) {
            $candidates=match($category){'BIG'=>['Package C','Package D','Package E'],'SMALL'=>['Simple Styling','Package A','Package B'],default=>['Simple Styling','Package A','Package B','Package C','Package D','Package E']};
            $marks=implode(',',array_fill(0,count($candidates),'?'));
            $choices=$db->prepare("SELECT id,name,full_day,price_cents FROM packages WHERE name IN ($marks)"); $choices->execute($candidates); $choices=$choices->fetchAll();
            usort($choices,static fn($a,$b)=>abs((int)$a['price_cents']-$total)<=>abs((int)$b['price_cents']-$total));
            $package=$choices[0]??null; $packageName=$package?['Simple Styling'=>'Basic','Package A'=>'Elegant','Package B'=>'Grand'][$package['name']]??'Legacy '.$category.' package':'';
            if ($sourcePackage==='Not selected') $packageName='Not selected';
            elseif ($package) $packageName='Legacy '.$category.' package (mapped to '.$package['name'].')';
        } else {
            $normal=$sourcePackage;
            if (preg_match('/simple/i',$normal)) $normal='Simple Styling';
            elseif (preg_match('/package\s*([A-E])/i',$normal,$m)) $normal='Package '.strtoupper($m[1]);
            elseif (preg_match('/^basic\b/i',$normal)) $normal='Simple Styling';
            elseif (preg_match('/^elegant\b/i',$normal)) $normal='Package A';
            elseif (preg_match('/^grand\b/i',$normal)) $normal='Package B';
            $package=$db->prepare('SELECT id,name,full_day,price_cents FROM packages WHERE name=?'); $package->execute([$normal]); $package=$package->fetch();
        }
        if (!$package) { $warnings[]='A booking had an unknown package and was skipped.'; continue; }
        $slot=strtoupper(value($row,'time_slot','MORNING'));
        if (!in_array($slot,['MORNING','AFTERNOON','NIGHT'],true)) $slot='MORNING';
        $eventDate=localDate(value($row,'event_date'),date('Y-m-d'));
        $start=value($row,'start_time'); if (strlen($start)>5) $start=substr($start,0,5);
        if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D',$start)) $start='';
        $status=strtolower(value($row,'status',value($row,'booking_status','pending')));
        if ($status==='declined') $status='rejected';
        if (!in_array($status,['pending','approved','rejected','cancelled','completed'],true)) $status='pending';
        $location=value($row,'location','Legacy booking location');
        $phone=value($row,'phone'); if ($phone==='') $phone='';
        if ($unpriced) { $total=1; $warnings[]='Some historical bookings have no recorded total; they will be labeled unpriced.'; }
        $deposit=cents(value($row,'required_down_payment',value($row,'down_payment_amount','0')));
        $distance=min(1000,max(0,(float)value($row,'travel_distance_km',value($row,'distance_km','0'))));
        $notes=value($row,'message');
        $s=$db->prepare('INSERT INTO bookings(user_id,package_id,event_date,slot,event_type,event_time,venue_city,venue_address,theme,colors,venue,phone,guests,distance_km,notes,package_label,unpriced,total_cents,deposit_cents,status,created_at,design_reference_path,ai_estimated_package,ai_estimated_price_cents,ai_estimate_explanation,ai_detected_features_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $s->execute([$userId,$package['id'],$eventDate,$slot,value($row,'event_type','Event'),$start,$location,$location,$package['name'],'',$location,$phone,max(1,min(5000,(int)value($row,'guests','1'))),$distance,$notes,$packageName,(int)$unpriced,$total,$deposit,$status,value($row,'created_at',date('Y-m-d H:i:s')),value($row,'design_image_path')?:null,value($row,'ai_estimated_package'),cents(value($row,'ai_estimated_price'))?:null,value($row,'ai_estimate_explanation'),value($row,'ai_detected_features','[]')]);
        $local=(int)$db->lastInsertId(); saveMap($db,'bookings',$source,$local); $counts['bookings']++;
        if ($status==='approved') {
            $slots=$package['full_day'] || $distance>30 ? ['MORNING','AFTERNOON','NIGHT'] : ($distance==30.0 ? array_slice(['MORNING','AFTERNOON','NIGHT'],array_search($slot,['MORNING','AFTERNOON','NIGHT'],true),2) : [$slot]);
            foreach ($slots as $occupied) {
                $lock=$db->prepare('INSERT OR IGNORE INTO schedule_locks(event_date,slot,booking_id) VALUES(?,?,?)'); $lock->execute([$eventDate,$occupied,$local]);
                if ($lock->rowCount()===0) $warnings[]='Two approved bookings overlap on '.$eventDate.'; review the schedule before accepting new bookings.';
            }
        }
    }

    foreach ($csv['payments'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'payments',$source)) continue;
        $booking=mappedId($db,'bookings',value($row,'booking_id')); if (!$booking) { $warnings[]='A payment had no matching booking and was skipped.'; continue; }
        $paid=cents(value($row,'paid','0')); if ($paid<1) { saveMap($db,'payments',$source,$booking); continue; }
        $status=strtolower(value($row,'status'));
        $paymentStatus=in_array($status,['paid','fully paid','verified','completed','down payment made'],true)?'verified':'pending';
        $duplicate=$db->prepare("SELECT id FROM payments WHERE booking_id=? AND amount_cents=? AND reference LIKE 'SUPABASE-OLD-%' LIMIT 1"); $duplicate->execute([$booking,$paid]); $duplicateId=$duplicate->fetchColumn();
        if ($duplicateId!==false) { saveMap($db,'payments',$source,(int)$duplicateId); continue; }
        $s=$db->prepare('INSERT INTO payments(booking_id,reference,amount_cents,status,created_at) VALUES(?,?,?,?,?)');
        $s->execute([$booking,'SUPABASE-OLD-'.$source,$paid,$paymentStatus,value($row,'updated_at',date('Y-m-d H:i:s'))]);
        saveMap($db,'payments',$source,(int)$db->lastInsertId()); $counts['payments']++;
        if ($paymentStatus==='pending') $warnings[]='Some historical payment amounts were imported as pending for admin verification.';
    }

    foreach ($csv['booking_change_requests'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'booking_change_requests',$source)) continue;
        $booking=mappedId($db,'bookings',value($row,'booking_id')); if (!$booking) { $warnings[]='A change request had no matching booking and was skipped.'; continue; }
        $type=strtolower(value($row,'request_type','reschedule')); $type=str_contains($type,'cancel')?'cancel':'reschedule';
        $status=strtolower(value($row,'status')); if($status==='accepted')$status='approved';
        $status=statusValue($status,['pending','approved','rejected'],'rejected');
        $date=value($row,'requested_event_date'); $date=$date!==''?localDate($date,date('Y-m-d')):null;
        $time=value($row,'requested_start_time'); if ($time!==''&&strlen($time)>5) $time=substr($time,0,5);
        $slot=strtoupper(value($row,'requested_time_slot')); if (!in_array($slot,['MORNING','AFTERNOON','NIGHT'],true)) $slot=null;
        $s=$db->prepare('INSERT INTO change_requests(booking_id,type,reason,event_date,event_time,slot,reservation_fee_nonrefundable,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)');
        $s->execute([$booking,$type,value($row,'reason','Imported from Supabase'),$date,$time?:null,$slot,(int)(value($row,'reservation_fee_nonrefundable')==='true'),$status,value($row,'created_at',date('Y-m-d H:i:s'))]);
        saveMap($db,'booking_change_requests',$source,(int)$db->lastInsertId()); $counts['booking_change_requests']++;
    }

    foreach ($csv['ocular_inspection_requests'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'ocular_inspection_requests',$source)) continue;
        $userId=userFor($db,$profiles,value($row,'user_id'),value($row,'customer_email'));
        if (!$userId) { $warnings[]='An ocular request could not be linked to a profile and was skipped.'; continue; }
        $city=implode(' — ',array_filter([value($row,'inspection_city'),value($row,'inspection_province'),value($row,'inspection_region')]));
        $status=strtolower(value($row,'status','pending')); if($status==='rejected')$status='declined'; if($status==='accepted')$status='approved';
        $status=statusValue($status,['pending','approved','declined','cancelled','completed'],'pending');
        $id=(int)$source; $request=value($row,'request_code','OI-LEGACY-'.$id);
        $s=$db->prepare('INSERT INTO ocular_inspections(request_code,user_id,contact_name,email,phone,venue_name,venue_address,venue_city,event_date,inspection_date,inspection_time,distance_km,fee_cents,payment_reference,status,admin_notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $date=localDate(value($row,'inspection_date'),date('Y-m-d')); $time=value($row,'inspection_time','09:00'); if(strlen($time)>5)$time=substr($time,0,5);
        $s->execute([$request,$userId,value($row,'customer_name','Customer'),strtolower(value($row,'customer_email')),value($row,'customer_contact'),value($row,'venue_name','Venue to be confirmed'),value($row,'inspection_address','Address not provided'),$city?:'Luzon',$date,$date,$time,(float)value($row,'inspection_distance_km','0'),cents(value($row,'inspection_fee','0')),value($row,'payment_reference'),$status,value($row,'admin_notes'),value($row,'created_at',date('Y-m-d H:i:s')),value($row,'updated_at',date('Y-m-d H:i:s'))]);
        saveMap($db,'ocular_inspection_requests',$source,(int)$db->lastInsertId()); $counts['ocular_inspection_requests']++;
    }

    foreach ($csv['expenses'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'expenses',$source)) continue;
        $amount=cents(value($row,'amount')); if ($amount<1) continue;
        $s=$db->prepare('INSERT INTO expenses(description,amount_cents,expense_date,category,created_at) VALUES(?,?,?,?,?)');
        $s->execute([value($row,'description','Imported expense'),$amount,localDate(value($row,'expense_date'),date('Y-m-d')),'General',value($row,'created_at',date('Y-m-d H:i:s'))]);
        saveMap($db,'expenses',$source,(int)$db->lastInsertId()); $counts['expenses']++;
    }
    foreach ($csv['inventory'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'inventory',$source)) continue;
        $name=value($row,'name'); if ($name==='') continue;
        $s=$db->prepare('INSERT OR IGNORE INTO inventory(name,quantity,unit,category,unit_cost_cents,reorder) VALUES(?,?,?,?,?,?)');
        $s->execute([$name,max(0,(int)value($row,'quantity','0')),value($row,'unit','pcs'),value($row,'category','General'),cents(value($row,'cost','0')),max(0,(int)value($row,'reorder','0'))]);
        $find=$db->prepare('SELECT id FROM inventory WHERE name=?'); $find->execute([$name]); $id=(int)$find->fetchColumn(); saveMap($db,'inventory',$source,$id); if($s->rowCount())$counts['inventory']++;
    }
    foreach ($csv['user_notifications'] as $row) {
        $source=value($row,'id'); if ($source===''||mappedId($db,'user_notifications',$source)) continue;
        $userId=userFor($db,$profiles,value($row,'user_id')); if (!$userId) { $warnings[]='A notification had no matching profile and was skipped.'; continue; }
        $booking=mappedId($db,'bookings',value($row,'booking_id'));
        $s=$db->prepare('INSERT INTO notifications(user_id,kind,title,message,related_id,read_at,created_at) VALUES(?,?,?,?,?,?,?)');
        $s->execute([$userId,value($row,'type','legacy'),value($row,'title','KQ notification'),value($row,'message'),$booking,value($row,'read_at')?:null,value($row,'created_at',date('Y-m-d H:i:s'))]);
        saveMap($db,'user_notifications',$source,(int)$db->lastInsertId()); $counts['user_notifications']++;
    }

    if ($apply) $db->commit(); else $db->rollBack();
    echo $apply ? "Import applied.\n" : "Preview only; no records were saved.\n";
    foreach ($counts as $name=>$count) echo str_pad($name,30) . $count . "\n";
    if ($warnings) { echo "Review notes:\n"; foreach (array_unique($warnings) as $warning) echo '- '.$warning."\n"; }
    if (!$apply) echo "To save after reviewing, run again with --apply.\n";
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) $db->rollBack();
    fwrite(STDERR, 'Import stopped safely: ' . $error->getMessage() . "\n");
    exit(1);
}
