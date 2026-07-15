alter table public.contact_submissions
add column email_delivery_status text not null default 'not_scheduled',
add column email_delivery_updated_at timestamptz not null default now(),
add constraint contact_submissions_email_delivery_status_check check (
  email_delivery_status in (
    'not_scheduled',
    'queued',
    'processing',
    'retrying',
    'provider_accepted',
    'partially_accepted',
    'failed'
  )
);

create table public.contact_email_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_submission_id uuid not null references public.contact_submissions(id) on delete cascade,
  request_reference text not null,
  channel text not null,
  status text not null default 'pending',
  idempotency_key text not null,
  payload jsonb not null,
  attempts integer not null default 0,
  max_attempts integer not null default 8,
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  locked_at timestamptz,
  lock_token uuid,
  provider_message_id text,
  provider_accepted_at timestamptz,
  last_error text,
  constraint contact_email_deliveries_channel_check check (
    channel in ('lead_notification', 'contact_confirmation')
  ),
  constraint contact_email_deliveries_status_check check (
    status in ('pending', 'processing', 'retrying', 'provider_accepted', 'failed')
  ),
  constraint contact_email_deliveries_reference_format_check check (
    request_reference ~ '^AIX-[0-9]{4}-[0-9]{6}$'
  ),
  constraint contact_email_deliveries_idempotency_key_length check (
    length(idempotency_key) between 1 and 256
  ),
  constraint contact_email_deliveries_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint contact_email_deliveries_attempts_check check (
    attempts between 0 and max_attempts
  ),
  constraint contact_email_deliveries_max_attempts_check check (
    max_attempts between 1 and 20
  ),
  constraint contact_email_deliveries_provider_id_length check (
    provider_message_id is null or length(provider_message_id) <= 255
  ),
  constraint contact_email_deliveries_last_error_length check (
    last_error is null or length(last_error) <= 2000
  ),
  constraint contact_email_deliveries_submission_channel_unique unique (
    contact_submission_id,
    channel
  ),
  constraint contact_email_deliveries_idempotency_key_unique unique (idempotency_key)
);

create index contact_email_deliveries_ready_idx
on public.contact_email_deliveries (next_attempt_at, created_at)
where status in ('pending', 'retrying');

create index contact_email_deliveries_stale_lock_idx
on public.contact_email_deliveries (locked_at)
where status = 'processing';

create index contact_email_deliveries_submission_idx
on public.contact_email_deliveries (contact_submission_id, channel);

create table public.lead_capture_attempts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  resource text not null,
  client_hash text not null,
  recipient_hash text,
  allowed boolean not null,
  reason text,
  constraint lead_capture_attempts_resource_check check (
    resource in ('contact', 'chat', 'portal-event')
  ),
  constraint lead_capture_attempts_client_hash_check check (
    client_hash ~ '^[a-f0-9]{64}$'
  ),
  constraint lead_capture_attempts_recipient_hash_check check (
    recipient_hash is null or recipient_hash ~ '^[a-f0-9]{64}$'
  ),
  constraint lead_capture_attempts_reason_length check (
    reason is null or length(reason) <= 80
  )
);

create index lead_capture_attempts_client_window_idx
on public.lead_capture_attempts (resource, client_hash, created_at desc)
where allowed;

create index lead_capture_attempts_recipient_window_idx
on public.lead_capture_attempts (resource, recipient_hash, created_at desc)
where allowed and recipient_hash is not null;

alter table public.contact_email_deliveries enable row level security;
alter table public.contact_email_deliveries force row level security;
alter table public.lead_capture_attempts enable row level security;
alter table public.lead_capture_attempts force row level security;

revoke all on public.contact_email_deliveries from public, anon, authenticated;
revoke all on public.lead_capture_attempts from public, anon, authenticated;
revoke all on sequence public.lead_capture_attempts_id_seq from public, anon, authenticated;

grant all on public.contact_email_deliveries to service_role;
grant all on public.lead_capture_attempts to service_role;
grant usage, select on sequence public.lead_capture_attempts_id_seq to service_role;

create trigger contact_email_deliveries_set_updated_at
before update on public.contact_email_deliveries
for each row execute function private.set_updated_at();

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
    when bool_and(deliveries.status = 'provider_accepted') then 'provider_accepted'
    when bool_or(deliveries.status = 'provider_accepted')
      and bool_or(deliveries.status = 'failed') then 'partially_accepted'
    when bool_or(deliveries.status = 'failed') then 'failed'
    when bool_or(deliveries.status = 'retrying') then 'retrying'
    when bool_or(deliveries.status = 'processing') then 'processing'
    else 'queued'
  end
  into aggregate_status
  from public.contact_email_deliveries as deliveries
  where deliveries.contact_submission_id = submission_id;

  update public.contact_submissions
  set
    email_delivery_status = aggregate_status,
    email_delivery_updated_at = now()
  where id = submission_id;

  return null;
end;
$$;

revoke all on function private.refresh_contact_email_delivery_status() from public;
grant usage on schema private to service_role;
grant execute on function private.refresh_contact_email_delivery_status() to service_role;

create trigger contact_email_deliveries_refresh_submission_status_insert_delete
after insert or delete on public.contact_email_deliveries
for each row execute function private.refresh_contact_email_delivery_status();

