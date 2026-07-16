-- AIXCO contact pipeline reliability, delivery observability, privacy, and
-- operational scheduling hardening. Secrets are resolved from Vault at run
-- time and are never stored in migration history or cron.job.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

alter table public.contact_email_deliveries
drop constraint contact_email_deliveries_status_check;

alter table public.contact_email_deliveries
add column provider_event_type text,
add column provider_event_at timestamptz,
add column requeue_count integer not null default 0,
add constraint contact_email_deliveries_status_check check (
  status in (
    'pending',
    'processing',
    'retrying',
    'provider_accepted',
    'delivered',
    'delivery_delayed',
    'bounced',
    'complained',
    'suppressed',
    'failed'
  )
),
add constraint contact_email_deliveries_provider_event_type_length check (
  provider_event_type is null or length(provider_event_type) <= 80
),
add constraint contact_email_deliveries_requeue_count_check check (
  requeue_count between 0 and 100
);

create unique index contact_email_deliveries_provider_message_unique_idx
on public.contact_email_deliveries (provider_message_id)
where provider_message_id is not null;

alter table public.contact_submissions
drop constraint contact_submissions_email_delivery_status_check;

alter table public.contact_submissions
add constraint contact_submissions_email_delivery_status_check check (
  email_delivery_status in (
    'not_scheduled',
    'queued',
    'processing',
    'retrying',
    'provider_accepted',
    'partially_accepted',
    'delivered',
    'partially_delivered',
    'delivery_delayed',
    'delivery_issue',
    'failed'
  )
);

create table public.contact_email_events (
  event_id text primary key,
  received_at timestamptz not null default now(),
  occurred_at timestamptz not null,
  provider_message_id text not null,
  event_type text not null,
  contact_email_delivery_id uuid references public.contact_email_deliveries(id) on delete cascade,
  detail text,
  constraint contact_email_events_event_id_length check (length(event_id) between 1 and 255),
  constraint contact_email_events_provider_id_length check (length(provider_message_id) between 1 and 255),
  constraint contact_email_events_type_check check (
    event_type in (
      'email.sent',
      'email.delivered',
      'email.delivery_delayed',
      'email.bounced',
      'email.complained',
      'email.failed',
      'email.suppressed'
    )
  ),
  constraint contact_email_events_detail_length check (detail is null or length(detail) <= 1000)
);

create index contact_email_events_delivery_idx
on public.contact_email_events (contact_email_delivery_id, occurred_at desc);

create index contact_email_events_received_at_idx
on public.contact_email_events (received_at);

create table public.contact_email_worker_runtime (
  worker_name text primary key,
  last_started_at timestamptz,
  last_succeeded_at timestamptz,
  last_failed_at timestamptz,
  consecutive_failures integer not null default 0,
  last_error text,
  last_summary jsonb not null default '{}'::jsonb,
  constraint contact_email_worker_runtime_name_check check (length(worker_name) between 1 and 80),
  constraint contact_email_worker_runtime_failures_check check (consecutive_failures between 0 and 1000000),
  constraint contact_email_worker_runtime_error_length check (last_error is null or length(last_error) <= 1000),
  constraint contact_email_worker_runtime_summary_object_check check (jsonb_typeof(last_summary) = 'object')
);

insert into public.contact_email_worker_runtime (worker_name)
values ('contact-email-deliveries')
on conflict (worker_name) do nothing;

create table public.site_telemetry_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  event_kind text not null,
  event_name text not null,
  event_id text,
  page_path text,
  value double precision,
  rating text,
  metadata jsonb not null default '{}'::jsonb,
  constraint site_telemetry_events_kind_check check (
    event_kind in ('web_vital', 'client_error', 'server_error')
  ),
  constraint site_telemetry_events_name_length check (length(event_name) between 1 and 120),
  constraint site_telemetry_events_event_id_length check (event_id is null or length(event_id) <= 255),
  constraint site_telemetry_events_page_path_length check (page_path is null or length(page_path) <= 800),
  constraint site_telemetry_events_value_check check (value is null or (value >= 0 and value < 1000000000)),
  constraint site_telemetry_events_rating_check check (
    rating is null or rating in ('good', 'needs-improvement', 'poor', 'unknown')
  ),
  constraint site_telemetry_events_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint site_telemetry_events_metadata_size_check check (octet_length(metadata::text) <= 4096)
);

