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
        return (float)$booking['distance_km'] === 30.0 ? array_slice($slots, $index, 2) : [$booking['slot']];
    }

    private static function validateSlotTime(string $slot, string $time, string $invalidMessage): void
    {
        if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $time)) fail(422, $invalidMessage);
        $minutes = ((int)substr($time, 0, 2)) * 60 + (int)substr($time, 3, 2);
        $ranges = ['MORNING'=>[360,715,'6:00 AM - 11:55 AM'], 'AFTERNOON'=>[720,1075,'12:00 PM - 5:55 PM'], 'NIGHT'=>[1080,1435,'6:00 PM - 11:55 PM']];
        [$first,$last,$label] = $ranges[$slot];
        if ($minutes % 5 !== 0 || $minutes < $first || $minutes > $last) fail(422, "Please choose a time between $label for the " . ucfirst(strtolower($slot)) . ' slot.');
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
        $eventType = text($data + ['event_type'=>'Celebration'], 'event_type', 2, 80);
        $eventTime = trim((string)($data['event_time'] ?? ''));
        if ($eventTime === '') fail(422, 'Choose an event start time.');
        self::validateSlotTime($slot, $eventTime, 'Choose a valid event start time.');
        $venueCity = trim((string)($data['venue_city'] ?? ''));
        if (mb_strlen($venueCity) > 120) fail(422, 'Venue city is too long.');
        $distance = $venueCity !== ''
            ? round(InspectionService::travelDistanceTenths(InspectionService::cityCoordinates($venueCity)) / 10,1)
            : number($data, 'distance_km', 0, 1000);
        $venueAddress = trim((string)($data['venue_address'] ?? ''));
        if ($venueAddress !== '' && (mb_strlen($venueAddress) < 3 || mb_strlen($venueAddress) > 300)) fail(422, 'Venue address must contain 3 to 300 characters.');
        $venue = text($data + ['venue'=>trim($venueAddress . ($venueCity !== '' ? ', ' . $venueCity : ''))], 'venue', 3, 300);
        $phone = text($data, 'phone', 11, 11);
        if (!preg_match('/^09[0-9]{9}$/D', $phone)) fail(422, 'Use an 11-digit Philippine mobile number starting with 09.');
        $guests = number($data, 'guests', 1, 5000);
        $notes = text($data + ['notes'=>''], 'notes', 0, 2000);
        $theme = text($data + ['theme'=>''], 'theme', 0, 120);
        $colors = text($data + ['colors'=>''], 'colors', 0, 120);
        $paymentReference = text($data, 'payment_reference', 1, 16);
        // Existing pricing: PHP20/km, rounded up to PHP100, plus a 30% deposit.
        $travelCents = (int)ceil(($distance * 20) / 100) * 100 * 100;
        $total = $package['price_cents'] + $travelCents;
        return transaction($this->db, function () use ($user,$package,$packageId,$date,$slot,$eventType,$eventTime,$venueCity,$venueAddress,$venue,$phone,$guests,$distance,$notes,$theme,$colors,$paymentReference,$total) {
            $this->checkSchedule(['event_date'=>$date,'slot'=>$slot,'distance_km'=>$distance,'full_day'=>$package['full_day']]);
            query($this->db, 'INSERT INTO bookings(user_id,package_id,event_date,slot,event_type,event_time,venue_city,venue_address,theme,colors,venue,phone,guests,distance_km,notes,total_cents,deposit_cents) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [$user['id'],$packageId,$date,$slot,$eventType,$eventTime,$venueCity,$venueAddress,$theme,$colors,$venue,$phone,$guests,$distance,$notes,$total,(int)round($total * 0.3)]);
            $id = (int)$this->db->lastInsertId();
            try { query($this->db, 'INSERT INTO payments(booking_id,reference,amount_cents) VALUES(?,?,?)', [$id,$paymentReference,(int)round($total * 0.3)]); }
            catch (PDOException) { fail(409, 'This payment reference was already submitted.'); }
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
            $title = $status === 'approved' ? 'Booking request approved' : 'Booking request updated';
            notifyUser($this->db, (int)$booking['user_id'], 'booking.' . $status, $title, 'Your booking request #' . $id . ' is now ' . $status . '.', $id);
            audit($this->db, $user['id'], 'booking.' . $status, ['booking_id'=>$id]);
        });
    }

    public function requestChange(array $data, array $user): void
    {
        $id = number($data, 'booking_id', 1, PHP_INT_MAX);
        $type = text($data, 'type');
        if (!in_array($type, ['cancel','reschedule'], true)) fail(422, 'Invalid request type.');
        $reason = text($data, 'reason', 10, 1000);
        $date = $type === 'reschedule' ? eventDate($data) : null;
        $slot = $type === 'reschedule' ? slot($data) : null;
        $eventTime = $type === 'reschedule' ? text($data, 'event_time', 5, 5) : null;
        if ($eventTime !== null) self::validateSlotTime($slot, $eventTime, 'Choose a valid replacement event time.');
        transaction($this->db, function () use ($id,$type,$reason,$date,$slot,$eventTime,$user) {
            $booking = $this->owned($id,$user);
            if ($booking['status'] !== 'approved') fail(409, 'Only approved bookings can be changed.');
            if (query($this->db, "SELECT 1 FROM change_requests WHERE booking_id=? AND status='pending'", [$id])->fetchColumn()) fail(409, 'A change request is already pending.');
            $nonrefundable = $type==='cancel';
            if ($type==='reschedule') {
                $today=new DateTimeImmutable('today');
                $oldDays=(int)$today->diff(new DateTimeImmutable($booking['event_date']))->format('%r%a');
                $newDays=(int)$today->diff(new DateTimeImmutable((string)$date))->format('%r%a');
                $nonrefundable=min($oldDays,$newDays)<30;
            }
            $status='pending';
            if ($type==='reschedule' && !$nonrefundable) {
                $booking['event_date']=$date; $booking['slot']=$slot;
                $this->checkSchedule($booking);
                $this->lockSchedule($booking);
                query($this->db,'UPDATE bookings SET event_date=?,event_time=?,slot=? WHERE id=?',[$date,$eventTime,$slot,$id]);
                $status='approved';
            }
            query($this->db, 'INSERT INTO change_requests(booking_id,type,reason,event_date,event_time,slot,reservation_fee_nonrefundable,status) VALUES(?,?,?,?,?,?,?,?)', [$id,$type,$reason,$date,$eventTime,$slot,(int)$nonrefundable,$status]);
            notifyUser($this->db,(int)$user['id'],'change.'.$status,'Booking change request '.$status,$status==='approved'?'Your booking was automatically rescheduled to '.$date.' at '.$eventTime.'.':'Your '.$type.' request was sent to KQ for review.'.($nonrefundable?' The reservation fee is non-refundable.':''),$id);
            audit($this->db,$user['id'],'change.requested',['booking_id'=>$id,'type'=>$type,'status'=>$status,'reservation_fee_nonrefundable'=>$nonrefundable]);
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
            if ($booking['status'] !== 'approved') fail(409, 'Booking is no longer active.');
            if ($approve && $request['type'] === 'cancel') {
                query($this->db, "UPDATE bookings SET status='cancelled' WHERE id=?", [$booking['id']]);
                query($this->db, 'DELETE FROM schedule_locks WHERE booking_id=?', [$booking['id']]);
            } elseif ($approve) {
                eventDate($request);
                $booking['event_date'] = $request['event_date'];
                $booking['slot'] = $request['slot'];
                $this->checkSchedule($booking);
                if ($booking['status'] === 'approved') $this->lockSchedule($booking);
                query($this->db, 'UPDATE bookings SET event_date=?,event_time=?,slot=? WHERE id=?', [$booking['event_date'],$request['event_time'],$booking['slot'],$booking['id']]);
            }
            query($this->db, 'UPDATE change_requests SET status=? WHERE id=?', [$approve ? 'approved' : 'rejected',$id]);
            notifyUser($this->db, (int)$booking['user_id'], 'change.' . ($approve?'approved':'rejected'), 'Booking change request reviewed', 'Your ' . $request['type'] . ' request for booking #' . $booking['id'] . ' was ' . ($approve?'approved':'declined') . '.' . ((int)$request['reservation_fee_nonrefundable']===1?' The reservation fee is non-refundable.':''), (int)$booking['id']);
            audit($this->db,$user['id'],'change.reviewed',['request_id'=>$id,'approved'=>$approve]);
        });
    }
}
