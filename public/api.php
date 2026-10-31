<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once dirname(__DIR__) . '/app/BookingService.php';

try {
    $db = Database::connect();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? '';
    $mutating = in_array($method, ['POST','PATCH','PUT','DELETE'], true);
    $input = [];
    if ($mutating) {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail(419, 'Your session expired. Refresh the page and try again.');
        if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail(415, 'Use application/json.');
        $input = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($input)) fail(422, 'JSON object expected.');
    }
    $user = currentUser($db, false);
    $booking = new BookingService($db);
    switch ($action) {
        case 'bootstrap':
            respond(['csrf'=>$_SESSION['csrf'], 'user'=>$user, 'packages'=>query($db, 'SELECT id,name,price_cents,full_day FROM packages ORDER BY id')->fetchAll()]);
        case 'register':
            if ($method !== 'POST') fail(405, 'POST required.');
            $name = text($input, 'name', 2, 80);
            $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
            $password = $input['password'] ?? '';
            if (!$email || !is_string($password) || strlen($password) < 10 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) fail(422, 'Use a valid email and a password with 10+ characters, upper/lowercase letters, and a number.');
            try { query($db, 'INSERT INTO users(name,email,password_hash) VALUES(?,?,?)', [$name,strtolower($email),password_hash($password,PASSWORD_DEFAULT)]); }
            catch (PDOException $e) { fail(409, 'That email is already registered.'); }
            session_regenerate_id(true); $_SESSION['user_id']=(int)$db->lastInsertId(); audit($db,$_SESSION['user_id'],'auth.registered',[]); respond(['user'=>currentUser($db)],201);
        case 'login':
            if ($method !== 'POST') fail(405, 'POST required.');
            $email = strtolower(text($input,'email',5,254)); $password = $input['password'] ?? '';
            $key = hash('sha256', strtolower($email) . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
            $attempt = query($db, 'SELECT * FROM login_attempts WHERE attempt_key=?',[$key])->fetch();
            if ($attempt && $attempt['failures'] >= 5 && time() - $attempt['last_attempt'] < 900) fail(429, 'Too many failed sign-in attempts. Try again in 15 minutes.');
            $account = query($db,'SELECT * FROM users WHERE email=?',[$email])->fetch();
            if (!$account || !is_string($password) || !password_verify($password,$account['password_hash'])) {
                query($db, 'INSERT INTO login_attempts VALUES(?,?,?) ON CONFLICT(attempt_key) DO UPDATE SET failures=failures+1,last_attempt=excluded.last_attempt',[$key,1,time()]);
                fail(401,'Invalid email or password.');
            }
            query($db,'DELETE FROM login_attempts WHERE attempt_key=?',[$key]); session_regenerate_id(true); $_SESSION['user_id']=(int)$account['id']; audit($db,$_SESSION['user_id'],'auth.signed_in',[]); respond(['user'=>currentUser($db)]);
        case 'logout':
            if ($method !== 'POST') fail(405,'POST required.');
            if ($user) audit($db,$user['id'],'auth.signed_out',[]); $_SESSION=[]; session_destroy(); respond(['logged_out'=>true]);
        case 'availability':
            $date = eventDate($_GET); $slots=['MORNING','AFTERNOON','NIGHT'];
            $taken = query($db,'SELECT slot FROM schedule_locks WHERE event_date=?',[$date])->fetchAll(PDO::FETCH_COLUMN);
            respond(['event_date'=>$date,'available_slots'=>array_values(array_diff($slots,$taken))]);
        case 'bookings':
            if (!$user) fail(401,'Please sign in.');
            if ($method === 'GET') {
                if ($user['role'] === 'admin') $rows=query($db,'SELECT b.*,u.name customer_name,u.email,p.name package_name FROM bookings b JOIN users u ON u.id=b.user_id JOIN packages p ON p.id=b.package_id ORDER BY b.created_at DESC')->fetchAll();
                else $rows=query($db,'SELECT b.*,p.name package_name FROM bookings b JOIN packages p ON p.id=b.package_id WHERE b.user_id=? ORDER BY b.created_at DESC',[$user['id']])->fetchAll();
                respond($rows);
            }
            if ($method === 'POST') respond($booking->create($input,$user),201);
            fail(405,'Method not allowed.');
        case 'booking-status':
            if ($method !== 'PATCH' || !$user) fail(405,'PATCH required.'); $booking->review(number($input,'booking_id',1,PHP_INT_MAX),text($input,'status'),$user); respond(['updated'=>true]);
        case 'payment':
            if ($method !== 'POST' || !$user) fail(405,'POST required.');
            $id=number($input,'booking_id',1,PHP_INT_MAX); $record=$booking->owned($id,$user); $reference=text($input,'reference',5,80);
            if ($record['user_id'] !== $user['id']) fail(403,'Only the customer can submit a payment.');
            try { query($db,'INSERT INTO payments(booking_id,reference,amount_cents) VALUES(?,?,?)',[$id,$reference,$record['deposit_cents']]); }
            catch (PDOException $e) { fail(409,'This payment reference was already submitted.'); }
            audit($db,$user['id'],'payment.submitted',['booking_id'=>$id]); respond(['submitted'=>true],201);
        case 'payment-status':
            if ($method !== 'PATCH' || !$user) fail(405,'PATCH required.'); admin($user); $id=number($input,'payment_id',1,PHP_INT_MAX); $status=text($input,'status'); if (!in_array($status,['verified','rejected'],true)) fail(422,'Invalid payment status.'); query($db,"UPDATE payments SET status=? WHERE id=? AND status='pending'",[$status,$id]); if (!$db->query('SELECT changes()')->fetchColumn()) fail(409,'Payment was already reviewed.'); audit($db,$user['id'],'payment.'.$status,['payment_id'=>$id]); respond(['updated'=>true]);
        case 'changes':
            if (!$user) fail(401,'Please sign in.'); if ($method==='POST') { $booking->requestChange($input,$user); respond(['requested'=>true],201); }
            if ($method==='GET') { admin($user); respond(query($db,'SELECT c.*,b.event_date booking_date,u.name customer_name FROM change_requests c JOIN bookings b ON b.id=c.booking_id JOIN users u ON u.id=b.user_id WHERE c.status="pending" ORDER BY c.created_at')->fetchAll()); }
            fail(405,'Method not allowed.');
        case 'change-status':
            if ($method !== 'PATCH' || !$user) fail(405,'PATCH required.'); $booking->reviewChange(number($input,'request_id',1,PHP_INT_MAX),($input['approve'] ?? null) === true,$user); respond(['updated'=>true]);
        case 'dashboard':
            if (!$user) fail(401,'Please sign in.'); admin($user);
            respond(['pending_bookings'=>(int)query($db,"SELECT count(*) FROM bookings WHERE status='pending'")->fetchColumn(),'pending_payments'=>(int)query($db,"SELECT count(*) FROM payments WHERE status='pending'")->fetchColumn(),'pending_changes'=>(int)query($db,"SELECT count(*) FROM change_requests WHERE status='pending'")->fetchColumn(),'revenue_cents'=>(int)query($db,"SELECT coalesce(sum(amount_cents),0) FROM payments WHERE status='verified'")->fetchColumn()]);
        default: fail(404,'Unknown API endpoint.');
    }
} catch (ApiError $e) { http_response_code($e->status); header('Content-Type: application/json; charset=utf-8'); echo json_encode(['data'=>null,'error'=>$e->getMessage()]); }
catch (JsonException) { http_response_code(400); header('Content-Type: application/json; charset=utf-8'); echo json_encode(['data'=>null,'error'=>'Malformed JSON request.']); }
catch (Throwable $e) { error_log($e->__toString()); http_response_code(500); header('Content-Type: application/json; charset=utf-8'); echo json_encode(['data'=>null,'error'=>'An unexpected server error occurred.']); }
