-- Run once in Supabase SQL Editor before deploying the matching site files.
-- Each date has at most one accepted event/ocular appointment per time slot.
-- Pending ocular requests do not hold a slot until an admin accepts them.

alter table public.bookings
    add column if not exists time_slot text;

alter table public.ocular_inspection_requests
    add column if not exists inspection_distance_km numeric;

create or replace function public.kq_appointment_slot_is_booked(
    p_event_date date,
    p_slot text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
    select exists (
        select 1
        from public.bookings b
        where b.event_date = p_event_date
          and upper(coalesce(b.status, '')) = 'APPROVED'
          and coalesce(
                nullif(upper(trim(b.time_slot)), ''),
                case
                    when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
                    when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
                    when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
                    else null
                end
              ) = upper(p_slot)
    ) or exists (
        select 1
        from public.ocular_inspection_requests r
        where r.inspection_date = p_event_date
          and upper(coalesce(r.status, '')) = 'APPROVED'
          and case
                when r.inspection_time >= time '06:00' and r.inspection_time < time '12:00' then 'MORNING'
                when r.inspection_time >= time '12:00' and r.inspection_time < time '18:00' then 'AFTERNOON'
                when r.inspection_time >= time '18:00' and r.inspection_time < time '24:00' then 'NIGHT'
                else null
              end = upper(p_slot)
    );
$function$;

create or replace function public.kq_booking_slot_availability(
    p_start_date date,
    p_end_date date
)
returns table (
    event_date date,
    morning_booked boolean,
    afternoon_booked boolean,
    night_booked boolean
)
language sql
stable
security definer
set search_path = public
as $function$
    select
        calendar_days.calendar_date::date as event_date,
        public.kq_appointment_slot_is_booked(calendar_days.calendar_date::date, 'MORNING') as morning_booked,
        public.kq_appointment_slot_is_booked(calendar_days.calendar_date::date, 'AFTERNOON') as afternoon_booked,
        public.kq_appointment_slot_is_booked(calendar_days.calendar_date::date, 'NIGHT') as night_booked
    from generate_series(p_start_date::timestamp, p_end_date::timestamp, interval '1 day') as calendar_days(calendar_date)
    where p_start_date <= p_end_date;
$function$;

revoke all on function public.kq_booking_slot_availability(date, date) from public;
grant execute on function public.kq_booking_slot_availability(date, date) to anon, authenticated;
revoke all on function public.kq_appointment_slot_is_booked(date, text) from public;
grant execute on function public.kq_appointment_slot_is_booked(date, text) to anon, authenticated;

create or replace function public.kq_enforce_booking_slot_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
    slot_start_time time;
    slot_booking_count integer;
begin
    if tg_op = 'UPDATE'
       and old.event_date is not distinct from new.event_date
       and old.start_time is not distinct from new.start_time
       and old.time_slot is not distinct from new.time_slot
       and old.status is not distinct from new.status then
        return new;
    end if;

    if new.start_time is not null then
        slot_start_time := new.start_time::time;
    end if;

    new.time_slot := coalesce(
        nullif(upper(trim(new.time_slot)), ''),
        case
            when slot_start_time >= time '06:00' and slot_start_time < time '12:00' then 'MORNING'
            when slot_start_time >= time '12:00' and slot_start_time < time '18:00' then 'AFTERNOON'
            when slot_start_time >= time '18:00' and slot_start_time < time '24:00' then 'NIGHT'
            else null
        end
    );

    if new.event_date is null or new.time_slot is null or new.time_slot not in ('MORNING', 'AFTERNOON', 'NIGHT') then
        raise exception 'Choose a valid event date and available time slot.' using errcode = '23514';
    end if;

    if slot_start_time is null
       or (new.time_slot = 'MORNING' and not (slot_start_time >= time '06:00' and slot_start_time < time '12:00'))
       or (new.time_slot = 'AFTERNOON' and not (slot_start_time >= time '12:00' and slot_start_time < time '18:00'))
       or (new.time_slot = 'NIGHT' and not (slot_start_time >= time '18:00' and slot_start_time < time '24:00')) then
        raise exception 'Start time must fall within the selected time slot.' using errcode = '23514';
    end if;

    -- Pending requests do not reserve their slot until approved.
    if upper(coalesce(new.status, '')) <> 'APPROVED' then
        return new;
    end if;

    -- Serialize approved event and ocular appointments across the whole date.
    perform pg_advisory_xact_lock(hashtext(new.event_date::text), 1901);

    select count(*)
      into slot_booking_count
      from public.bookings b
     where b.event_date = new.event_date
       and upper(coalesce(b.status, '')) = 'APPROVED'
       and coalesce(nullif(upper(trim(b.time_slot)), ''),
           case
               when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
               when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
               when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
               else null
           end) = new.time_slot
       and (tg_op = 'INSERT' or b.id is distinct from new.id);

    if slot_booking_count > 0 then
        raise exception 'That time slot has already been reserved. Please choose another date or time.' using errcode = '23505';
    end if;

    if exists (
        select 1
          from public.ocular_inspection_requests r
         where r.inspection_date = new.event_date
           and upper(coalesce(r.status, '')) = 'APPROVED'
           and case
                 when r.inspection_time >= time '06:00' and r.inspection_time < time '12:00' then 'MORNING'
                 when r.inspection_time >= time '12:00' and r.inspection_time < time '18:00' then 'AFTERNOON'
                 when r.inspection_time >= time '18:00' and r.inspection_time < time '24:00' then 'NIGHT'
                 else null
               end = new.time_slot
    ) then
        raise exception 'That time slot is reserved for an accepted ocular inspection.' using errcode = '23505';
    end if;

    return new;
end;
$function$;

drop trigger if exists kq_enforce_booking_slot_capacity on public.bookings;
create trigger kq_enforce_booking_slot_capacity
before insert or update on public.bookings
for each row execute function public.kq_enforce_booking_slot_capacity();

-- Conservative same-day travel validation for ocular inspections:
-- 30 km/h average speed with a 1.5x road/traffic multiplier = 3 minutes/km.
-- Add 60 minutes for the inspection itself and 90 minutes for setup/traffic buffer.
-- Distances between two venues are estimated via North Caloocan, a conservative route.
create or replace function public.kq_validate_ocular_schedule_internal(
    p_inspection_date date,
    p_inspection_time time,
    p_distance_from_base_km numeric,
    p_exclude_request_id text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
    requested_slot text;
    other_appointment record;
    gap_minutes numeric;
    estimated_drive_minutes numeric;
    required_gap_minutes numeric;
begin
    if p_inspection_date is null or p_inspection_time is null
       or p_distance_from_base_km is null or p_distance_from_base_km < 0 then
        return 'Choose a date, time, and Luzon location so availability and travel time can be checked.';
    end if;

    requested_slot := case
        when p_inspection_time >= time '06:00' and p_inspection_time < time '12:00' then 'MORNING'
        when p_inspection_time >= time '12:00' and p_inspection_time < time '18:00' then 'AFTERNOON'
        when p_inspection_time >= time '18:00' and p_inspection_time < time '24:00' then 'NIGHT'
        else null
    end;
    if requested_slot is null then
        return 'Choose an ocular appointment time between 6:00 AM and midnight.';
    end if;

    if exists (
        select 1
        from public.bookings b
        where b.event_date = p_inspection_date
          and upper(coalesce(b.status, '')) = 'APPROVED'
          and coalesce(
                nullif(upper(trim(b.time_slot)), ''),
                case
                    when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
                    when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
                    when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
                    else null
                end
              ) = requested_slot
    ) then
        return format('The %s slot is already reserved for an event booking.', lower(requested_slot));
    end if;

    if exists (
        select 1
        from public.ocular_inspection_requests r
        where r.inspection_date = p_inspection_date
          and upper(coalesce(r.status, '')) = 'APPROVED'
          and r.id::text <> coalesce(p_exclude_request_id, '')
          and case
                when r.inspection_time >= time '06:00' and r.inspection_time < time '12:00' then 'MORNING'
                when r.inspection_time >= time '12:00' and r.inspection_time < time '18:00' then 'AFTERNOON'
                when r.inspection_time >= time '18:00' and r.inspection_time < time '24:00' then 'NIGHT'
                else null
              end = requested_slot
    ) then
        return format('The %s slot is already reserved for an accepted ocular inspection.', lower(requested_slot));
    end if;

    for other_appointment in
        select r.id::text as id,
               r.inspection_time,
               r.inspection_distance_km
        from public.ocular_inspection_requests r
        where r.inspection_date = p_inspection_date
          and upper(coalesce(r.status, '')) = 'APPROVED'
          and r.inspection_time is not null
          and r.id::text <> coalesce(p_exclude_request_id, '')
    loop
        if other_appointment.inspection_distance_km is null then
            return 'Travel time cannot be confirmed because an accepted inspection is missing its distance. Ask the admin to update that inspection distance first.';
        end if;

        gap_minutes := abs(extract(epoch from (p_inspection_time - other_appointment.inspection_time)) / 60.0);
        estimated_drive_minutes := ceil(
            (p_distance_from_base_km + other_appointment.inspection_distance_km) * 3
        );
        required_gap_minutes := 150 + estimated_drive_minutes;

        if gap_minutes < required_gap_minutes then
            return format(
                'This time is too close to another accepted ocular inspection. Allow at least %s hours between these locations for travel, the inspection, and a safety buffer.',
                to_char(required_gap_minutes / 60.0, 'FM999990.0')
            );
        end if;
    end loop;

    return null;
end;
$function$;

revoke all on function public.kq_validate_ocular_schedule_internal(date, time, numeric, text) from public;

create or replace function public.kq_validate_ocular_inspection_schedule(
    p_inspection_date date,
    p_inspection_time time,
    p_distance_from_base_km numeric
)
returns text
language sql
security definer
set search_path = ''
as $function$
    select public.kq_validate_ocular_schedule_internal(
        p_inspection_date,
        p_inspection_time,
        p_distance_from_base_km,
        null
    );
$function$;

revoke all on function public.kq_validate_ocular_inspection_schedule(date, time, numeric) from public;
grant execute on function public.kq_validate_ocular_inspection_schedule(date, time, numeric) to anon, authenticated;

create or replace function public.kq_enforce_accepted_ocular_schedule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
    schedule_issue text;
begin
    if upper(coalesce(new.status, '')) <> 'APPROVED' then
        return new;
    end if;

    if tg_op = 'UPDATE'
       and upper(coalesce(old.status, '')) = 'APPROVED'
       and old.inspection_date is not distinct from new.inspection_date
       and old.inspection_time is not distinct from new.inspection_time
       and old.inspection_distance_km is not distinct from new.inspection_distance_km then
        return new;
    end if;

    if new.inspection_date is null then
        raise exception 'An accepted ocular inspection must have a date.' using errcode = '23514';
    end if;

    perform pg_advisory_xact_lock(hashtext(new.inspection_date::text), 1901);
    schedule_issue := public.kq_validate_ocular_schedule_internal(
        new.inspection_date,
        new.inspection_time,
        new.inspection_distance_km,
        new.id::text
    );
    if schedule_issue is not null then
        raise exception '%', schedule_issue using errcode = '23514';
    end if;
    return new;
end;
$function$;

drop trigger if exists kq_enforce_accepted_ocular_schedule
    on public.ocular_inspection_requests;
create trigger kq_enforce_accepted_ocular_schedule
before insert or update on public.ocular_inspection_requests
for each row execute function public.kq_enforce_accepted_ocular_schedule();

create or replace function public.kq_accept_ocular_inspection_request(p_request_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
    request_row public.ocular_inspection_requests%rowtype;
    schedule_issue text;
begin
    if not coalesce(public.is_admin(), false) then
        raise exception 'Only an admin can accept an ocular inspection request.' using errcode = '42501';
    end if;

    select * into request_row
      from public.ocular_inspection_requests
     where id::text = p_request_id
     for update;
    if not found then
        raise exception 'Ocular inspection request not found.' using errcode = 'P0002';
    end if;
    if upper(coalesce(request_row.status, '')) = 'APPROVED' then
        return;
    end if;
    if upper(coalesce(request_row.status, '')) <> 'REQUESTED' then
        raise exception 'Only requested ocular inspections can be accepted.' using errcode = '23514';
    end if;

    perform pg_advisory_xact_lock(hashtext(request_row.inspection_date::text), 1901);
    schedule_issue := public.kq_validate_ocular_schedule_internal(
        request_row.inspection_date,
        request_row.inspection_time,
        request_row.inspection_distance_km,
        request_row.id::text
    );
    if schedule_issue is not null then
        raise exception '%', schedule_issue using errcode = '23514';
    end if;

    update public.ocular_inspection_requests
       set status = 'APPROVED',
           updated_at = now()
     where id::text = p_request_id;
end;
$function$;

revoke all on function public.kq_accept_ocular_inspection_request(text) from public;
grant execute on function public.kq_accept_ocular_inspection_request(text) to authenticated;

notify pgrst, 'reload schema';
