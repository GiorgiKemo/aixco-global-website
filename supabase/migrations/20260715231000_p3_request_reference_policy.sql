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
  where counters.last_value < 999999
  returning last_value into reference_number;

  if reference_number is null then
    raise exception using
      errcode = 'P0001',
      message = format('AIXCO request reference capacity exhausted for UTC year %s', reference_year);
  end if;

  return format(
    'AIX-%s-%s',
    reference_year,
    lpad(reference_number::text, 6, '0')
  );
end;
$$;

revoke all on function private.next_contact_request_reference() from public;
grant execute on function private.next_contact_request_reference() to service_role;

comment on function private.next_contact_request_reference() is
  'Allocates AIX-YYYY-NNNNNN references by UTC calendar year. The six-digit annual capacity is an explicit business rule; exhaustion fails closed instead of emitting an ambiguous reference.';

comment on table private.contact_request_reference_counters is
  'Annual AIXCO contact reference counters. request_year is defined in UTC and last_value is intentionally capped at 999999.';

create or replace function public.contact_delivery_runtime_status()
returns table (
  schema_version text,
  queued_count bigint,
  failed_count bigint
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    '20260715231000'::text,
    count(*) filter (where status in ('pending', 'processing', 'retrying')),
    count(*) filter (where status = 'failed')
  from public.contact_email_deliveries;
$$;

revoke all on function public.contact_delivery_runtime_status() from public, anon, authenticated;
grant execute on function public.contact_delivery_runtime_status() to service_role;