create index site_telemetry_events_received_at_idx
on public.site_telemetry_events (received_at desc);

create index site_telemetry_events_kind_name_received_idx
on public.site_telemetry_events (event_kind, event_name, received_at desc);

alter table public.lead_capture_attempts
drop constraint lead_capture_attempts_resource_check;

alter table public.lead_capture_attempts
add constraint lead_capture_attempts_resource_check check (
  resource in ('contact', 'chat', 'portal-event', 'telemetry')
);

create or replace function public.record_lead_capture_attempt(
  p_resource text,
  p_client_hash text,
  p_recipient_hash text,
  p_client_limit integer,
  p_client_window_seconds integer,
  p_recipient_limit integer,
  p_recipient_window_seconds integer
)
returns table (allowed boolean, reason text, retry_after_seconds integer)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  client_limit integer := greatest(1, least(coalesce(p_client_limit, 1), 1000));
  client_window integer := greatest(1, least(coalesce(p_client_window_seconds, 60), 86400));
  recipient_limit integer := greatest(0, least(coalesce(p_recipient_limit, 0), 1000));
  recipient_window integer := greatest(1, least(coalesce(p_recipient_window_seconds, 60), 86400));
  client_count integer;
  recipient_count integer := 0;
  retry_seconds integer := 1;
begin
  if p_resource not in ('contact', 'chat', 'portal-event', 'telemetry') then
    raise exception 'Unsupported lead capture resource.';
  end if;

  if p_client_hash !~ '^[a-f0-9]{64}$'
    or (p_recipient_hash is not null and p_recipient_hash !~ '^[a-f0-9]{64}$') then
    raise exception 'Invalid lead capture identity hash.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_resource || ':client:' || p_client_hash, 0));
  if p_recipient_hash is not null and recipient_limit > 0 then
    perform pg_advisory_xact_lock(hashtextextended(p_resource || ':recipient:' || p_recipient_hash, 0));
  end if;

  select count(*)::integer into client_count
  from public.lead_capture_attempts as attempts
  where attempts.resource = p_resource
    and attempts.client_hash = p_client_hash
    and attempts.allowed
    and attempts.created_at > now() - make_interval(secs => client_window);

  if p_recipient_hash is not null and recipient_limit > 0 then
    select count(*)::integer into recipient_count
    from public.lead_capture_attempts as attempts
    where attempts.resource = p_resource
      and attempts.recipient_hash = p_recipient_hash
      and attempts.allowed
      and attempts.created_at > now() - make_interval(secs => recipient_window);
  end if;

  if client_count >= client_limit then
    select greatest(
      1,
      ceil(extract(epoch from (
        min(attempts.created_at) + make_interval(secs => client_window) - now()
      )))::integer
    ) into retry_seconds
    from public.lead_capture_attempts as attempts
    where attempts.resource = p_resource
      and attempts.client_hash = p_client_hash
      and attempts.allowed
      and attempts.created_at > now() - make_interval(secs => client_window);

    return query select false, 'client_rate_limit'::text, retry_seconds;
    return;
  end if;

  if p_recipient_hash is not null and recipient_limit > 0 and recipient_count >= recipient_limit then
    select greatest(
      1,
      ceil(extract(epoch from (
        min(attempts.created_at) + make_interval(secs => recipient_window) - now()
      )))::integer
    ) into retry_seconds
    from public.lead_capture_attempts as attempts
    where attempts.resource = p_resource
      and attempts.recipient_hash = p_recipient_hash
      and attempts.allowed
      and attempts.created_at > now() - make_interval(secs => recipient_window);

    return query select false, 'recipient_cooldown'::text, retry_seconds;
    return;
  end if;

  insert into public.lead_capture_attempts (
    resource, client_hash, recipient_hash, allowed, reason
  ) values (
    p_resource, p_client_hash, p_recipient_hash, true, null
  );

  return query select true, null::text, 0;
