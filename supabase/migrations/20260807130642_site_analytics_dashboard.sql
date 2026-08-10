-- Privacy-aware, service-role-only website analytics and administrator audit data.
-- Browser clients never receive table grants; trusted server routes perform ingestion.

create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.site_analytics_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  visitor_id uuid not null,
  consent_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  active_seconds integer not null default 0,
  landing_path text,
  exit_path text,
  referrer_host text,
  referrer_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  locale text,
  timezone text,
  screen_width integer,
  screen_height integer,
  viewport_width integer,
  viewport_height integer,
  device_type text,
  browser_name text,
  os_name text,
  user_agent text,
  is_returning boolean not null default false,
  constraint site_analytics_sessions_consent_version_length
    check (length(trim(consent_version)) between 1 and 80),
  constraint site_analytics_sessions_time_order
    check (last_seen_at >= started_at and (ended_at is null or ended_at >= started_at)),
  constraint site_analytics_sessions_active_seconds_range
    check (active_seconds between 0 and 31536000),
  constraint site_analytics_sessions_landing_path_length
    check (landing_path is null or length(landing_path) <= 2048),
  constraint site_analytics_sessions_exit_path_length
    check (exit_path is null or length(exit_path) <= 2048),
  constraint site_analytics_sessions_referrer_host_length
    check (referrer_host is null or length(referrer_host) <= 255),
  constraint site_analytics_sessions_referrer_path_length
    check (referrer_path is null or length(referrer_path) <= 2048),
  constraint site_analytics_sessions_utm_source_length
    check (utm_source is null or length(utm_source) <= 512),
  constraint site_analytics_sessions_utm_medium_length
    check (utm_medium is null or length(utm_medium) <= 512),
  constraint site_analytics_sessions_utm_campaign_length
    check (utm_campaign is null or length(utm_campaign) <= 512),
  constraint site_analytics_sessions_utm_content_length
    check (utm_content is null or length(utm_content) <= 512),
  constraint site_analytics_sessions_utm_term_length
    check (utm_term is null or length(utm_term) <= 512),
  constraint site_analytics_sessions_locale_length
    check (locale is null or length(locale) <= 35),
  constraint site_analytics_sessions_timezone_length
    check (timezone is null or length(timezone) <= 100),
  constraint site_analytics_sessions_screen_width_range
    check (screen_width is null or screen_width between 0 and 100000),
  constraint site_analytics_sessions_screen_height_range
    check (screen_height is null or screen_height between 0 and 100000),
  constraint site_analytics_sessions_viewport_width_range
    check (viewport_width is null or viewport_width between 0 and 100000),
  constraint site_analytics_sessions_viewport_height_range
    check (viewport_height is null or viewport_height between 0 and 100000),
  constraint site_analytics_sessions_device_type_length
    check (device_type is null or length(device_type) <= 80),
  constraint site_analytics_sessions_browser_name_length
    check (browser_name is null or length(browser_name) <= 120),
  constraint site_analytics_sessions_os_name_length
    check (os_name is null or length(os_name) <= 120),
  constraint site_analytics_sessions_user_agent_length
    check (user_agent is null or length(user_agent) <= 512)
);

create table if not exists public.site_analytics_session_network (
  session_id uuid primary key
    references public.site_analytics_sessions(id) on delete cascade,
  ip_address inet,
  ip_hash text,
  country_code text,
  region text,
  city text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  raw_ip_expires_at timestamptz default (now() + interval '30 days'),
  raw_ip_purged_at timestamptz,
  constraint site_analytics_session_network_ip_hash_format
    check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  constraint site_analytics_session_network_country_code_format
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint site_analytics_session_network_region_length
    check (region is null or length(region) <= 160),
  constraint site_analytics_session_network_city_length
    check (city is null or length(city) <= 160),
  constraint site_analytics_session_network_time_order
    check (last_seen_at >= first_seen_at),
  constraint site_analytics_session_network_raw_ip_state
    check (
      (raw_ip_purged_at is null)
      or (ip_address is null and raw_ip_expires_at is null)
    )
);

create table if not exists public.site_analytics_events (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null
    references public.site_analytics_sessions(id) on delete cascade,
  received_at timestamptz not null default now(),
  occurred_at timestamptz not null default now(),
  event_type text not null,
  name text not null,
  page_path text,
  section_id text,
  target_label text,
  value double precision,
  duration_ms integer,
  scroll_depth numeric(5, 2),
  metadata jsonb not null default '{}'::jsonb,
  constraint site_analytics_events_event_type_format
    check (event_type ~ '^[a-z][a-z0-9_]{0,63}$'),
  constraint site_analytics_events_name_format
    check (name ~ '^[a-z][a-z0-9_]{0,79}$'),
  constraint site_analytics_events_page_path_length
    check (page_path is null or length(page_path) <= 2048),
  constraint site_analytics_events_section_id_length
    check (section_id is null or length(section_id) <= 160),
  constraint site_analytics_events_target_label_length
    check (target_label is null or length(target_label) <= 512),
  constraint site_analytics_events_value_range
    check (value is null or abs(value) <= 1000000000000::double precision),
  constraint site_analytics_events_duration_ms_range
    check (duration_ms is null or duration_ms between 0 and 86400000),
  constraint site_analytics_events_scroll_depth_range
    check (scroll_depth is null or scroll_depth between 0 and 100),
  constraint site_analytics_events_metadata_object
    check (jsonb_typeof(metadata) = 'object'),
  constraint site_analytics_events_metadata_size
    check (octet_length(metadata::text) <= 8192)
);

