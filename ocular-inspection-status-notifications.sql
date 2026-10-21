-- Run in the Supabase SQL Editor to notify signed-in customers when an ocular
-- inspection request is approved or declined.

create or replace function public.notify_user_when_ocular_inspection_reviewed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    decision text;
    notification_title text;
    notification_message text;
begin
    decision := upper(coalesce(new.status, ''));
    if decision not in ('APPROVED', 'DECLINED')
       or old.status is not distinct from new.status
       or new.user_id is null then
        return new;
    end if;

    if decision = 'APPROVED' then
        notification_title := 'Ocular inspection request approved';
        notification_message := format(
            'Your ocular inspection request for %s at %s has been approved by KQ Event Styling. Please check your email for the details.',
            coalesce(nullif(new.inspection_date::text, ''), 'your selected date'),
            coalesce(nullif(new.venue_name, ''), 'your venue')
        );
    else
        notification_title := 'Ocular inspection request declined';
        notification_message := format(
            'Your ocular inspection request for %s at %s has been declined by KQ Event Styling. Please check your email for more information.',
            coalesce(nullif(new.inspection_date::text, ''), 'your selected date'),
            coalesce(nullif(new.venue_name, ''), 'your venue')
        );
    end if;

    insert into public.user_notifications (
        user_id, booking_id, type, title, message
    ) values (
        new.user_id,
        'ocular:' || new.id::text,
        'OCULAR_INSPECTION_' || decision,
        notification_title,
        notification_message
    );

    return new;
end;
$$;

drop trigger if exists ocular_inspection_notify_user_reviewed
    on public.ocular_inspection_requests;
create trigger ocular_inspection_notify_user_reviewed
after update of status on public.ocular_inspection_requests
for each row
execute function public.notify_user_when_ocular_inspection_reviewed();

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