end;
$$;

create index if not exists lead_capture_attempts_retention_idx
on public.lead_capture_attempts (created_at);

revoke all on function public.record_lead_capture_attempt(
  text, text, text, integer, integer, integer, integer
) from public, anon, authenticated;
grant execute on function public.record_lead_capture_attempt(
  text, text, text, integer, integer, integer, integer
) to service_role;

alter table public.contact_email_events enable row level security;
alter table public.contact_email_events force row level security;
alter table public.contact_email_worker_runtime enable row level security;
alter table public.contact_email_worker_runtime force row level security;
alter table public.site_telemetry_events enable row level security;
alter table public.site_telemetry_events force row level security;

revoke all on public.contact_email_events from public, anon, authenticated;
revoke all on public.contact_email_worker_runtime from public, anon, authenticated;
revoke all on public.site_telemetry_events from public, anon, authenticated;
revoke all on sequence public.site_telemetry_events_id_seq from public, anon, authenticated;
grant all on public.contact_email_events to service_role;
grant all on public.contact_email_worker_runtime to service_role;
grant all on public.site_telemetry_events to service_role;
grant usage, select on sequence public.site_telemetry_events_id_seq to service_role;

create or replace function public.record_contact_email_worker_failure(
  p_reason text,
  p_failed_at timestamptz default now()
)
returns void
language sql
volatile
security invoker
set search_path = pg_catalog, public
as $$
  insert into public.contact_email_worker_runtime (
    worker_name,
    last_failed_at,
    consecutive_failures,
    last_error
  ) values (
    'contact-email-deliveries',
    p_failed_at,
    1,
    left(p_reason, 1000)
  )
  on conflict (worker_name) do update
  set
    last_failed_at = excluded.last_failed_at,
    consecutive_failures = least(
      1000000,
      public.contact_email_worker_runtime.consecutive_failures + 1
    ),
    last_error = excluded.last_error;
$$;

revoke all on function public.record_contact_email_worker_failure(text, timestamptz)
from public, anon, authenticated;
grant execute on function public.record_contact_email_worker_failure(text, timestamptz)
to service_role;

drop trigger if exists contact_email_deliveries_refresh_submission_status_insert_delete
on public.contact_email_deliveries;
drop trigger if exists contact_email_deliveries_refresh_submission_status_update
on public.contact_email_deliveries;

create or replace function private.refresh_contact_email_delivery_status()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  submission_id uuid;
  aggregate_status text;
begin
  submission_id := case
    when tg_op = 'DELETE' then old.contact_submission_id
    else new.contact_submission_id
  end;

  select case
    when count(*) = 0 then 'not_scheduled'
    when bool_and(deliveries.status = 'delivered') then 'delivered'
    when bool_or(deliveries.status in ('bounced', 'complained', 'suppressed', 'failed'))
      and bool_or(deliveries.status in ('delivered', 'provider_accepted')) then 'delivery_issue'
    when bool_and(deliveries.status in ('bounced', 'complained', 'suppressed', 'failed')) then 'failed'
    when bool_or(deliveries.status in ('bounced', 'complained', 'suppressed', 'failed')) then 'delivery_issue'
    when bool_or(deliveries.status = 'delivery_delayed') then 'delivery_delayed'
    when bool_or(deliveries.status = 'delivered') then 'partially_delivered'
    when bool_and(deliveries.status = 'provider_accepted') then 'provider_accepted'
    when bool_or(deliveries.status = 'provider_accepted') then 'partially_accepted'
    when bool_or(deliveries.status = 'retrying') then 'retrying'
    when bool_or(deliveries.status = 'processing') then 'processing'
    else 'queued'
  end
  into aggregate_status
  from public.contact_email_deliveries as deliveries
  where deliveries.contact_submission_id = submission_id;

  update public.contact_submissions
  set email_delivery_status = aggregate_status, email_delivery_updated_at = now()
  where id = submission_id;

  return null;
end;
$$;

revoke all on function private.refresh_contact_email_delivery_status() from public;
grant execute on function private.refresh_contact_email_delivery_status() to service_role;