create table if not exists public.admin_audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  actor_email_hash text,
  action text not null,
  outcome text not null,
  auth_method text,
  target_type text,
  target_id text,
  ip_address inet,
  ip_hash text,
  raw_ip_expires_at timestamptz default (now() + interval '30 days'),
  raw_ip_purged_at timestamptz,
  user_agent text,
  request_id text,
  details jsonb not null default '{}'::jsonb,
  constraint admin_audit_events_actor_email_hash_format
    check (actor_email_hash is null or actor_email_hash ~ '^[0-9a-f]{24,64}$'),
  constraint admin_audit_events_action_format
    check (action ~ '^[a-z][a-z0-9_.:-]{0,119}$'),
  constraint admin_audit_events_outcome_check
    check (outcome in ('success', 'failure', 'denied')),
  constraint admin_audit_events_auth_method_length
    check (auth_method is null or length(auth_method) <= 80),
  constraint admin_audit_events_target_type_length
    check (target_type is null or length(target_type) <= 120),
  constraint admin_audit_events_target_id_length
    check (target_id is null or length(target_id) <= 255),
  constraint admin_audit_events_ip_hash_format
    check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  constraint admin_audit_events_raw_ip_state
    check (
      (raw_ip_purged_at is null)
      or (ip_address is null and raw_ip_expires_at is null)
    ),
  constraint admin_audit_events_user_agent_length
    check (user_agent is null or length(user_agent) <= 512),
  constraint admin_audit_events_request_id_length
    check (request_id is null or length(request_id) <= 160),
  constraint admin_audit_events_details_object
    check (jsonb_typeof(details) = 'object'),
  constraint admin_audit_events_details_size
    check (octet_length(details::text) <= 8192)
);

create table if not exists public.admin_login_rate_limits (
  client_hash text primary key,
  window_started_at timestamptz not null default now(),
  window_expires_at timestamptz not null,
  attempt_count integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint admin_login_rate_limits_client_hash_format
    check (client_hash ~ '^[0-9a-f]{64}$'),
  constraint admin_login_rate_limits_window_order
    check (window_expires_at > window_started_at),
  constraint admin_login_rate_limits_attempt_count_range
    check (attempt_count between 1 and 1001),
  constraint admin_login_rate_limits_updated_at_order
    check (updated_at >= window_started_at)
);

-- Reordered browser beacons and idempotent upserts must not move session clocks
-- or accumulated activity backwards.
create or replace function private.preserve_site_analytics_session_progress()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.started_at := least(old.started_at, new.started_at);
  new.last_seen_at := greatest(old.last_seen_at, new.last_seen_at, new.started_at);
  -- The first batch accepts at most 60 seconds (see the ingest function below).
  -- After that, the cumulative ceiling advances only with server-observed time
  -- since the row was created. A cumulative ceiling is important here: a
  -- per-request allowance could be harvested by rapid retries.
  new.active_seconds := greatest(
    old.active_seconds,
    least(
      new.active_seconds,
      60 + greatest(
        0,
        floor(extract(epoch from (now() - old.created_at)))::integer
      )
    )
  );

  if old.ended_at is not null and new.ended_at is not null then
    new.ended_at := greatest(old.ended_at, new.ended_at);
  elsif old.ended_at is not null and new.last_seen_at <= old.ended_at then
    new.ended_at := old.ended_at;
  else
    -- A later foreground beacon means a BFCache/reload session resumed.
    new.ended_at := null;
  end if;

  if new.ended_at is not null then
    new.last_seen_at := greatest(new.last_seen_at, new.ended_at);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.preserve_site_analytics_network_progress()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.first_seen_at := least(old.first_seen_at, new.first_seen_at);
  new.last_seen_at := greatest(old.last_seen_at, new.last_seen_at, new.first_seen_at);

  -- Once retention has scrubbed a raw IP, later retries cannot restore it.
  if old.raw_ip_purged_at is not null then
    new.ip_address := null;
    new.raw_ip_expires_at := null;
    new.raw_ip_purged_at := old.raw_ip_purged_at;
  elsif new.raw_ip_purged_at is not null then
    new.ip_address := null;
    new.raw_ip_expires_at := null;
  elsif old.raw_ip_expires_at is not null and new.raw_ip_expires_at is not null then
    new.raw_ip_expires_at := least(old.raw_ip_expires_at, new.raw_ip_expires_at);
  elsif old.raw_ip_expires_at is not null then
    new.raw_ip_expires_at := old.raw_ip_expires_at;
  end if;

  return new;
end;
$$;

create or replace function private.preserve_admin_audit_raw_ip_purge()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.raw_ip_purged_at is not null then
    new.ip_address := null;
    new.raw_ip_expires_at := null;
    new.raw_ip_purged_at := old.raw_ip_purged_at;
  elsif new.raw_ip_purged_at is not null then
    new.ip_address := null;
    new.raw_ip_expires_at := null;
  elsif old.raw_ip_expires_at is not null and new.raw_ip_expires_at is not null then
    new.raw_ip_expires_at := least(old.raw_ip_expires_at, new.raw_ip_expires_at);
  elsif old.raw_ip_expires_at is not null then
    new.raw_ip_expires_at := old.raw_ip_expires_at;
  end if;

  return new;
end;
$$;

revoke all on function private.preserve_site_analytics_session_progress()
from public, anon, authenticated;
revoke all on function private.preserve_site_analytics_network_progress()
from public, anon, authenticated;
revoke all on function private.preserve_admin_audit_raw_ip_purge()
from public, anon, authenticated;

drop trigger if exists site_analytics_sessions_preserve_progress
on public.site_analytics_sessions;
create trigger site_analytics_sessions_preserve_progress
before update on public.site_analytics_sessions
for each row execute function private.preserve_site_analytics_session_progress();

drop trigger if exists site_analytics_session_network_preserve_progress
on public.site_analytics_session_network;
create trigger site_analytics_session_network_preserve_progress
before update on public.site_analytics_session_network
for each row execute function private.preserve_site_analytics_network_progress();

