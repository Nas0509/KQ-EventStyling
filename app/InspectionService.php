<?php
declare(strict_types=1);

final class InspectionService
{
    public function __construct(private PDO $db) {}

    public static function cities(): array
    {
        $projectRoot = dirname(__DIR__);
        $sourcePath = is_file($projectRoot . '/location-data.js')
            ? $projectRoot . '/location-data.js'
            : $projectRoot . '/public/location-data.js';
        $source = @file_get_contents($sourcePath);
        if ($source === false || !preg_match('/KQ_LUZON_CITY_COORDINATES\s*=\s*(\[.*?\]);/s', $source, $match)) {
            fail(503, 'Venue distance data is unavailable. Please contact KQ.');
        }
        return json_decode($match[1], true, 512, JSON_THROW_ON_ERROR);
    }

    public static function cityCoordinates(string $city): array
    {
        $cities = self::cities();
        $needle = mb_strtolower(trim($city));
        foreach ($cities as $item) {
            $label = $item['province'] && $item['province'] !== $item['region']
                ? $item['name'] . ', ' . $item['province'] . ' — ' . $item['region']
                : $item['name'] . ' — ' . $item['region'];
            if (mb_strtolower($label) === $needle) return $item;
        }
        fail(422, 'Choose a Luzon city or municipality from the provided list.');
    }

    public static function travelDistanceTenths(array $city): int
    {
        $origin = ['lat' => 14.75054, 'lng' => 121.05406];
        $radians = static fn(float $degrees): float => $degrees * M_PI / 180;
        $lat1 = $radians($origin['lat']); $lat2 = $radians((float)$city['lat']);
        $deltaLat = $radians((float)$city['lat'] - $origin['lat']);
        $deltaLng = $radians((float)$city['lng'] - $origin['lng']);
        $value = sin($deltaLat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($deltaLng / 2) ** 2;
        return (int)round((6371 * 2 * atan2(sqrt($value), sqrt(1 - $value))) * 10);
    }

    public function list(array $user): array
    {
        if ($user['role'] === 'admin') {
            return query($this->db, 'SELECT i.*,u.name customer_name FROM ocular_inspections i JOIN users u ON u.id=i.user_id ORDER BY CASE i.status WHEN \'pending\' THEN 0 ELSE 1 END,i.created_at DESC')->fetchAll();
        }
        return query($this->db, 'SELECT * FROM ocular_inspections WHERE user_id=? ORDER BY created_at DESC', [$user['id']])->fetchAll();
    }

    public function create(array $data, array $user): array
    {
        $name = text($data, 'contact_name', 2, 80);
        $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if (!$email) fail(422, 'Enter a valid email address.');
        $phone = text($data, 'phone', 11, 11);
        if (!preg_match('/^09[0-9]{9}$/D', $phone)) fail(422, 'Use an 11-digit Philippine mobile number starting with 09.');
        $venueName = text($data + ['venue_name'=>'Venue to be confirmed'], 'venue_name', 2, 160);
        $address = text($data, 'venue_address', 5, 300);
        $cityLabel = text($data, 'venue_city', 4, 180);
        $city = self::cityCoordinates($cityLabel);
        $inspectionDate = eventDate($data, 'inspection_date');
        $inspectionTime = text($data, 'inspection_time', 5, 5);
        if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $inspectionTime)) fail(422, 'Choose a valid inspection time.');
        $paymentReference = text($data, 'payment_reference', 1, 16);
        $distanceTenths = self::travelDistanceTenths($city);
        $feeCents = (int)ceil((1500 + (($distanceTenths / 10) * 20)) / 100) * 100 * 100;

