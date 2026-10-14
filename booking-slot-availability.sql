-- Run once in Supabase SQL Editor before deploying the matching site files.
-- Each date has three reservable slots. A slot is occupied only after an admin
-- approves a booking. Pending requests remain available; declined/cancelled
-- requests also leave the slot available.

alter table public.bookings
    add column if not exists time_slot text;

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
        exists (
            select 1
            from public.bookings b
            where b.event_date = calendar_days.calendar_date::date
              and upper(coalesce(b.status, '')) = 'APPROVED'
              and coalesce(
                    nullif(upper(trim(b.time_slot)), ''),
                    case
                        when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
                        when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
                        when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
                        else null
                    end
                  ) = 'MORNING'
        ) as morning_booked,
        exists (
            select 1
            from public.bookings b
            where b.event_date = calendar_days.calendar_date::date
              and upper(coalesce(b.status, '')) = 'APPROVED'
              and coalesce(
                    nullif(upper(trim(b.time_slot)), ''),
                    case
                        when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
                        when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
                        when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
                        else null
                    end
                  ) = 'AFTERNOON'
        ) as afternoon_booked,
        exists (
            select 1
            from public.bookings b
            where b.event_date = calendar_days.calendar_date::date
              and upper(coalesce(b.status, '')) = 'APPROVED'
              and coalesce(
                    nullif(upper(trim(b.time_slot)), ''),
                    case
                        when b.start_time::time >= time '06:00' and b.start_time::time < time '12:00' then 'MORNING'
                        when b.start_time::time >= time '12:00' and b.start_time::time < time '18:00' then 'AFTERNOON'
                        when b.start_time::time >= time '18:00' and b.start_time::time < time '24:00' then 'NIGHT'
                        else null
                    end
                  ) = 'NIGHT'
        ) as night_booked
    from generate_series(p_start_date::timestamp, p_end_date::timestamp, interval '1 day') as calendar_days(calendar_date)
    where p_start_date <= p_end_date;
$function$;

revoke all on function public.kq_booking_slot_availability(date, date) from public;
grant execute on function public.kq_booking_slot_availability(date, date) to anon, authenticated;

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

    -- Pending requests are valid but do not reserve their slot yet.
    if upper(coalesce(new.status, '')) <> 'APPROVED' then
        return new;
    end if;

    -- Serialize attempts for the same date and slot so simultaneous requests
    -- cannot both claim one slot.
    perform pg_advisory_xact_lock(hashtext(new.event_date::text), hashtext(new.time_slot));

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

    return new;
end;
$function$;

drop trigger if exists kq_enforce_booking_slot_capacity on public.bookings;
create trigger kq_enforce_booking_slot_capacity
before insert or update on public.bookings
for each row execute function public.kq_enforce_booking_slot_capacity();