create trigger contact_email_deliveries_refresh_submission_status_insert_delete
after insert or delete on public.contact_email_deliveries
for each row execute function private.refresh_contact_email_delivery_status();

create trigger contact_email_deliveries_refresh_submission_status_update
after update of status on public.contact_email_deliveries
for each row execute function private.refresh_contact_email_delivery_status();

create or replace function public.claim_contact_email_deliveries(p_batch_size integer default 5)
returns setof public.contact_email_deliveries
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public, extensions
as $$
begin
  update public.contact_email_deliveries
  set
    status = 'failed',
    locked_at = null,
    lock_token = null,
    last_error = coalesce(last_error, 'Delivery lease expired after the final allowed attempt.')
  where status = 'processing'
    and locked_at < now() - interval '2 minutes'
    and attempts >= max_attempts;

  return query
  with candidates as (
    select deliveries.id
    from public.contact_email_deliveries as deliveries
    where (
      deliveries.status in ('pending', 'retrying')
      and deliveries.next_attempt_at <= now()
      and deliveries.attempts < deliveries.max_attempts
    ) or (
      deliveries.status = 'processing'
      and deliveries.locked_at < now() - interval '2 minutes'
      and deliveries.attempts < deliveries.max_attempts
    )
    order by deliveries.next_attempt_at, deliveries.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_batch_size, 5), 20))
  ),
  claimed as (
    update public.contact_email_deliveries as deliveries
    set
      status = 'processing',
      attempts = deliveries.attempts + 1,
      last_attempt_at = now(),
      locked_at = now(),
      lock_token = extensions.gen_random_uuid(),
      last_error = null
    from candidates
    where deliveries.id = candidates.id
    returning deliveries.*
  )
  select claimed.* from claimed;
end;
$$;

revoke all on function public.claim_contact_email_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_contact_email_deliveries(integer) to service_role;

create or replace function public.claim_contact_email_deliveries_for_request(
  p_request_reference text,
  p_batch_size integer default 2
)
returns setof public.contact_email_deliveries
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public, extensions
as $$
begin
  if p_request_reference !~ '^AIX-[0-9]{4}-[0-9]{6}$' then
    raise exception 'Invalid contact request reference.';
  end if;

  return query
  with candidates as (
    select deliveries.id
    from public.contact_email_deliveries as deliveries
    where deliveries.request_reference = p_request_reference
      and deliveries.status in ('pending', 'retrying')
      and deliveries.next_attempt_at <= now()
      and deliveries.attempts < deliveries.max_attempts
    order by deliveries.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_batch_size, 2), 2))
  ),
  claimed as (
    update public.contact_email_deliveries as deliveries
    set
      status = 'processing',
      attempts = deliveries.attempts + 1,
      last_attempt_at = now(),
      locked_at = now(),
      lock_token = extensions.gen_random_uuid(),
      last_error = null
    from candidates
    where deliveries.id = candidates.id
    returning deliveries.*
  )
  select claimed.* from claimed;
end;
$$;

revoke all on function public.claim_contact_email_deliveries_for_request(text, integer)
from public, anon, authenticated;
grant execute on function public.claim_contact_email_deliveries_for_request(text, integer)
to service_role;

create or replace function public.record_contact_email_event(
  p_event_id text,
  p_provider_message_id text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_detail text default null
)
returns table (duplicate boolean, applied boolean, delivery_id uuid)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  inserted_event_id text;
  target_delivery public.contact_email_deliveries%rowtype;
  mapped_status text;
  was_duplicate boolean := false;