drop trigger if exists admin_audit_events_preserve_raw_ip_purge
on public.admin_audit_events;
create trigger admin_audit_events_preserve_raw_ip_purge
before update on public.admin_audit_events
for each row execute function private.preserve_admin_audit_raw_ip_purge();

alter table public.site_analytics_sessions enable row level security;
alter table public.site_analytics_sessions force row level security;
alter table public.site_analytics_session_network enable row level security;
alter table public.site_analytics_session_network force row level security;
alter table public.site_analytics_events enable row level security;
alter table public.site_analytics_events force row level security;
alter table public.admin_audit_events enable row level security;
alter table public.admin_audit_events force row level security;
alter table public.admin_login_rate_limits enable row level security;
alter table public.admin_login_rate_limits force row level security;

revoke all on table public.site_analytics_sessions from public, anon, authenticated;
revoke all on table public.site_analytics_session_network from public, anon, authenticated;
revoke all on table public.site_analytics_events from public, anon, authenticated;
revoke all on table public.admin_audit_events from public, anon, authenticated;
revoke all on table public.admin_login_rate_limits from public, anon, authenticated;

grant all on table public.site_analytics_sessions to service_role;
grant all on table public.site_analytics_session_network to service_role;
grant all on table public.site_analytics_events to service_role;
grant all on table public.admin_audit_events to service_role;
grant all on table public.admin_login_rate_limits to service_role;

create index if not exists site_analytics_sessions_started_at_idx
on public.site_analytics_sessions (started_at desc);

create index if not exists site_analytics_sessions_last_seen_at_idx
on public.site_analytics_sessions (last_seen_at desc);

create index if not exists site_analytics_sessions_visitor_started_at_idx
on public.site_analytics_sessions (visitor_id, started_at desc);

create index if not exists site_analytics_sessions_referrer_started_at_idx
on public.site_analytics_sessions (referrer_host, started_at desc)
where referrer_host is not null;

create index if not exists site_analytics_sessions_campaign_started_at_idx
on public.site_analytics_sessions (utm_campaign, started_at desc)
where utm_campaign is not null;

create index if not exists site_analytics_session_network_ip_hash_idx
on public.site_analytics_session_network (ip_hash)
where ip_hash is not null;

create index if not exists site_analytics_session_network_country_idx
on public.site_analytics_session_network (country_code, last_seen_at desc)
where country_code is not null;

create index if not exists site_analytics_session_network_raw_ip_expiry_idx
on public.site_analytics_session_network (raw_ip_expires_at)
where ip_address is not null and raw_ip_expires_at is not null;

create index if not exists site_analytics_events_occurred_at_idx
on public.site_analytics_events (occurred_at desc);

create index if not exists site_analytics_events_received_at_idx
on public.site_analytics_events (received_at desc);

create index if not exists site_analytics_events_session_occurred_at_idx
on public.site_analytics_events (session_id, occurred_at desc);

create index if not exists site_analytics_events_name_occurred_at_idx
on public.site_analytics_events (name, occurred_at desc);

create index if not exists site_analytics_events_page_occurred_at_idx
on public.site_analytics_events (page_path, occurred_at desc)
where page_path is not null;

create index if not exists site_analytics_events_error_occurred_at_idx
on public.site_analytics_events (occurred_at desc)
where event_type = 'form_error' or name = 'form_failed';

create index if not exists admin_audit_events_occurred_at_idx
on public.admin_audit_events (occurred_at desc);

create index if not exists admin_audit_events_actor_occurred_at_idx
on public.admin_audit_events (actor_id, occurred_at desc)
where actor_id is not null;

create index if not exists admin_audit_events_action_occurred_at_idx
on public.admin_audit_events (action, occurred_at desc);

create index if not exists admin_audit_events_outcome_occurred_at_idx
on public.admin_audit_events (outcome, occurred_at desc);

create index if not exists admin_audit_events_raw_ip_expiry_idx
on public.admin_audit_events (raw_ip_expires_at)
where ip_address is not null and raw_ip_expires_at is not null;

create index if not exists admin_login_rate_limits_expiry_idx
on public.admin_login_rate_limits (window_expires_at);

-- A fixed-window counter is one bounded row per HMAC identity. The upsert is
-- atomic under concurrent serverless requests and saturates at limit + 1, so
-- repeated blocked attempts cannot overflow the counter or extend the window.
drop function if exists public.consume_admin_login_rate_limit(text, integer, integer);

create function public.consume_admin_login_rate_limit(
  p_client_hash text,
  p_limit integer default 8,
  p_window_seconds integer default 900
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 8), 1000));
  v_window_seconds integer := greatest(60, least(coalesce(p_window_seconds, 900), 3600));
  v_now timestamptz := now();
  v_attempt_count integer;
  v_window_expires_at timestamptz;
begin
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception using
      errcode = '22023',
      message = 'Invalid administrator login identity hash.';
  end if;

  insert into public.admin_login_rate_limits as limits (
    client_hash,
    window_started_at,
    window_expires_at,
    attempt_count,
    updated_at
  ) values (
    p_client_hash,
    v_now,
    v_now + make_interval(secs => v_window_seconds),
    1,
    v_now
  )
  on conflict (client_hash) do update
  set
    window_started_at = case
      when limits.window_expires_at <= v_now then v_now
      else limits.window_started_at
    end,
    window_expires_at = case
      when limits.window_expires_at <= v_now
        then v_now + make_interval(secs => v_window_seconds)
      else limits.window_expires_at
    end,
    attempt_count = case
      when limits.window_expires_at <= v_now then 1
      else least(v_limit + 1, limits.attempt_count + 1)
    end,
    updated_at = v_now
  returning limits.attempt_count, limits.window_expires_at
  into v_attempt_count, v_window_expires_at;

  return query select
    v_attempt_count <= v_limit,
    case
      when v_attempt_count <= v_limit then 0
      else greatest(
        1,
        least(
          v_window_seconds,
          ceil(extract(epoch from (v_window_expires_at - v_now)))::integer
        )
      )
    end;