        return transaction($this->db, function () use ($user,$name,$email,$phone,$venueName,$address,$cityLabel,$inspectionDate,$inspectionTime,$paymentReference,$distanceTenths,$feeCents) {
            $this->assertScheduleAvailable($inspectionDate, $inspectionTime, $distanceTenths / 10);
            $nextId = (int)query($this->db, 'SELECT COALESCE(MAX(id),0)+1 FROM ocular_inspections')->fetchColumn();
            $requestCode = 'OI-' . str_pad((string)$nextId, 4, '0', STR_PAD_LEFT);
            query($this->db, 'INSERT INTO ocular_inspections(request_code,user_id,contact_name,email,phone,venue_name,venue_address,venue_city,event_date,inspection_date,inspection_time,distance_km,fee_cents,payment_reference) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [$requestCode,$user['id'],$name,strtolower($email),$phone,$venueName,$address,$cityLabel,$inspectionDate,$inspectionDate,$inspectionTime,round($distanceTenths/10,1),$feeCents,$paymentReference]);
            $id = lastInsertId($this->db);
            audit($this->db, $user['id'], 'inspection.requested', ['inspection_id'=>$id,'request_code'=>$requestCode]);
            return query($this->db, 'SELECT * FROM ocular_inspections WHERE id=?', [$id])->fetch();
        });
    }

    public function review(int $id, string $status, string $notes, array $user): void
    {
        admin($user);
        if (!in_array($status, ['approved','declined','cancelled','completed'], true)) fail(422, 'Invalid inspection status.');
        $notes = trim($notes);
        if (mb_strlen($notes) > 1000) fail(422, 'Admin notes are too long.');
        transaction($this->db, function () use ($id,$status,$notes,$user) {
            $request = query($this->db, 'SELECT * FROM ocular_inspections WHERE id=?', [$id])->fetch();
            if (!$request) fail(404, 'Inspection request not found.');
            if ($request['status'] !== 'pending') fail(409, 'Inspection request has already been reviewed.');
            if ($status === 'approved') $this->assertScheduleAvailable($request['inspection_date'], $request['inspection_time'], (float)$request['distance_km'], $id);
            query($this->db, 'UPDATE ocular_inspections SET status=?,admin_notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [$status,$notes,$id]);
            $title = $status === 'approved' ? 'Ocular inspection approved' : 'Ocular inspection update';
            $message = $status === 'approved'
                ? 'Your ocular inspection request ' . $request['request_code'] . ' has been approved by KQ Event Styling.'
                : 'Your ocular inspection request ' . $request['request_code'] . ' was ' . $status . '.';
            notifyUser($this->db, (int)$request['user_id'], 'inspection.' . $status, $title, $message, $id);
            audit($this->db, $user['id'], 'inspection.' . $status, ['inspection_id'=>$id]);
        });
    }

    private function assertScheduleAvailable(string $date, string $time, float $distanceKm, ?int $excludeId = null): void
    {
        $minute = ((int)substr($time, 0, 2)) * 60 + (int)substr($time, 3, 2);
        if ($minute < 360 || $minute >= 1440) fail(422, 'Choose an ocular appointment time between 6:00 AM and midnight.');
        $slot = $minute < 720 ? 'MORNING' : ($minute < 1080 ? 'AFTERNOON' : 'NIGHT');
        if (in_array($slot, BookingService::occupiedSlotsForDate($this->db, $date), true)) fail(409, 'This time slot is already reserved for an event booking.');
        $others = query($this->db, "SELECT inspection_time,distance_km FROM ocular_inspections WHERE inspection_date=? AND status='approved' AND id<>?", [$date,$excludeId ?? 0])->fetchAll();
        foreach ($others as $other) {
            $otherMinute = ((int)substr($other['inspection_time'],0,2))*60 + (int)substr($other['inspection_time'],3,2);
            $otherSlot = $otherMinute < 720 ? 'MORNING' : ($otherMinute < 1080 ? 'AFTERNOON' : 'NIGHT');
            if ($otherSlot === $slot) fail(409, 'This time slot is already reserved for an accepted ocular inspection.');
            $gap = abs($minute - $otherMinute);
            $required = 150 + (int)ceil(($distanceKm + (float)$other['distance_km']) * 3);
            if ($gap < $required) fail(409, 'This time is too close to another accepted ocular inspection. Allow at least ' . number_format($required / 60, 1) . ' hours between locations for travel, the inspection, and a safety buffer.');
        }
    }
}