begin
  if p_event_type not in (
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.failed',
    'email.suppressed'
  ) then
    raise exception 'Unsupported email event type.';
  end if;

  insert into public.contact_email_events (
    event_id, occurred_at, provider_message_id, event_type, detail
  ) values (
    left(p_event_id, 255),
    p_occurred_at,
    left(p_provider_message_id, 255),
    p_event_type,
    nullif(left(coalesce(p_detail, ''), 1000), '')
  )
  on conflict (event_id) do nothing
  returning event_id into inserted_event_id;

  if inserted_event_id is null then
    was_duplicate := true;
    inserted_event_id := left(p_event_id, 255);
  end if;

  select deliveries.*
  into target_delivery
  from public.contact_email_deliveries as deliveries
  where deliveries.provider_message_id = p_provider_message_id
  for update;

  if target_delivery.id is null then
    return query select was_duplicate, false, null::uuid;
    return;
  end if;

  mapped_status := case p_event_type
    when 'email.sent' then 'provider_accepted'
    when 'email.delivered' then 'delivered'
    when 'email.delivery_delayed' then 'delivery_delayed'
    when 'email.bounced' then 'bounced'
    when 'email.complained' then 'complained'
    when 'email.failed' then 'failed'
    when 'email.suppressed' then 'suppressed'
  end;

  update public.contact_email_events
  set contact_email_delivery_id = target_delivery.id
  where event_id = inserted_event_id;

  if target_delivery.provider_event_at is null
    or p_occurred_at > target_delivery.provider_event_at
    or (
      p_occurred_at = target_delivery.provider_event_at
      and case p_event_type
        when 'email.complained' then 70
        when 'email.bounced' then 60
        when 'email.suppressed' then 50
        when 'email.failed' then 40
        when 'email.delivered' then 30
        when 'email.delivery_delayed' then 20
        else 10
      end >= case target_delivery.provider_event_type
        when 'email.complained' then 70
        when 'email.bounced' then 60
        when 'email.suppressed' then 50
        when 'email.failed' then 40
        when 'email.delivered' then 30
        when 'email.delivery_delayed' then 20
        else 10
      end
    ) then
    update public.contact_email_deliveries
    set
      status = mapped_status,
      provider_event_type = p_event_type,
      provider_event_at = p_occurred_at,
      payload = '{}'::jsonb,
      locked_at = null,
      lock_token = null,
      last_error = case
        when mapped_status in ('bounced', 'complained', 'suppressed', 'failed')
          then nullif(left(coalesce(p_detail, p_event_type), 2000), '')
        else null
      end
    where id = target_delivery.id;

    return query select was_duplicate, true, target_delivery.id;
    return;
  end if;

  return query select was_duplicate, false, target_delivery.id;
end;
$$;

