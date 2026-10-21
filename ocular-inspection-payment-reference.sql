-- Run once in the Supabase SQL Editor to store ocular inspection payment references.
alter table public.ocular_inspection_requests
    add column if not exists payment_reference text;

do $$
begin
    if exists (
        select 1
          from information_schema.columns
         where table_schema = 'public'
           and table_name = 'ocular_inspection_requests'
           and column_name = 'additional_request'
    ) then
        execute $migration$
            update public.ocular_inspection_requests
               set payment_reference = additional_request
             where payment_reference is null
               and additional_request is not null
        $migration$;
    end if;
end;
$$;

notify pgrst, 'reload schema';
