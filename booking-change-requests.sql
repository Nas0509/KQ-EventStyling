-- Booking history, customer change requests, and admin review.
-- Run once in the Supabase SQL Editor for the KQ Event Styling project.

create table if not exists public.booking_change_requests (
    id uuid primary key default gen_random_uuid(),
    booking_id text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    request_type text not null check (request_type in ('CANCELLATION', 'RESCHEDULE')),
    reason text not null check (char_length(trim(reason)) between 10 and 1000),
    requested_event_date date,
    requested_start_time time,
    requested_time_slot text,
    status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED')),
    reservation_fee_nonrefundable boolean not null default false,
    admin_note text,
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    constraint booking_change_request_schedule_check check (
        (request_type = 'CANCELLATION' and requested_event_date is null and requested_start_time is null and requested_time_slot is null)
        or
        (request_type = 'RESCHEDULE' and requested_event_date is not null and requested_start_time is not null and requested_time_slot in ('MORNING', 'AFTERNOON', 'NIGHT'))
    )
);

create index if not exists booking_change_requests_user_created_idx
    on public.booking_change_requests (user_id, created_at desc);
create index if not exists booking_change_requests_status_created_idx
    on public.booking_change_requests (status, created_at desc);
create unique index if not exists booking_change_requests_one_pending_per_booking_idx
    on public.booking_change_requests (booking_id) where status = 'PENDING';

alter table public.booking_change_requests enable row level security;
revoke all on public.booking_change_requests from anon, authenticated;
grant select on public.booking_change_requests to authenticated;

drop policy if exists booking_change_requests_read_own_or_admin on public.booking_change_requests;
create policy booking_change_requests_read_own_or_admin
on public.booking_change_requests for select to authenticated
using (
    user_id = (select auth.uid())
    or coalesce(public.is_admin(), false)
);

-- Customers can read only their own booking history (including admin notes).
drop policy if exists kq_customer_select_own_bookings on public.bookings;
create policy kq_customer_select_own_bookings
on public.bookings for select to authenticated
using (user_id = (select auth.uid()));
grant select on public.bookings to authenticated;

