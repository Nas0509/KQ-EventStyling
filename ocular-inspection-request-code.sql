-- Add readable sequential request codes without changing the existing primary key.
-- The existing id remains the database key; request_code is for display/reference.
create sequence if not exists public.ocular_inspection_request_code_seq;

alter table public.ocular_inspection_requests
    add column if not exists request_code text;

with numbered_requests as (
    select id,
           row_number() over (order by created_at nulls last, id) as row_num
    from public.ocular_inspection_requests
    where request_code is null or btrim(request_code) = ''
)
update public.ocular_inspection_requests as requests
set request_code = 'OI-' || lpad(numbered_requests.row_num::text, greatest(4, length(numbered_requests.row_num::text)), '0')
from numbered_requests
where requests.id = numbered_requests.id;

do $$
declare
    highest_code bigint;
    sequence_value bigint;
    sequence_called boolean;
begin
    select max(substring(request_code from '^OI-([0-9]+)$')::bigint)
      into highest_code
      from public.ocular_inspection_requests
     where request_code ~ '^OI-[0-9]+$';

    select last_value, is_called
      into sequence_value, sequence_called
      from public.ocular_inspection_request_code_seq;

    if coalesce(highest_code, 0) = 0 and not sequence_called then
        perform setval('public.ocular_inspection_request_code_seq', 1, false);
    else
        perform setval(
            'public.ocular_inspection_request_code_seq',
            greatest(coalesce(highest_code, 0), sequence_value),
            true
        );
    end if;
end;
$$;

create unique index if not exists ocular_inspection_requests_request_code_uidx
    on public.ocular_inspection_requests (request_code);

create or replace function public.assign_ocular_inspection_request_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.request_code is null or btrim(new.request_code) = '' then
        new.request_code := 'OI-' || lpad(
            nextval('public.ocular_inspection_request_code_seq')::text,
            greatest(4, length(currval('public.ocular_inspection_request_code_seq')::text)),
            '0'
        );
    end if;
    return new;
end;
$$;

drop trigger if exists ocular_inspection_requests_assign_request_code
    on public.ocular_inspection_requests;

create trigger ocular_inspection_requests_assign_request_code
before insert on public.ocular_inspection_requests
for each row execute function public.assign_ocular_inspection_request_code();

alter table public.ocular_inspection_requests
    alter column request_code set not null;

notify pgrst, 'reload schema';
