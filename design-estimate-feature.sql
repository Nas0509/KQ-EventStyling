-- Run this in the Supabase SQL Editor before deploying the matching site files.

do $$
begin
    if to_regclass('public.ocular_inspection_requests') is null
       and to_regclass('public.quotation_requests') is not null then
        alter table public.quotation_requests rename to ocular_inspection_requests;
    end if;
end;
$$;

alter table public.bookings
    add column if not exists design_image_path text,
    add column if not exists ai_estimated_package text,
    add column if not exists ai_estimated_price numeric,
    add column if not exists ai_detected_features jsonb not null default '[]'::jsonb,
    add column if not exists ai_estimate_explanation text;

alter table public.ocular_inspection_requests
    add column if not exists request_purpose text not null default 'OCULAR_INSPECTION',
    add column if not exists inspection_date date,
    add column if not exists inspection_time time,
    add column if not exists inspection_address text,
    add column if not exists inspection_city text,
    add column if not exists inspection_province text,
    add column if not exists inspection_region text,
    add column if not exists venue_name text,
    add column if not exists inspection_fee numeric,
    add column if not exists inspection_distance_km numeric,
    add column if not exists payment_reference text,
    add column if not exists design_image_path text,
    add column if not exists design_estimate_package text,
    add column if not exists design_estimate_price numeric,
    add column if not exists design_estimate_features jsonb not null default '[]'::jsonb,
    add column if not exists design_estimate_explanation text;

alter table public.ocular_inspection_requests
    drop constraint if exists quotation_requests_inspection_region_luzon_check;

alter table public.ocular_inspection_requests
    drop constraint if exists ocular_inspection_requests_inspection_region_luzon_check;

alter table public.ocular_inspection_requests
    add constraint ocular_inspection_requests_inspection_region_luzon_check
    check (
        (inspection_city is null and inspection_province is null and inspection_region is null)
        or (
            nullif(btrim(inspection_city), '') is not null
            and nullif(btrim(inspection_province), '') is not null
            and inspection_region in (
                'Bicol Region',
                'Cagayan Valley',
                'CALABARZON',
                'Central Luzon',
                'Cordillera Administrative Region',
                'Ilocos Region',
                'MIMAROPA Region',
                'National Capital Region'
            )
        )
    );

alter table public.ocular_inspection_requests
    drop column if exists event_type,
    drop column if exists category,
    drop column if exists package_id,
    drop column if exists package_name,
    drop column if exists package_price,
    drop column if exists celebrant_name,
    drop column if exists theme,
    drop column if exists color,
    drop column if exists character;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booking-designs', 'booking-designs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';

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
