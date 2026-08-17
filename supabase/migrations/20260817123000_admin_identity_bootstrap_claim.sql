-- Serialize the one temporary shared-password bootstrap invitation. Auth users
-- live outside the application schema, so a durable singleton claim prevents
-- parallel requests from both observing an empty administrator list.

create table if not exists public.admin_identity_bootstrap_claims (
  singleton boolean primary key default true check (singleton),
  claim_id uuid not null,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  completed_user_id uuid
);

alter table public.admin_identity_bootstrap_claims enable row level security;
alter table public.admin_identity_bootstrap_claims force row level security;
revoke all on table public.admin_identity_bootstrap_claims
from public, anon, authenticated;
grant select, insert, update, delete
on table public.admin_identity_bootstrap_claims
to service_role;

create or replace function public.claim_admin_identity_bootstrap(p_claim_id uuid)
returns boolean
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  acquired_claim_id uuid;
begin
  if p_claim_id is null then
    return false;
  end if;

  insert into public.admin_identity_bootstrap_claims (
    singleton,
    claim_id,
    claimed_at
  ) values (
    true,
    p_claim_id,
    now()
  )
  on conflict (singleton) do update
  set
    claim_id = excluded.claim_id,
    claimed_at = excluded.claimed_at
  where admin_identity_bootstrap_claims.completed_at is null
    and admin_identity_bootstrap_claims.claimed_at < now() - interval '15 minutes'
  returning claim_id into acquired_claim_id;

  return acquired_claim_id = p_claim_id;
end;
$$;

create or replace function public.release_admin_identity_bootstrap(
  p_claim_id uuid
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
begin
  delete from public.admin_identity_bootstrap_claims
  where singleton
    and claim_id = p_claim_id
    and completed_at is null;
  return found;
end;
$$;

create or replace function public.complete_admin_identity_bootstrap(
  p_claim_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
begin
  if p_claim_id is null or p_user_id is null then
    return false;
  end if;

  update public.admin_identity_bootstrap_claims
  set
    completed_at = now(),
    completed_user_id = p_user_id
  where singleton
    and claim_id = p_claim_id
    and completed_at is null;
  return found;
end;
$$;

revoke all on function public.claim_admin_identity_bootstrap(uuid)
from public, anon, authenticated;
revoke all on function public.release_admin_identity_bootstrap(uuid)
from public, anon, authenticated;
revoke all on function public.complete_admin_identity_bootstrap(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.claim_admin_identity_bootstrap(uuid)
to service_role;
grant execute on function public.release_admin_identity_bootstrap(uuid)
to service_role;
grant execute on function public.complete_admin_identity_bootstrap(uuid, uuid)
to service_role;

comment on table public.admin_identity_bootstrap_claims is
  'Singleton claim that serializes the temporary first named-admin invitation.';
comment on function public.claim_admin_identity_bootstrap(uuid) is
  'Atomically claims the first-admin bootstrap slot; an abandoned claim may be retried after 15 minutes.';
comment on function public.release_admin_identity_bootstrap(uuid) is
  'Releases a matching claim only before an external identity invitation is attempted.';
comment on function public.complete_admin_identity_bootstrap(uuid, uuid) is
  'Permanently closes the bootstrap slot after the first named admin role is assigned.';