end;
$$;

revoke all on function public.consume_admin_login_rate_limit(text, integer, integer)
from public, anon, authenticated;
grant execute on function public.consume_admin_login_rate_limit(text, integer, integer)
to service_role;

-- A browser batch is committed atomically so a network or event failure cannot
-- leave an orphaned session. The public HTTP route validates and bounds every
-- field before this service-role-only function is called.
drop function if exists public.store_site_analytics_batch(jsonb, jsonb, jsonb);

create function public.store_site_analytics_batch(
  p_session jsonb,
  p_network jsonb,
  p_events jsonb
)
returns integer
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_event_count integer := 0;
begin
  if jsonb_typeof(p_session) is distinct from 'object'
    or jsonb_typeof(p_network) is distinct from 'object'
    or jsonb_typeof(p_events) is distinct from 'array'
    or jsonb_array_length(p_events) < 1
    or jsonb_array_length(p_events) > 30 then
    raise exception using errcode = '22023', message = 'Invalid analytics batch payload.';
  end if;

  if (p_network ->> 'session_id') is distinct from (p_session ->> 'id')
    or exists (
      select 1
      from jsonb_array_elements(p_events) as event
      where event ->> 'session_id' is distinct from (p_session ->> 'id')
    ) then
    raise exception using errcode = '22023', message = 'Analytics batch session identifiers do not match.';
  end if;

  insert into public.site_analytics_sessions (
    id, visitor_id, consent_version, started_at, last_seen_at, ended_at,
    active_seconds, landing_path, exit_path, referrer_host, referrer_path,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, locale,
    timezone, screen_width, screen_height, viewport_width, viewport_height,
    device_type, browser_name, os_name, user_agent, is_returning
  ) values (
    (p_session ->> 'id')::uuid,
    (p_session ->> 'visitor_id')::uuid,
    p_session ->> 'consent_version',
    (p_session ->> 'started_at')::timestamptz,
    (p_session ->> 'last_seen_at')::timestamptz,
    (p_session ->> 'ended_at')::timestamptz,
    least((p_session ->> 'active_seconds')::integer, 60),
    p_session ->> 'landing_path',
    p_session ->> 'exit_path',
    p_session ->> 'referrer_host',
    p_session ->> 'referrer_path',
    p_session ->> 'utm_source',
    p_session ->> 'utm_medium',
    p_session ->> 'utm_campaign',
    p_session ->> 'utm_term',
    p_session ->> 'utm_content',
    p_session ->> 'locale',
    p_session ->> 'timezone',
    (p_session ->> 'screen_width')::integer,
    (p_session ->> 'screen_height')::integer,
    (p_session ->> 'viewport_width')::integer,
    (p_session ->> 'viewport_height')::integer,
    p_session ->> 'device_type',
    p_session ->> 'browser_name',
    p_session ->> 'os_name',
    p_session ->> 'user_agent',
    coalesce((p_session ->> 'is_returning')::boolean, false)
  )
  on conflict (id) do update set
    visitor_id = excluded.visitor_id,
    consent_version = excluded.consent_version,
    started_at = excluded.started_at,
    last_seen_at = excluded.last_seen_at,
    ended_at = excluded.ended_at,
    active_seconds = (p_session ->> 'active_seconds')::integer,
    landing_path = excluded.landing_path,
    exit_path = excluded.exit_path,
    referrer_host = excluded.referrer_host,
    referrer_path = excluded.referrer_path,
    utm_source = excluded.utm_source,
    utm_medium = excluded.utm_medium,
    utm_campaign = excluded.utm_campaign,
    utm_term = excluded.utm_term,
    utm_content = excluded.utm_content,
    locale = excluded.locale,
    timezone = excluded.timezone,
    screen_width = excluded.screen_width,
    screen_height = excluded.screen_height,
    viewport_width = excluded.viewport_width,
    viewport_height = excluded.viewport_height,
    device_type = excluded.device_type,
    browser_name = excluded.browser_name,
    os_name = excluded.os_name,
    user_agent = excluded.user_agent,
    is_returning = excluded.is_returning;

  insert into public.site_analytics_session_network (
    session_id, ip_address, ip_hash, country_code, region, city,
    first_seen_at, last_seen_at
  ) values (
    (p_network ->> 'session_id')::uuid,
    (p_network ->> 'ip_address')::inet,
    p_network ->> 'ip_hash',
    p_network ->> 'country_code',
    p_network ->> 'region',
    p_network ->> 'city',
    (p_network ->> 'first_seen_at')::timestamptz,
    (p_network ->> 'last_seen_at')::timestamptz
  )
  on conflict (session_id) do update set
    ip_address = excluded.ip_address,
    ip_hash = excluded.ip_hash,
    country_code = excluded.country_code,
    region = excluded.region,
    city = excluded.city,
    first_seen_at = excluded.first_seen_at,
    last_seen_at = excluded.last_seen_at;

  insert into public.site_analytics_events (
    id, session_id, occurred_at, event_type, name, page_path, section_id,
    target_label, value, duration_ms, scroll_depth, metadata
  )
  select
    (event ->> 'id')::uuid,
    (event ->> 'session_id')::uuid,
    (event ->> 'occurred_at')::timestamptz,
    event ->> 'event_type',
    event ->> 'name',
    event ->> 'page_path',
    event ->> 'section_id',
    event ->> 'target_label',
    (event ->> 'value')::double precision,
    (event ->> 'duration_ms')::integer,
    (event ->> 'scroll_depth')::numeric,
    coalesce(event -> 'metadata', '{}'::jsonb)
  from jsonb_array_elements(p_events) as event
  on conflict (id) do nothing;

  get diagnostics v_event_count = row_count;
  return v_event_count;
