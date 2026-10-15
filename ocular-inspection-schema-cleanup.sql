-- Run once in the Supabase SQL Editor to remove legacy quotation/package fields
-- from the ocular inspection requests table. This deletes values stored in them.
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

notify pgrst, 'reload schema';
