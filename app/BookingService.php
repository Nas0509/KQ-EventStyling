<?php
declare(strict_types=1);

final class BookingService
{
    public function __construct(private PDO $db) {}

    public function owned(int $id, array $user): array
    {
        $booking = query($this->db, 'SELECT b.*,p.full_day FROM bookings b JOIN packages p ON p.id=b.package_id WHERE b.id=?', [$id])->fetch();
        if (!$booking || ($user['role'] !== 'admin' && (int)$booking['user_id'] !== (int)$user['id'])) fail(404, 'Booking not found.');
        return $booking;
    }

    public static function occupiedSlots(array $booking): array
    {
        $slots = ['MORNING','AFTERNOON','NIGHT'];
        if ($booking['full_day'] || $booking['distance_km'] > 30) return $slots;
        $index = array_search($booking['slot'], $slots, true);
        return $booking['distance_km'] === 30 ? array_slice($slots, $index, 2) : [$booking['slot']];
    }

    private function checkSchedule(array $booking): void
    {
        foreach (self::occupiedSlots($booking) as $slot) {
            if (query($this->db, 'SELECT 1 FROM schedule_locks WHERE event_date=? AND slot=? AND booking_id<>?',
                [$booking['event_date'],$slot,$booking['id'] ?? 0])->fetchColumn()) fail(409, 'This schedule is already reserved. Choose another slot.');
        }
    }

    private function lockSchedule(array $booking): void
    {
        $this->checkSchedule($booking);
        query($this->db, 'DELETE FROM schedule_locks WHERE booking_id=?', [$booking['id']]);
        foreach (self::occupiedSlots($booking) as $slot) {
            query($this->db, 'INSERT INTO schedule_locks VALUES(?,?,?)', [$booking['event_date'],$slot,$booking['id']]);
        }
    }

    public function create(array $data, array $user): array
    {
        $packageId = number($data, 'package_id', 1, 6);
        $package = query($this->db, 'SELECT * FROM packages WHERE id=?', [$packageId])->fetch();
        if (!$package) fail(422, 'Unknown package.');
        $date = eventDate($data);
        $slot = slot($data);
        $venue = text($data, 'venue', 3, 300);
        $phone = text($data, 'phone', 11, 11);
        if (!preg_match('/^09[0-9]{9}$/D', $phone)) fail(422, 'Use an 11-digit Philippine mobile number starting with 09.');
        $guests = number($data, 'guests', 1, 5000);
        $distance = number($data, 'distance_km', 0, 1000);
        $notes = text($data + ['notes'=>''], 'notes', 0, 2000);
        // Existing pricing: PHP20/km, rounded up to PHP100, plus a 30% deposit.
        $travelCents = (int)ceil(($distance * 20) / 100) * 100 * 100;
        $total = $package['price_cents'] + $travelCents;
        return transaction($this->db, function () use ($user,$package,$packageId,$date,$slot,$venue,$phone,$guests,$distance,$notes,$total) {
            $this->checkSchedule(['event_date'=>$date,'slot'=>$slot,'distance_km'=>$distance,'full_day'=>$package['full_day']]);
            query($this->db, 'INSERT INTO bookings(user_id,package_id,event_date,slot,venue,phone,guests,distance_km,notes,total_cents,deposit_cents) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                [$user['id'],$packageId,$date,$slot,$venue,$phone,$guests,$distance,$notes,$total,(int)round($total * 0.3)]);
            $id = (int)$this->db->lastInsertId();
            audit($this->db, $user['id'], 'booking.created', ['booking_id'=>$id]);
            return $this->owned($id, $user);
        });
    }

    public function review(int $id, string $status, array $user): void
    {
        admin($user);
        if (!in_array($status, ['approved','rejected','cancelled','completed'], true)) fail(422, 'Invalid booking status.');
        transaction($this->db, function () use ($id,$status,$user) {
            $booking = $this->owned($id, $user);
            $allowed = ['pending'=>['approved','rejected','cancelled'], 'approved'=>['cancelled','completed']];
            if (!in_array($status, $allowed[$booking['status']] ?? [], true)) fail(409, 'Invalid status transition. Refresh this booking.');
            if ($status === 'approved') {
                eventDate($booking);
                $paid = (int)query($this->db, "SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE booking_id=? AND status='verified'", [$id])->fetchColumn();
                if ($paid < $booking['deposit_cents']) fail(409, 'Verify the 30% reservation payment before approval.');
                $this->lockSchedule($booking);
            } else {
                query($this->db, 'DELETE FROM schedule_locks WHERE booking_id=?', [$id]);
            }
            query($this->db, 'UPDATE bookings SET status=? WHERE id=?', [$status,$id]);
            query($this->db, "UPDATE change_requests SET status='rejected' WHERE booking_id=? AND status='pending'", [$id]);
            audit($this->db, $user['id'], 'booking.' . $status, ['booking_id'=>$id]);
        });
    }

    public function requestChange(array $data, array $user): void
    {
        $id = number($data, 'booking_id', 1, PHP_INT_MAX);
        $type = text($data, 'type');
        if (!in_array($type, ['cancel','reschedule'], true)) fail(422, 'Invalid request type.');
        $reason = text($data, 'reason', 5, 1000);
        $date = $type === 'reschedule' ? eventDate($data) : null;
        $slot = $type === 'reschedule' ? slot($data) : null;
        transaction($this->db, function () use ($id,$type,$reason,$date,$slot,$user) {
            $booking = $this->owned($id,$user);
            if (!in_array($booking['status'], ['pending','approved'], true)) fail(409, 'This booking cannot be changed.');
            if (query($this->db, "SELECT 1 FROM change_requests WHERE booking_id=? AND status='pending'", [$id])->fetchColumn()) fail(409, 'A change request is already pending.');
            query($this->db, 'INSERT INTO change_requests(booking_id,type,reason,event_date,slot) VALUES(?,?,?,?,?)', [$id,$type,$reason,$date,$slot]);
            audit($this->db,$user['id'],'change.requested',['booking_id'=>$id,'type'=>$type]);
        });
    }

    public function reviewChange(int $id, bool $approve, array $user): void
    {
        admin($user);
        transaction($this->db, function () use ($id,$approve,$user) {
            $request = query($this->db, 'SELECT * FROM change_requests WHERE id=?', [$id])->fetch();
            if (!$request) fail(404, 'Request not found.');
            if ($request['status'] !== 'pending') fail(409, 'Request has already been reviewed.');
            $booking = $this->owned($request['booking_id'],$user);
            if (!in_array($booking['status'], ['pending','approved'], true)) fail(409, 'Booking is no longer active.');
            if ($approve && $request['type'] === 'cancel') {
                query($this->db, "UPDATE bookings SET status='cancelled' WHERE id=?", [$booking['id']]);
                query($this->db, 'DELETE FROM schedule_locks WHERE booking_id=?', [$booking['id']]);
            } elseif ($approve) {
                eventDate($request);
                $booking['event_date'] = $request['event_date'];
                $booking['slot'] = $request['slot'];
                $this->checkSchedule($booking);
                if ($booking['status'] === 'approved') $this->lockSchedule($booking);
                query($this->db, 'UPDATE bookings SET event_date=?,slot=? WHERE id=?', [$booking['event_date'],$booking['slot'],$booking['id']]);
            }
            query($this->db, 'UPDATE change_requests SET status=? WHERE id=?', [$approve ? 'approved' : 'rejected',$id]);
            audit($this->db,$user['id'],'change.reviewed',['request_id'=>$id,'approved'=>$approve]);
        });
    }
}