create or replace function public.kq_request_booking_change(
    p_booking_id text,
    p_request_type text,
    p_reason text,
    p_requested_event_date date default null,
    p_requested_start_time time default null,
    p_requested_time_slot text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
    booking_row public.bookings%rowtype;
    request_kind text := upper(trim(coalesce(p_request_type, '')));
    reason_text text := trim(coalesce(p_reason, ''));
    new_slot text := upper(trim(coalesce(p_requested_time_slot, '')));
    request_status text;
    fee_nonrefundable boolean;
    request_id uuid;
    today_ph date := (now() at time zone 'Asia/Manila')::date;
begin
    if auth.uid() is null then
        raise exception 'Please sign in to manage your booking.' using errcode = '42501';
    end if;
    if request_kind not in ('CANCELLATION', 'RESCHEDULE') then
        raise exception 'Choose cancellation or reschedule.' using errcode = '22023';
    end if;
    if char_length(reason_text) < 10 or char_length(reason_text) > 1000 then
        raise exception 'Please provide a reason between 10 and 1000 characters.' using errcode = '22023';
    end if;

    select * into booking_row
      from public.bookings
     where id::text = p_booking_id and user_id = auth.uid()
     for update;
    if not found then
        raise exception 'Booking not found in your account.' using errcode = 'P0002';
    end if;
    if upper(coalesce(booking_row.status, '')) <> 'APPROVED' then
        raise exception 'Only approved bookings can be changed.' using errcode = '23514';
    end if;
    if exists (select 1 from public.booking_change_requests r where r.booking_id = p_booking_id and r.status = 'PENDING') then
        raise exception 'This booking already has a request waiting for admin review.' using errcode = '23505';
    end if;

    if request_kind = 'CANCELLATION' then
        request_status := 'PENDING';
        fee_nonrefundable := true;
        insert into public.booking_change_requests
            (booking_id, user_id, request_type, reason, status, reservation_fee_nonrefundable)
        values
            (p_booking_id, auth.uid(), request_kind, reason_text, request_status, fee_nonrefundable)
        returning id into request_id;
    else
        if p_requested_event_date is null or p_requested_start_time is null
           or new_slot is null or new_slot not in ('MORNING', 'AFTERNOON', 'NIGHT') then
            raise exception 'Choose a new event date and valid time slot.' using errcode = '22023';
        end if;
        if p_requested_event_date < today_ph + 1 then
            raise exception 'Choose a future event date.' using errcode = '22023';
        end if;
        if (new_slot = 'MORNING' and (p_requested_start_time < time '06:00' or p_requested_start_time >= time '12:00'))
           or (new_slot = 'AFTERNOON' and (p_requested_start_time < time '12:00' or p_requested_start_time >= time '18:00'))
           or (new_slot = 'NIGHT' and (p_requested_start_time < time '18:00' or p_requested_start_time >= time '24:00')) then
            raise exception 'The start time must fall within the selected time slot.' using errcode = '22023';
        end if;

        if p_requested_event_date = booking_row.event_date
           and new_slot = upper(coalesce(nullif(trim(booking_row.time_slot), ''), ''))
           and p_requested_start_time = booking_row.start_time::time then
            raise exception 'Choose a date or time different from the current booking.' using errcode = '22023';
        end if;

        fee_nonrefundable := booking_row.event_date - today_ph < 30;
        if fee_nonrefundable then
            request_status := 'PENDING';
            insert into public.booking_change_requests
                (booking_id, user_id, request_type, reason, requested_event_date, requested_start_time,
                 requested_time_slot, status, reservation_fee_nonrefundable)
            values
                (p_booking_id, auth.uid(), request_kind, reason_text, p_requested_event_date,
                 p_requested_start_time, new_slot, request_status, true)
            returning id into request_id;
        else
            -- At least 30 days before the event, rescheduling is automatic and has no penalty.
            update public.bookings
               set event_date = p_requested_event_date,
                   start_time = p_requested_start_time,
                   time_slot = new_slot
             where id::text = p_booking_id;
            request_status := 'ACCEPTED';
            insert into public.booking_change_requests
                (booking_id, user_id, request_type, reason, requested_event_date, requested_start_time,
                 requested_time_slot, status, reservation_fee_nonrefundable, admin_note, reviewed_at)
            values
                (p_booking_id, auth.uid(), request_kind, reason_text, p_requested_event_date,
                 p_requested_start_time, new_slot, request_status, false,
                 'Automatically accepted: requested at least 30 days before the event.', now())
            returning id into request_id;
        end if;
    end if;

    insert into public.user_notifications (user_id, booking_id, type, title, message)
    values (
        auth.uid(), p_booking_id,
        case when request_kind = 'CANCELLATION' then 'CANCELLATION_REQUEST' else 'RESCHEDULE_REQUEST' end,
        case when request_kind = 'CANCELLATION' then 'Cancellation request submitted'
             when request_status = 'ACCEPTED' then 'Booking rescheduled'
             else 'Reschedule request submitted' end,
        case when request_kind = 'CANCELLATION'
             then 'Your cancellation request is pending admin review. The reservation fee is non-refundable.'
             when request_status = 'ACCEPTED'
             then format('Your booking was rescheduled to %s at %s.', p_requested_event_date, to_char(p_requested_start_time, 'HH12:MI AM'))
             else 'Your reschedule request is pending admin review. Because it is within 30 days of the event, the reservation fee is non-refundable even if the request is declined.' end
    );

    return jsonb_build_object('request_id', request_id, 'status', request_status,
                              'reservation_fee_nonrefundable', fee_nonrefundable);
end;
$function$;

create or replace function public.kq_admin_review_booking_change(
    p_request_id uuid,
    p_accept boolean,
    p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
    request_row public.booking_change_requests%rowtype;
    booking_row public.bookings%rowtype;
    note_text text := nullif(trim(coalesce(p_admin_note, '')), '');
    cancellation_entry text;
begin
    if not coalesce(public.is_admin(), false) then
        raise exception 'Only an admin can review booking change requests.' using errcode = '42501';
    end if;
    select * into request_row from public.booking_change_requests where id = p_request_id for update;
    if not found then
        raise exception 'Booking change request not found.' using errcode = 'P0002';
    end if;
    if request_row.status <> 'PENDING' then
        raise exception 'This request has already been reviewed.' using errcode = '23514';
    end if;
    select * into booking_row from public.bookings where id::text = request_row.booking_id for update;
    if not found then
        raise exception 'The linked booking no longer exists.' using errcode = 'P0002';
    end if;

    if p_accept then
        if request_row.request_type = 'CANCELLATION' then
            cancellation_entry := format('Customer cancellation request accepted: %s%s', request_row.reason,
                case when request_row.reservation_fee_nonrefundable then E'\nReservation fee is non-refundable.' else '' end);
            update public.bookings
               set status = 'CANCELLED',
                   admin_notes = concat_ws(E'\n\n', nullif(admin_notes, ''), cancellation_entry,
                       case when note_text is not null then 'Admin note: ' || note_text end)
             where id::text = request_row.booking_id;
        elsif upper(coalesce(booking_row.status, '')) <> 'APPROVED' then
            raise exception 'The booking is no longer approved and cannot be rescheduled.' using errcode = '23514';
        else
            update public.bookings
               set event_date = request_row.requested_event_date,
                   start_time = request_row.requested_start_time,
                   time_slot = request_row.requested_time_slot
             where id::text = request_row.booking_id;
        end if;
    end if;

    update public.booking_change_requests
       set status = case when p_accept then 'ACCEPTED' else 'REJECTED' end,
           admin_note = note_text,
           reviewed_by = auth.uid(),
           reviewed_at = now()
     where id = p_request_id;

end;
$function$;

-- Always notify the customer when an admin accepts or declines a request.
-- Keeping this in a trigger ensures every status change produces exactly one notification.
create or replace function public.kq_notify_customer_after_booking_change_review()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
    request_title text;
    notification_message text;
begin
    if old.status is distinct from new.status
       and old.status = 'PENDING'
       and new.status in ('ACCEPTED', 'REJECTED') then
        if new.request_type = 'CANCELLATION' and new.status = 'ACCEPTED' then
            request_title := 'Cancellation request accepted';
            notification_message := 'Your booking was cancelled.' ||
                case when new.reservation_fee_nonrefundable then ' The reservation fee is non-refundable.' else '' end;
        elsif new.request_type = 'CANCELLATION' then
            request_title := 'Cancellation request declined';
            notification_message := 'Your cancellation request was declined. Your booking remains active.';
        elsif new.status = 'ACCEPTED' then
            request_title := 'Reschedule request accepted';
            notification_message := format('Your booking has been rescheduled to %s at %s.%s',
                new.requested_event_date,
                to_char(new.requested_start_time, 'HH12:MI AM'),
                case when new.reservation_fee_nonrefundable then ' The reservation fee is non-refundable.' else '' end);
        else
            request_title := 'Reschedule request declined';
            notification_message := 'Your reschedule request was declined. Your original booking date and time remain unchanged.' ||
                case when new.reservation_fee_nonrefundable then ' The reservation fee is non-refundable.' else '' end;
        end if;

        if new.admin_note is not null and trim(new.admin_note) <> '' then
            notification_message := notification_message || ' Admin note: ' || trim(new.admin_note);
        end if;

        insert into public.user_notifications (user_id, booking_id, type, title, message)
        values (
            new.user_id,
            new.booking_id,
            case when new.request_type = 'CANCELLATION' then 'CANCELLATION_REVIEWED' else 'RESCHEDULE_REVIEWED' end,
            request_title,
            notification_message
        );
    end if;
    return new;
end;
$function$;

revoke all on function public.kq_notify_customer_after_booking_change_review() from public;
drop trigger if exists booking_change_request_notify_customer on public.booking_change_requests;
create trigger booking_change_request_notify_customer
after update of status on public.booking_change_requests
for each row
execute function public.kq_notify_customer_after_booking_change_review();

revoke all on function public.kq_request_booking_change(text, text, text, date, time, text) from public;
grant execute on function public.kq_request_booking_change(text, text, text, date, time, text) to authenticated;
revoke all on function public.kq_admin_review_booking_change(uuid, boolean, text) from public;
grant execute on function public.kq_admin_review_booking_change(uuid, boolean, text) to authenticated;

do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
       and not exists (
           select 1 from pg_publication_tables
           where pubname = 'supabase_realtime'
             and schemaname = 'public'
             and tablename = 'user_notifications'
       ) then
        execute 'alter publication supabase_realtime add table public.user_notifications';
    end if;
end;
$$;

notify pgrst, 'reload schema';
