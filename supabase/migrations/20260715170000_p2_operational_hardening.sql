alter table public.contact_submissions
add column request_type text not null default 'message',
add column phone text,
add column preferred_call_at timestamptz,
add column preferred_call_timezone text,
add constraint contact_submissions_request_type_check check (request_type in ('call', 'message')),
add constraint contact_submissions_phone_check check (
  phone is null or (
    length(trim(phone)) between 5 and 40
    and phone ~ '^[+()0-9 .-]+$'
  )
),
add constraint contact_submissions_call_details_check check (
  request_type = 'message'
  or (
    phone is not null
    and preferred_call_at is not null
    and preferred_call_timezone is not null
    and length(trim(preferred_call_timezone)) between 1 and 80
  )
);

create index contact_submissions_request_type_created_at_idx
on public.contact_submissions (request_type, created_at desc);

create or replace function public.create_contact_submission(p_submission jsonb)
returns table (request_reference text, delivery_status text)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  submission public.contact_submissions%rowtype;
  delivery_payload jsonb;
  normalized_request_type text;
begin
  if jsonb_typeof(p_submission) is distinct from 'object' then
    raise exception 'Contact submission payload must be a JSON object.';
  end if;

  normalized_request_type := coalesce(nullif(p_submission ->> 'request_type', ''), 'message');

  insert into public.contact_submissions (
    source,
    name,
    email,
    interest,
    message,
    request_type,
    phone,
    preferred_call_at,
    preferred_call_timezone,
    locale,
    page_path,
    user_agent,
    status,
    metadata,
    email_delivery_status
  ) values (
    'contact_form',
    p_submission ->> 'name',
    lower(p_submission ->> 'email'),
    nullif(p_submission ->> 'interest', ''),
    p_submission ->> 'message',
    normalized_request_type,
    nullif(p_submission ->> 'phone', ''),
    nullif(p_submission ->> 'preferred_call_at', '')::timestamptz,
    nullif(p_submission ->> 'preferred_call_timezone', ''),
    nullif(p_submission ->> 'locale', ''),
    nullif(p_submission ->> 'page_path', ''),
    nullif(p_submission ->> 'user_agent', ''),
    'new',
    coalesce(p_submission -> 'metadata', '{}'::jsonb),
    'queued'
  )
  returning * into submission;

  delivery_payload := jsonb_build_object(
    'requestReference', submission.request_reference,
    'name', submission.name,
    'email', submission.email,
    'interest', submission.interest,
    'message', submission.message,
    'requestType', submission.request_type,
    'phone', submission.phone,
    'preferredCallAt', submission.preferred_call_at,
    'preferredCallTimezone', submission.preferred_call_timezone,
    'locale', submission.locale,
    'pagePath', submission.page_path,
    'userAgent', submission.user_agent,
    'metadata', submission.metadata
  );

  insert into public.contact_email_deliveries (
    contact_submission_id,
    request_reference,
    channel,
    idempotency_key,
    payload
  ) values
    (
      submission.id,
      submission.request_reference,
      'lead_notification',
      format('lead-notification/%s', submission.request_reference),
      delivery_payload
    ),
    (
      submission.id,
      submission.request_reference,
      'contact_confirmation',
      format('contact-confirmation/%s', submission.request_reference),
      delivery_payload
    );

  return query
  select submission.request_reference, current_submission.email_delivery_status
  from public.contact_submissions as current_submission
  where current_submission.id = submission.id;
end;
$$;

revoke all on function public.create_contact_submission(jsonb) from public, anon, authenticated;
grant execute on function public.create_contact_submission(jsonb) to service_role;

create or replace function public.purge_expired_operational_data(
  p_contact_days integer default 730,
  p_chat_days integer default 365,
  p_portal_days integer default 180,
  p_abuse_attempt_days integer default 7
)
returns table (
  contacts_deleted bigint,
  chats_deleted bigint,
  portal_events_deleted bigint,
  abuse_attempts_deleted bigint
)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  deleted_count bigint;
begin
  if p_contact_days < 30 or p_chat_days < 30 or p_portal_days < 30 or p_abuse_attempt_days < 1 then
    raise exception 'Retention windows are below the approved minimum.';
  end if;

  delete from public.contact_submissions
  where created_at < now() - make_interval(days => p_contact_days);
  get diagnostics contacts_deleted = row_count;

  delete from public.chat_transcripts
  where created_at < now() - make_interval(days => p_chat_days);
  get diagnostics chats_deleted = row_count;

  delete from public.portal_click_events
  where created_at < now() - make_interval(days => p_portal_days);
  get diagnostics portal_events_deleted = row_count;

  delete from public.lead_capture_attempts
  where created_at < now() - make_interval(days => p_abuse_attempt_days);
  get diagnostics abuse_attempts_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.purge_expired_operational_data(integer, integer, integer, integer)
from public, anon, authenticated;
grant execute on function public.purge_expired_operational_data(integer, integer, integer, integer)
to service_role;

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
    '20260715170000'::text,
    count(*) filter (where status in ('pending', 'processing', 'retrying')),
    count(*) filter (where status = 'failed')
  from public.contact_email_deliveries;
$$;

revoke all on function public.contact_delivery_runtime_status() from public, anon, authenticated;
grant execute on function public.contact_delivery_runtime_status() to service_role;

comment on function public.purge_expired_operational_data(integer, integer, integer, integer) is
  'Deletes expired website operational data using the approved AIXCO retention windows.';