create trigger contact_email_deliveries_refresh_submission_status_update
after update of status on public.contact_email_deliveries
for each row execute function private.refresh_contact_email_delivery_status();

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
begin
  if jsonb_typeof(p_submission) is distinct from 'object' then
    raise exception 'Contact submission payload must be a JSON object.';
  end if;

  insert into public.contact_submissions (
    source,
    name,
    email,
    interest,
    message,
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

create or replace function public.claim_contact_email_deliveries(p_batch_size integer default 20)
returns setof public.contact_email_deliveries
language sql
volatile
security invoker
set search_path = pg_catalog, public, extensions
as $$
  with candidates as (
    select deliveries.id
    from public.contact_email_deliveries as deliveries
    where (
      deliveries.status in ('pending', 'retrying')
      and deliveries.next_attempt_at <= now()
      and deliveries.attempts < deliveries.max_attempts
    ) or (
      deliveries.status = 'processing'
      and deliveries.locked_at < now() - interval '10 minutes'
      and deliveries.attempts <= deliveries.max_attempts
    )
    order by deliveries.next_attempt_at, deliveries.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_batch_size, 20), 100))
  ),
  claimed as (
    update public.contact_email_deliveries as deliveries
    set
      status = 'processing',
      attempts = least(deliveries.max_attempts, deliveries.attempts + 1),
      last_attempt_at = now(),
      locked_at = now(),
      lock_token = extensions.gen_random_uuid(),
      last_error = null
    from candidates
    where deliveries.id = candidates.id
    returning deliveries.*
  )
  select * from claimed;
$$;

revoke all on function public.claim_contact_email_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_contact_email_deliveries(integer) to service_role;

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
  if p_resource not in ('contact', 'chat', 'portal-event') then
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

  select count(*)::integer
  into client_count
  from public.lead_capture_attempts as attempts
  where attempts.resource = p_resource
    and attempts.client_hash = p_client_hash
    and attempts.allowed
    and attempts.created_at > now() - make_interval(secs => client_window);

  if p_recipient_hash is not null and recipient_limit > 0 then
    select count(*)::integer
    into recipient_count
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
    )
    into retry_seconds
    from public.lead_capture_attempts as attempts
    where attempts.resource = p_resource
      and attempts.client_hash = p_client_hash
      and attempts.allowed
      and attempts.created_at > now() - make_interval(secs => client_window);

    insert into public.lead_capture_attempts (
      resource, client_hash, recipient_hash, allowed, reason
    ) values (
      p_resource, p_client_hash, p_recipient_hash, false, 'client_rate_limit'
    );

    return query select false, 'client_rate_limit'::text, retry_seconds;
    return;
  end if;

  if p_recipient_hash is not null and recipient_limit > 0 and recipient_count >= recipient_limit then
    select greatest(
      1,
      ceil(extract(epoch from (
        min(attempts.created_at) + make_interval(secs => recipient_window) - now()
      )))::integer
    )
    into retry_seconds
    from public.lead_capture_attempts as attempts
    where attempts.resource = p_resource
      and attempts.recipient_hash = p_recipient_hash
      and attempts.allowed
      and attempts.created_at > now() - make_interval(secs => recipient_window);

    insert into public.lead_capture_attempts (
      resource, client_hash, recipient_hash, allowed, reason
    ) values (
      p_resource, p_client_hash, p_recipient_hash, false, 'recipient_cooldown'
    );

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

revoke all on function public.record_lead_capture_attempt(
  text, text, text, integer, integer, integer, integer
) from public, anon, authenticated;
grant execute on function public.record_lead_capture_attempt(
  text, text, text, integer, integer, integer, integer
) to service_role;

create or replace function public.prune_lead_capture_attempts()
returns bigint
language sql
volatile
security invoker
set search_path = pg_catalog, public
as $$
  with deleted as (
    delete from public.lead_capture_attempts
    where created_at < now() - interval '2 days'
    returning 1
  )
  select count(*)::bigint from deleted;
$$;

revoke all on function public.prune_lead_capture_attempts() from public, anon, authenticated;
grant execute on function public.prune_lead_capture_attempts() to service_role;

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
    '20260715125925'::text,
    count(*) filter (where status in ('pending', 'processing', 'retrying')),
    count(*) filter (where status = 'failed')
  from public.contact_email_deliveries;
$$;

revoke all on function public.contact_delivery_runtime_status() from public, anon, authenticated;
grant execute on function public.contact_delivery_runtime_status() to service_role;

-- Users may edit their own contact details, but authorization and onboarding
-- fields remain service-controlled. RLS alone only limits rows, not columns.
revoke insert, update on public.profiles from authenticated;
grant insert (id, full_name, company_name, phone, metadata)
on public.profiles to authenticated;
grant update (full_name, company_name, phone, metadata)
on public.profiles to authenticated;

comment on table public.contact_email_deliveries is
  'Durable transactional outbox for AIXCO contact notifications and confirmations.';
comment on table public.lead_capture_attempts is
  'Hashed, short-lived lead capture attempts used for distributed abuse controls; the worker retains two days.';
comment on column public.contact_submissions.email_delivery_status is
  'Aggregate provider-acceptance state for the two emails scheduled for this request.';
comment on function public.create_contact_submission(jsonb) is
  'Atomically stores a contact request and schedules both required email deliveries.';