end;
$$;

revoke all on function public.store_site_analytics_batch(jsonb, jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.store_site_analytics_batch(jsonb, jsonb, jsonb)
to service_role;

drop function if exists public.get_site_analytics_dashboard(timestamptz, timestamptz, integer);

create function public.get_site_analytics_dashboard(
  p_start timestamptz default (now() - interval '30 days'),
  p_end timestamptz default now(),
  p_limit integer default 20
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_limit integer;
  v_result jsonb;
begin
  if p_start is null or p_end is null or p_start >= p_end then
    raise exception using
      errcode = '22023',
      message = 'Analytics window must have a non-null start before its end.';
  end if;

  if p_end - p_start > interval '731 days' then
    raise exception using
      errcode = '22023',
      message = 'Analytics dashboard window cannot exceed 731 days.';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception using
      errcode = '22023',
      message = 'Analytics dashboard limit must be between 1 and 100.';
  end if;

  v_limit := p_limit;

  with
  selected_sessions as materialized (
    select sessions.*
    from public.site_analytics_sessions as sessions
    where sessions.created_at >= p_start
      and sessions.created_at < p_end
  ),
  selected_events as materialized (
    select events.*
    from public.site_analytics_events as events
    join selected_sessions as sessions on sessions.id = events.session_id
    where events.received_at >= p_start
      and events.received_at < p_end
  ),
  selected_telemetry as materialized (
    select telemetry.*
    from public.site_telemetry_events as telemetry
    where telemetry.received_at >= p_start
      and telemetry.received_at < p_end
  ),
  confirmed_contacts as materialized (
    select
      contacts.created_at,
      case
        when coalesce(contacts.metadata ->> 'analytics_session_id', '') ~*
          '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then (contacts.metadata ->> 'analytics_session_id')::uuid
        else null::uuid
      end as session_id
    from public.contact_submissions as contacts
    where contacts.created_at >= p_start
      and contacts.created_at < p_end
  ),
  confirmed_contact_sessions as materialized (
    select
      contacts.session_id,
      min(contacts.created_at) as converted_at
    from confirmed_contacts as contacts
    join selected_sessions as sessions on sessions.id = contacts.session_id
    where contacts.session_id is not null
    group by contacts.session_id
  ),
  session_event_rollup as materialized (
    select
      sessions.id as session_id,
      count(events.id) as event_count,
      count(events.id) filter (
        where events.event_type = 'page_view' or events.name = 'page_view'
      ) as page_view_count
    from selected_sessions as sessions
    left join selected_events as events on events.session_id = sessions.id
    group by sessions.id
  ),
  days as (
    select generated.day::date as day
    from generate_series(
      (p_start at time zone 'UTC')::date,
      ((p_end - interval '1 microsecond') at time zone 'UTC')::date,
      interval '1 day'
    ) as generated(day)
  ),
  daily_sessions as (
    select
      (sessions.created_at at time zone 'UTC')::date as day,
      count(*) as sessions,
      count(distinct sessions.visitor_id) as visitors,
      count(*) filter (
        where sessions.active_seconds >= 10 or rollup.page_view_count >= 2
      ) as engaged_sessions,
      sum(sessions.active_seconds)::bigint as active_seconds
    from selected_sessions as sessions
    join session_event_rollup as rollup on rollup.session_id = sessions.id
    group by 1
  ),
  daily_events as (
    select
      (events.received_at at time zone 'UTC')::date as day,
      count(*) as events,
      count(*) filter (
        where events.event_type = 'page_view' or events.name = 'page_view'
      ) as page_views,
      count(*) filter (
        where events.event_type in (
          'click', 'download', 'outbound', 'form_start', 'form_submit',
          'form_error', 'portal_handoff', 'conversion', 'language_change'
        )
      ) as interactions,
      count(*) filter (
        where events.event_type = 'form_error' or events.name = 'form_failed'
      ) as errors
    from selected_events as events
    group by 1
  ),
  daily_telemetry as (
    select
      (telemetry.received_at at time zone 'UTC')::date as day,
      count(*) as events,
      count(*) filter (
        where telemetry.event_kind in ('client_error', 'server_error')
      ) as errors,
      count(*) filter (where telemetry.event_kind = 'web_vital') as web_vitals
    from selected_telemetry as telemetry
    group by 1
  ),
  daily_confirmed_contacts as (
    select
      (contacts.converted_at at time zone 'UTC')::date as day,
      count(*) as conversions
    from confirmed_contact_sessions as contacts
    group by 1
  ),
  top_pages as (
    select
      events.page_path,
      count(*) filter (
        where events.event_type = 'page_view' or events.name = 'page_view'
      ) as page_views,
      count(distinct events.session_id) as sessions
    from selected_events as events
    where events.page_path is not null
      and (events.event_type = 'page_view' or events.name = 'page_view')
    group by events.page_path
    order by page_views desc, sessions desc, events.page_path
    limit v_limit
  ),
  top_referrers as (
    select
      coalesce(nullif(sessions.referrer_host, ''), 'Direct') as referrer_host,
      nullif(sessions.referrer_path, '') as referrer_path,
      count(*) as sessions,
      count(distinct sessions.visitor_id) as visitors
    from selected_sessions as sessions
    group by 1, 2
    order by 3 desc, 4 desc, 1, 2
    limit v_limit
  ),
  countries as (
    select
      network.country_code,
      network.region,
      network.city,
      count(*) as sessions,
      count(distinct sessions.visitor_id) as visitors
    from selected_sessions as sessions
    join public.site_analytics_session_network as network
      on network.session_id = sessions.id
    where network.country_code is not null
    group by network.country_code, network.region, network.city
    order by 4 desc, 5 desc, 1, 2, 3
    limit v_limit
  ),
  devices as (
    select
      coalesce(nullif(sessions.device_type, ''), 'unknown') as device_type,
      coalesce(nullif(sessions.browser_name, ''), 'unknown') as browser_name,
      coalesce(nullif(sessions.os_name, ''), 'unknown') as os_name,
      count(*) as sessions,
      count(distinct sessions.visitor_id) as visitors
    from selected_sessions as sessions
    group by 1, 2, 3
    order by 4 desc, 5 desc, 1, 2, 3
    limit v_limit
  ),
  recent_sessions as (
    select sessions.*
    from selected_sessions as sessions
    order by sessions.last_seen_at desc, sessions.id
    limit v_limit
  ),
  recent_errors as (
    select
      events.id::text as id,
      events.session_id,
      events.occurred_at,
      events.event_type,
      events.name,
      events.page_path,
      events.section_id,
      events.target_label,
      events.metadata
    from selected_events as events
    where events.event_type = 'form_error' or events.name = 'form_failed'
    union all
    select
      'telemetry-' || telemetry.id::text,
      case
        when coalesce(telemetry.metadata ->> 'sessionId', '') ~*
          '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then (telemetry.metadata ->> 'sessionId')::uuid
        else null::uuid
      end,
      telemetry.received_at,
      telemetry.event_kind,
      telemetry.event_name,
      telemetry.page_path,
      telemetry.metadata ->> 'routeKind',
      telemetry.metadata ->> 'component',
      telemetry.metadata || jsonb_build_object('fingerprint', telemetry.event_id)
    from selected_telemetry as telemetry
    where telemetry.event_kind in ('client_error', 'server_error')
    order by occurred_at desc, id
    limit v_limit
  ),
  recent_admin_audit as (
    select audit.*
    from public.admin_audit_events as audit
    where audit.occurred_at >= p_start
      and audit.occurred_at < p_end
    order by audit.occurred_at desc, audit.id
    limit v_limit
  )
  select jsonb_build_object(
    'schemaVersion', '20260807130642',
    'window', jsonb_build_object(
      'start', p_start,
      'end', p_end
    ),
    'summary', jsonb_build_object(
      'totalSessions', (select count(*) from selected_sessions),
      'totalVisitors', (select count(distinct visitor_id) from selected_sessions),
      'returningSessions', (
        select count(*) from selected_sessions where is_returning
      ),
      'engagedSessions', (
        select count(*)
        from selected_sessions as sessions
        join session_event_rollup as rollup on rollup.session_id = sessions.id
        where sessions.active_seconds >= 10 or rollup.page_view_count >= 2
      ),
      'totalPageViews', (
        select count(*)
        from selected_events
        where event_type = 'page_view' or name = 'page_view'
      ),
      'totalEvents',
        (select count(*) from selected_events) + (select count(*) from selected_telemetry),
      'telemetryEvents', (select count(*) from selected_telemetry),
      'webVitalEvents', (
        select count(*) from selected_telemetry where event_kind = 'web_vital'
      ),
      'totalInteractions', (
        select count(*)
        from selected_events
        where event_type in (
          'click', 'download', 'outbound', 'form_start', 'form_submit',
          'form_error', 'portal_handoff', 'conversion', 'language_change'
        )
      ),
      'totalActiveSeconds', (
        select coalesce(sum(active_seconds), 0)::bigint from selected_sessions
      ),
      'averageActiveSeconds', (
        select coalesce(round(avg(active_seconds)::numeric, 1), 0) from selected_sessions
      ),
      'bounceRatePercent', (
        select coalesce(
          round(
            100.0 * count(*) filter (
              where sessions.active_seconds < 10 and rollup.page_view_count <= 1
            ) / nullif(count(*), 0),
            1
          ),
          0
        )
        from selected_sessions as sessions
        join session_event_rollup as rollup on rollup.session_id = sessions.id
      ),
      'conversions', (
        select count(*) from confirmed_contact_sessions
      ),
      'formSubmissions', (
        select count(*) from confirmed_contacts
      ),
      'portalHandoffs', (
        select count(*)
        from selected_events
        where event_type = 'portal_handoff' or name = 'portal_handoff'
      ),
      'errorEvents', (
        (select count(*)
         from selected_events
         where event_type = 'form_error' or name = 'form_failed')
        +
        (select count(*)
         from selected_telemetry
         where event_kind in ('client_error', 'server_error'))
      ),
      'uniqueCountries', (
        select count(distinct network.country_code)
        from selected_sessions as sessions
        join public.site_analytics_session_network as network
          on network.session_id = sessions.id
        where network.country_code is not null
      ),
      'latestEventAt', (
        select max(latest_at)
        from (
          select max(received_at) as latest_at from selected_events
          union all
          select max(received_at) as latest_at from selected_telemetry
        ) as latest_sources
      )
    ),
    'daily', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'date', days.day,
          'sessions', coalesce(daily_sessions.sessions, 0),
          'visitors', coalesce(daily_sessions.visitors, 0),
          'engagedSessions', coalesce(daily_sessions.engaged_sessions, 0),
          'pageViews', coalesce(daily_events.page_views, 0),
          'events', coalesce(daily_events.events, 0) + coalesce(daily_telemetry.events, 0),
          'interactions', coalesce(daily_events.interactions, 0),
          'conversions', coalesce(daily_confirmed_contacts.conversions, 0),
          'errors', coalesce(daily_events.errors, 0) + coalesce(daily_telemetry.errors, 0),
          'webVitals', coalesce(daily_telemetry.web_vitals, 0),
          'activeSeconds', coalesce(daily_sessions.active_seconds, 0)
        ) order by days.day
      )
      from days
      left join daily_sessions on daily_sessions.day = days.day
      left join daily_events on daily_events.day = days.day
      left join daily_telemetry on daily_telemetry.day = days.day
      left join daily_confirmed_contacts on daily_confirmed_contacts.day = days.day
    ), '[]'::jsonb),
    'topPages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'pagePath', top_pages.page_path,
          'pageViews', top_pages.page_views,
          'sessions', top_pages.sessions
        ) order by top_pages.page_views desc, top_pages.sessions desc, top_pages.page_path
      )
      from top_pages
    ), '[]'::jsonb),
    'topReferrers', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'host', top_referrers.referrer_host,
          'path', top_referrers.referrer_path,
          'sessions', top_referrers.sessions,
          'visitors', top_referrers.visitors
        ) order by top_referrers.sessions desc, top_referrers.visitors desc, top_referrers.referrer_host
      )
      from top_referrers
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'countryCode', countries.country_code,
          'region', countries.region,
          'city', countries.city,
          'sessions', countries.sessions,
          'visitors', countries.visitors
        ) order by countries.sessions desc, countries.visitors desc, countries.country_code
      )
      from countries
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'deviceType', devices.device_type,
          'browserName', devices.browser_name,
          'osName', devices.os_name,
          'sessions', devices.sessions,
          'visitors', devices.visitors
        ) order by devices.sessions desc, devices.visitors desc, devices.device_type
      )
      from devices
    ), '[]'::jsonb),
    'funnel', jsonb_build_array(
      jsonb_build_object(
        'step', 'session_started',
        'label', 'Sessions',
        'sessions', (select count(*) from selected_sessions)
      ),
      jsonb_build_object(
        'step', 'page_view',
        'label', 'Page viewed',
        'sessions', (
          select count(distinct session_id)
          from selected_events
          where event_type = 'page_view' or name = 'page_view'
        )
      ),
      jsonb_build_object(
        'step', 'engaged',
        'label', 'Engaged',
        'sessions', (
          select count(*)
          from selected_sessions as sessions
          join session_event_rollup as rollup on rollup.session_id = sessions.id
          where sessions.active_seconds >= 10 or rollup.page_view_count >= 2
        )
      ),
      jsonb_build_object(
        'step', 'form_start',
        'label', 'Form started',
        'sessions', (
          select count(distinct session_id)
          from selected_events
          where event_type = 'form_start' or name = 'form_started'
        )
      ),
      jsonb_build_object(
        'step', 'form_submit',
        'label', 'Submit attempted',
        'sessions', (
          select count(distinct session_id)
          from selected_events
          where event_type = 'form_submit' or name = 'form_submit_attempted'
        )
      ),
      jsonb_build_object(
        'step', 'contact_request',
        'label', 'Contact request confirmed',
        'sessions', (
          select count(*) from confirmed_contact_sessions
        )
      ),
      jsonb_build_object(
        'step', 'portal_handoff',
        'label', 'Portal handoff',
        'sessions', (
          select count(distinct session_id)
          from selected_events
          where event_type = 'portal_handoff' or name = 'portal_handoff'
        )
      )
    ),
    'recentSessions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', sessions.id,
          'visitorId', sessions.visitor_id,
          'consentVersion', sessions.consent_version,
          'startedAt', sessions.started_at,
          'lastSeenAt', sessions.last_seen_at,
          'endedAt', sessions.ended_at,
          'activeSeconds', sessions.active_seconds,
          'landingPath', sessions.landing_path,
          'exitPath', sessions.exit_path,
          'referrerHost', sessions.referrer_host,
          'referrerPath', sessions.referrer_path,
          'utmSource', sessions.utm_source,
          'utmMedium', sessions.utm_medium,
          'utmCampaign', sessions.utm_campaign,
          'utmContent', sessions.utm_content,
          'utmTerm', sessions.utm_term,
          'locale', sessions.locale,
          'timezone', sessions.timezone,
          'deviceType', sessions.device_type,
          'browserName', sessions.browser_name,
          'osName', sessions.os_name,
          'userAgent', sessions.user_agent,
          'isReturning', sessions.is_returning,
          'screenWidth', sessions.screen_width,
          'screenHeight', sessions.screen_height,
          'viewportWidth', sessions.viewport_width,
          'viewportHeight', sessions.viewport_height,
          'ipAddress', network.ip_address::text,
          'ipHash', network.ip_hash,
          'countryCode', network.country_code,
          'region', network.region,
          'city', network.city,
          'eventCount', coalesce(rollup.event_count, 0),
          'pageViewCount', coalesce(rollup.page_view_count, 0),
          'journey', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', journey_events.id,
                'occurredAt', journey_events.occurred_at,
                'eventType', journey_events.event_type,
                'name', journey_events.name,
                'pagePath', journey_events.page_path,
                'sectionId', journey_events.section_id,
                'targetLabel', journey_events.target_label,
                'value', journey_events.value,
                'durationMs', journey_events.duration_ms,
                'scrollDepth', journey_events.scroll_depth
              ) order by journey_events.occurred_at, journey_events.id
            )
            from (
              select events.*
              from selected_events as events
              where events.session_id = sessions.id
              order by events.occurred_at, events.id
              limit 40
            ) as journey_events
          ), '[]'::jsonb)
        ) order by sessions.last_seen_at desc, sessions.id
      )
      from recent_sessions as sessions
      left join public.site_analytics_session_network as network
        on network.session_id = sessions.id
      left join session_event_rollup as rollup
        on rollup.session_id = sessions.id
    ), '[]'::jsonb),
    'recentErrors', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', errors.id,
          'sessionId', errors.session_id,
          'occurredAt', errors.occurred_at,
          'eventType', errors.event_type,
          'name', errors.name,
          'pagePath', errors.page_path,
          'sectionId', errors.section_id,
          'targetLabel', errors.target_label,
          'fingerprint', errors.metadata ->> 'fingerprint',
          'metadata', errors.metadata
        ) order by errors.occurred_at desc, errors.id
      )
      from recent_errors as errors
    ), '[]'::jsonb),
    'recentAdminAudit', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', audit.id,
          'occurredAt', audit.occurred_at,
          'actorId', audit.actor_id,
          'actorEmailHash', audit.actor_email_hash,
          'action', audit.action,
          'outcome', audit.outcome,
          'authMethod', audit.auth_method,
          'targetType', audit.target_type,
          'targetId', audit.target_id,
          'ipAddress', audit.ip_address::text,
          'ipHash', audit.ip_hash,
          'userAgent', audit.user_agent,
          'requestId', audit.request_id,
          'details', audit.details
        ) order by audit.occurred_at desc, audit.id
      )
      from recent_admin_audit as audit
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_site_analytics_dashboard(timestamptz, timestamptz, integer)
from public, anon, authenticated;
grant execute on function public.get_site_analytics_dashboard(timestamptz, timestamptz, integer)
to service_role;

