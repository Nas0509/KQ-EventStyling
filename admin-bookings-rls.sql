-- Run this in the Supabase SQL Editor for the KQ Event Styling project.
-- These policies give users with profiles.role = 'admin' access to manage bookings.

drop policy if exists kq_admin_select_bookings on public.bookings;
create policy kq_admin_select_bookings
on public.bookings
for select
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'admin'
    )
);

drop policy if exists kq_admin_update_bookings on public.bookings;
create policy kq_admin_update_bookings
on public.bookings
for update
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'admin'
    )
)
with check (
    exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'admin'
    )
);

drop policy if exists kq_admin_delete_bookings on public.bookings;
create policy kq_admin_delete_bookings
on public.bookings
for delete
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.role = 'admin'
    )
);
