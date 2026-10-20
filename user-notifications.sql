-- Run once in Supabase SQL Editor to enable customer approval notifications.
create table if not exists public.user_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    booking_id text not null,
    type text not null,
    title text not null,
    message text not null,
    created_at timestamptz not null default now(),
    read_at timestamptz
);

create index if not exists user_notifications_user_created_idx
    on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;
revoke all on public.user_notifications from anon, authenticated;
grant select on public.user_notifications to authenticated;
grant update (read_at) on public.user_notifications to authenticated;

drop policy if exists user_notifications_read_own on public.user_notifications;
create policy user_notifications_read_own
on public.user_notifications
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists user_notifications_mark_own_read on public.user_notifications;
create policy user_notifications_mark_own_read
on public.user_notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.notify_user_when_booking_approved()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if new.status = 'APPROVED'
       and old.status is distinct from new.status
       and new.user_id is not null then
        insert into public.user_notifications (user_id, booking_id, type, title, message)
        values (
            new.user_id,
            new.id::text,
            'BOOKING_APPROVED',
            'Booking request approved',
            format('Your %s booking request for %s has been approved by KQ Event Styling.',
                coalesce(nullif(new.event_type, ''), 'event'),
                coalesce(nullif(new.event_date::text, ''), 'your selected date'))
        );
    end if;
    return new;
end;
$$;

drop trigger if exists bookings_notify_user_approved on public.bookings;
create trigger bookings_notify_user_approved
after update of status on public.bookings
for each row
execute function public.notify_user_when_booking_approved();

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
