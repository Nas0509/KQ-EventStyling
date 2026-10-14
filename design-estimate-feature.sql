-- Run this once in the Supabase SQL Editor before deploying the matching site files.

alter table public.bookings
    add column if not exists design_image_path text,
    add column if not exists ai_estimated_package text,
    add column if not exists ai_estimated_price numeric,
    add column if not exists ai_detected_features jsonb not null default '[]'::jsonb,
    add column if not exists ai_estimate_explanation text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booking-designs', 'booking-designs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers upload own booking design references" on storage.objects;
create policy "Customers upload own booking design references"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'booking-designs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Customers and admins view booking design references" on storage.objects;
create policy "Customers and admins view booking design references"
on storage.objects for select to authenticated
using (
    bucket_id = 'booking-designs'
    and (
        (storage.foldername(name))[1] = (select auth.uid())::text
        or public.is_admin()
    )
);

drop policy if exists "Customers remove own booking design references" on storage.objects;
create policy "Customers remove own booking design references"
on storage.objects for delete to authenticated
using (
    bucket_id = 'booking-designs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);