drop function if exists public.purge_site_analytics_data(integer, integer, integer, integer);
drop function if exists public.purge_site_analytics_data(integer, integer, integer, integer, integer);

create function public.purge_site_analytics_data(
  p_event_days integer default 90,
  p_session_days integer default 180,
  p_raw_ip_days integer default 30,
  p_audit_days integer default 365,
  p_admin_login_limit_days integer default 1
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_events_deleted bigint := 0;
  v_sessions_deleted bigint := 0;
  v_admin_audit_events_deleted bigint := 0;
  v_admin_login_rate_limits_deleted bigint := 0;
  v_network_ips_scrubbed bigint := 0;
  v_admin_ips_scrubbed bigint := 0;
  v_purged_at timestamptz := now();
begin
  if p_event_days is null
    or p_session_days is null
    or p_raw_ip_days is null
    or p_audit_days is null
    or p_admin_login_limit_days is null
    or p_event_days < 7
    or p_session_days < 30
    or p_session_days < p_event_days
    or p_raw_ip_days < 1
    or p_raw_ip_days > 90
    or p_audit_days < 30
    or p_admin_login_limit_days < 1
    or p_admin_login_limit_days > 30 then
    raise exception using
      errcode = '22023',
      message = 'Invalid analytics retention windows.';
  end if;

  delete from public.site_analytics_events
  where received_at < v_purged_at - make_interval(days => p_event_days);
  get diagnostics v_events_deleted = row_count;

  delete from public.site_analytics_sessions
  where last_seen_at < v_purged_at - make_interval(days => p_session_days);
  get diagnostics v_sessions_deleted = row_count;

  delete from public.admin_audit_events
  where occurred_at < v_purged_at - make_interval(days => p_audit_days);
  get diagnostics v_admin_audit_events_deleted = row_count;

  delete from public.admin_login_rate_limits
  where window_expires_at < v_purged_at - make_interval(days => p_admin_login_limit_days);
  get diagnostics v_admin_login_rate_limits_deleted = row_count;

  update public.site_analytics_session_network
  set
    ip_address = null,
    raw_ip_expires_at = null,
    raw_ip_purged_at = v_purged_at
  where ip_address is not null
    and least(
      coalesce(raw_ip_expires_at, 'infinity'::timestamptz),
      first_seen_at + make_interval(days => p_raw_ip_days)
    ) <= v_purged_at;
  get diagnostics v_network_ips_scrubbed = row_count;

  update public.admin_audit_events
  set
    ip_address = null,
    raw_ip_expires_at = null,
    raw_ip_purged_at = v_purged_at
  where ip_address is not null
    and least(
      coalesce(raw_ip_expires_at, 'infinity'::timestamptz),
      occurred_at + make_interval(days => p_raw_ip_days)
    ) <= v_purged_at;
  get diagnostics v_admin_ips_scrubbed = row_count;

  return jsonb_build_object(
    'purgedAt', v_purged_at,
    'eventsDeleted', v_events_deleted,
    'sessionsDeleted', v_sessions_deleted,
    'adminAuditEventsDeleted', v_admin_audit_events_deleted,
    'adminLoginRateLimitsDeleted', v_admin_login_rate_limits_deleted,
    'networkIpsScrubbed', v_network_ips_scrubbed,
    'adminIpsScrubbed', v_admin_ips_scrubbed
  );
end;
$$;

revoke all on function public.purge_site_analytics_data(integer, integer, integer, integer, integer)
from public, anon, authenticated;
grant execute on function public.purge_site_analytics_data(integer, integer, integer, integer, integer)
to service_role;

comment on table public.site_analytics_sessions is
  'Consent-gated website sessions. Ingestion and reads are service-role-only.';
comment on table public.site_analytics_session_network is
  'Server-derived session network context. Raw IPs are short-lived; hashes and coarse geography remain.';
comment on table public.site_analytics_events is
  'Bounded website interaction, conversion, performance, and error events.';
comment on table public.admin_audit_events is
  'Append-oriented administrator authentication and action audit trail.';
comment on table public.admin_login_rate_limits is
  'Short-lived HMAC-only fixed-window counters for temporary legacy administrator login protection.';
comment on function public.consume_admin_login_rate_limit(text, integer, integer) is
  'Atomically consumes one service-role-only legacy administrator login attempt without storing a raw network identity.';
comment on function public.store_site_analytics_batch(jsonb, jsonb, jsonb) is
  'Atomically upserts one consented session and its server-derived network context, then idempotently stores a bounded event batch.';
comment on function public.get_site_analytics_dashboard(timestamptz, timestamptz, integer) is
  'Returns bounded analytics, funnel, diagnostic, and administrator audit JSON for trusted dashboard routes.';
comment on function public.purge_site_analytics_data(integer, integer, integer, integer, integer) is
  'Deletes expired analytics/audit rows and irreversibly scrubs expired raw IP addresses.';
