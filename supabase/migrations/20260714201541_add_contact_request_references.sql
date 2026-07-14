create table private.contact_request_reference_counters (
  request_year integer primary key,
  last_value bigint not null,
  constraint contact_request_reference_counters_year_check check (request_year between 2000 and 9999),
  constraint contact_request_reference_counters_value_check check (last_value between 1 and 999999)
);

revoke all on private.contact_request_reference_counters from public;

create or replace function private.next_contact_request_reference()
returns text
language plpgsql
volatile
security definer
set search_path = pg_catalog, private
as $$
declare
  reference_year integer := extract(year from current_timestamp at time zone 'UTC')::integer;
  reference_number bigint;
begin
  insert into private.contact_request_reference_counters as counters (request_year, last_value)
  values (reference_year, 1)
  on conflict (request_year)
  do update set last_value = counters.last_value + 1
  returning last_value into reference_number;

  return format(
    'AIX-%s-%s',
    reference_year,
    lpad(reference_number::text, 6, '0')
  );
end;
$$;

revoke all on function private.next_contact_request_reference() from public;
grant usage on schema private to service_role;
grant execute on function private.next_contact_request_reference() to service_role;

alter table public.contact_submissions
add column request_reference text;

with numbered_submissions as (
  select
    id,
    extract(year from created_at at time zone 'UTC')::integer as request_year,
    row_number() over (
      partition by extract(year from created_at at time zone 'UTC')
      order by created_at, id
    ) as request_number
  from public.contact_submissions
)
update public.contact_submissions as submissions
set request_reference = format(
  'AIX-%s-%s',
  numbered_submissions.request_year,
  lpad(numbered_submissions.request_number::text, 6, '0')
)
from numbered_submissions
where submissions.id = numbered_submissions.id;

insert into private.contact_request_reference_counters (request_year, last_value)
select
  extract(year from created_at at time zone 'UTC')::integer,
  count(*)::bigint
from public.contact_submissions
group by extract(year from created_at at time zone 'UTC')
on conflict (request_year)
do update set last_value = greatest(
  private.contact_request_reference_counters.last_value,
  excluded.last_value
);

alter table public.contact_submissions
alter column request_reference set default private.next_contact_request_reference(),
alter column request_reference set not null,
add constraint contact_submissions_request_reference_unique unique (request_reference),
add constraint contact_submissions_request_reference_format_check
  check (request_reference ~ '^AIX-[0-9]{4}-[0-9]{6}$');

comment on column public.contact_submissions.request_reference is
  'Unique annual AIXCO contact request reference, for example AIX-2026-000001.';