revoke all on function public.record_contact_email_event(text, text, text, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.record_contact_email_event(text, text, text, timestamptz, text)
to service_role;

create or replace function public.requeue_failed_contact_email_deliveries(p_contact_submission_id uuid)
returns integer
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  submission public.contact_submissions%rowtype;
  delivery_payload jsonb;
  changed integer;
begin
  select submissions.* into submission
  from public.contact_submissions as submissions
  where submissions.id = p_contact_submission_id
  for update;

  if submission.id is null then
    raise exception using errcode = 'P0002', message = 'Contact submission not found.';
  end if;

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

  update public.contact_email_deliveries as deliveries
  set
    status = 'pending',
    payload = delivery_payload,
    attempts = 0,
    next_attempt_at = now(),
    last_attempt_at = null,
    locked_at = null,
    lock_token = null,
    provider_message_id = null,
    provider_accepted_at = null,
    provider_event_type = null,
    provider_event_at = null,
    last_error = null,
    requeue_count = deliveries.requeue_count + 1,
    idempotency_key = format(
      '%s/%s/requeue/%s',
      deliveries.channel,
      submission.request_reference,
      deliveries.requeue_count + 1
    )
  where deliveries.contact_submission_id = submission.id
    and deliveries.status = 'failed'
    and deliveries.requeue_count < 100;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.requeue_failed_contact_email_deliveries(uuid)
from public, anon, authenticated;
grant execute on function public.requeue_failed_contact_email_deliveries(uuid)
to service_role;

create or replace function public.delete_contact_subject_data(
  p_email text,
  p_recipient_hash text
)
returns table (contacts_deleted bigint, chats_deleted bigint, abuse_attempts_deleted bigint)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  normalized_email text := lower(trim(p_email));
  escaped_email text;
begin
  if normalized_email is null
    or length(normalized_email) > 255
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid subject email is required.';
  end if;

  if p_recipient_hash is null or p_recipient_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'A valid subject recipient hash is required.';
  end if;

  delete from public.contact_submissions
  where email_normalized = normalized_email;
  get diagnostics contacts_deleted = row_count;

  escaped_email := replace(replace(replace(normalized_email, '\', '\\'), '%', '\%'), '_', '\_');
  delete from public.chat_transcripts
  where lower(transcript) like '%' || escaped_email || '%' escape '\';
  get diagnostics chats_deleted = row_count;

  delete from public.lead_capture_attempts
  where resource = 'contact'
    and recipient_hash = p_recipient_hash;
  get diagnostics abuse_attempts_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.delete_contact_subject_data(text, text) from public, anon, authenticated;
grant execute on function public.delete_contact_subject_data(text, text) to service_role;

create or replace function public.prune_lead_capture_attempts()
returns bigint
language sql
volatile
security invoker
set search_path = pg_catalog, public
as $$
  with deleted as (
    delete from public.lead_capture_attempts
    where created_at < now() - interval '7 days'
    returning 1
  )
  select count(*)::bigint from deleted;
$$;

revoke all on function public.prune_lead_capture_attempts() from public, anon, authenticated;
grant execute on function public.prune_lead_capture_attempts() to service_role;

drop function if exists public.purge_expired_operational_data(integer, integer, integer, integer);

create function public.purge_expired_operational_data(
  p_contact_days integer default 730,
  p_chat_days integer default 365,
  p_portal_days integer default 180,
  p_abuse_attempt_days integer default 7,
  p_email_event_days integer default 30,
  p_telemetry_days integer default 30
)
returns table (
  contacts_deleted bigint,
  chats_deleted bigint,
  portal_events_deleted bigint,
  abuse_attempts_deleted bigint,
  orphan_email_events_deleted bigint,
  telemetry_events_deleted bigint
)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
begin
  if p_contact_days < 30
    or p_chat_days < 30
    or p_portal_days < 30
    or p_abuse_attempt_days < 1
    or p_email_event_days < 7
    or p_telemetry_days < 1 then
    raise exception 'Retention windows are below the approved minimum.';
  end if;

  delete from public.contact_submissions
  where status = 'archived'
    and email_delivery_status not in ('queued', 'processing', 'retrying', 'delivery_delayed')
    and created_at < now() - make_interval(days => p_contact_days);
  get diagnostics contacts_deleted = row_count;

  delete from public.chat_transcripts
  where status = 'archived'
    and created_at < now() - make_interval(days => p_chat_days);
  get diagnostics chats_deleted = row_count;

  delete from public.portal_click_events
  where created_at < now() - make_interval(days => p_portal_days);
  get diagnostics portal_events_deleted = row_count;

  delete from public.lead_capture_attempts
  where created_at < now() - make_interval(days => p_abuse_attempt_days);
  get diagnostics abuse_attempts_deleted = row_count;

  delete from public.contact_email_events
  where contact_email_delivery_id is null
    and received_at < now() - make_interval(days => p_email_event_days);
  get diagnostics orphan_email_events_deleted = row_count;

  delete from public.site_telemetry_events
  where received_at < now() - make_interval(days => p_telemetry_days);
  get diagnostics telemetry_events_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.purge_expired_operational_data(integer, integer, integer, integer, integer, integer)
from public, anon, authenticated;
grant execute on function public.purge_expired_operational_data(integer, integer, integer, integer, integer, integer)
to service_role;

create index if not exists contact_submissions_archived_retention_idx
on public.contact_submissions (created_at)
where status = 'archived';

create index if not exists chat_transcripts_archived_retention_idx
on public.chat_transcripts (created_at)
where status = 'archived';

drop function if exists public.contact_delivery_runtime_status();

create function public.contact_delivery_runtime_status()
returns table (
  schema_version text,
  queued_count bigint,
  failed_count bigint,
  delivery_issue_count bigint,
  oldest_queued_at timestamptz,
  oldest_processing_at timestamptz,
  worker_last_started_at timestamptz,
  worker_last_succeeded_at timestamptz,
  worker_last_failed_at timestamptz,
  worker_consecutive_failures integer,
  scheduler_active boolean,
  scheduler_last_succeeded_at timestamptz
)
language sql
stable
security invoker
set search_path = pg_catalog, public, cron
as $$
  select
    '20260715231001'::text,
    count(deliveries.id) filter (
      where deliveries.status in ('pending', 'processing', 'retrying', 'delivery_delayed')
        and submissions.status <> 'archived'
    ),
    count(deliveries.id) filter (
      where deliveries.status = 'failed'
        and submissions.status <> 'archived'
    ),
    count(deliveries.id) filter (
      where deliveries.status in ('bounced', 'complained', 'suppressed')
        and submissions.status <> 'archived'
    ),
    min(deliveries.created_at) filter (
      where deliveries.status in ('pending', 'retrying', 'delivery_delayed')
        and submissions.status <> 'archived'
    ),
    min(deliveries.locked_at) filter (
      where deliveries.status = 'processing'
        and submissions.status <> 'archived'
    ),
    runtime.last_started_at,
    runtime.last_succeeded_at,
    runtime.last_failed_at,
    coalesce(runtime.consecutive_failures, 0),
    exists (
      select 1 from cron.job
      where jobname = 'aixco-contact-email-worker'
        and active
    ),
    (
      select max(runs.end_time)
      from cron.job_run_details as runs
      join cron.job as jobs on jobs.jobid = runs.jobid
      where jobs.jobname = 'aixco-contact-email-worker'
        and runs.status = 'succeeded'
    )
  from public.contact_email_worker_runtime as runtime
  left join public.contact_email_deliveries as deliveries on true
  left join public.contact_submissions as submissions
    on submissions.id = deliveries.contact_submission_id
  where runtime.worker_name = 'contact-email-deliveries'
  group by
    runtime.last_started_at,
    runtime.last_succeeded_at,
    runtime.last_failed_at,
    runtime.consecutive_failures;
$$;

revoke all on function public.contact_delivery_runtime_status() from public, anon, authenticated;
grant execute on function public.contact_delivery_runtime_status() to service_role;
grant usage on schema cron to service_role;
grant select on cron.job, cron.job_run_details to service_role;

-- Replace any earlier definition without exposing the bearer secret. The job
-- resolves both values from Vault for every run. Configure these Vault names:
--   aixco_contact_worker_url = https://www.aixco.global/api/cron/contact-email-deliveries
--   aixco_cron_secret        = the same strong value as CRON_SECRET in Vercel
do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'aixco-contact-email-worker';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'aixco-contact-email-worker',
    '*/5 * * * *',
    $job$
      select net.http_post(
        url := secrets.worker_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || secrets.cron_secret,
          'X-AIXCO-Worker-Source', 'supabase-cron'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 25000
      )
      from (
        select
          max(decrypted_secret) filter (where name = 'aixco_contact_worker_url') as worker_url,
          max(decrypted_secret) filter (where name = 'aixco_cron_secret') as cron_secret
        from vault.decrypted_secrets
        where name in ('aixco_contact_worker_url', 'aixco_cron_secret')
      ) as secrets
      where secrets.worker_url is not null
        and secrets.cron_secret is not null;
    $job$
  );
end;
$$;

comment on table public.contact_email_events is
  'Deduplicated, signed Resend delivery events. Raw webhook payloads and recipient addresses are intentionally not retained.';
comment on table public.contact_email_worker_runtime is
  'Singleton operational heartbeat for the durable contact email worker.';
comment on table public.site_telemetry_events is
  'Short-lived, service-role-only Web Vitals and application error telemetry without direct identifiers.';
comment on function public.claim_contact_email_deliveries(integer) is
  'Claims bounded email leases, expires terminal stale leases, and permits abandoned nonterminal attempts to retry after two minutes.';
comment on function public.requeue_failed_contact_email_deliveries(uuid) is
  'Requeues only API/provider-failed deliveries with a new idempotency key. Bounces, complaints, and suppressions remain blocked.';
comment on function public.purge_expired_operational_data(integer, integer, integer, integer, integer, integer) is
  'Deletes only archived leads and expired operational telemetry using canonical AIXCO retention windows.';
