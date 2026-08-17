-- Keep chat lead quality truthful, bind conversion links to server proof, and
-- make exact contact-subject deletion atomic. Free-text chat messages and
-- anonymous analytics sessions are deliberately not attributed to an email.

alter table public.chat_transcripts
  add column if not exists visitor_message_count integer not null default 0;

update public.chat_transcripts as chats
set visitor_message_count = (
  select count(*)::integer
  from jsonb_array_elements(chats.messages) as message
  where message ->> 'role' = 'visitor'
);

-- Repair legacy drift before adding invariants. The JSON array is the durable
-- source of truth for the stored transcript count.
update public.chat_transcripts
set message_count = jsonb_array_length(messages)
where message_count <> jsonb_array_length(messages);

update public.chat_transcripts
set
  status = 'archived',
  metadata = jsonb_set(metadata, '{auto_archived_greeting}', 'true'::jsonb, true)
where visitor_message_count = 0
  and status <> 'archived';

create or replace function public.derive_chat_quality_fields()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  derived_visitor_count integer;
begin
  new.message_count := jsonb_array_length(new.messages);
  select count(*)::integer
  into derived_visitor_count
  from jsonb_array_elements(new.messages) as message
  where message ->> 'role' = 'visitor';
  new.visitor_message_count := derived_visitor_count;

  if new.visitor_message_count = 0 then
    new.status := 'archived';
    new.metadata := jsonb_set(new.metadata, '{auto_archived_greeting}', 'true'::jsonb, true);
  elsif tg_op = 'UPDATE' and old.metadata -> 'auto_archived_greeting' = 'true'::jsonb then
    new.status := 'new';
    new.metadata := new.metadata - 'auto_archived_greeting';
  end if;
  return new;
end;
$$;

drop trigger if exists chat_transcripts_derive_quality_fields
on public.chat_transcripts;
create trigger chat_transcripts_derive_quality_fields
before insert or update of messages on public.chat_transcripts
for each row execute function public.derive_chat_quality_fields();

revoke all on function public.derive_chat_quality_fields()
from public, anon, authenticated;

alter table public.chat_transcripts
  drop constraint if exists chat_transcripts_visitor_message_count_check,
  add constraint chat_transcripts_visitor_message_count_check check (
    visitor_message_count >= 0
    and visitor_message_count <= message_count
  );

-- Historical lead metadata accepted a browser-provided analytics UUID without
-- proof that the browser owned that analytics session. It cannot be trusted for
-- conversion attribution or subject-access operations, so remove it once.
update public.contact_submissions
set metadata = metadata - 'analytics_session_id' - 'analytics_session_verified'
where metadata ->> 'analytics_session_id' is not null
  and metadata -> 'analytics_session_verified' is distinct from 'true'::jsonb;

update public.chat_transcripts
set metadata = metadata - 'analytics_session_id' - 'analytics_session_verified'
where metadata ->> 'analytics_session_id' is not null
  and metadata -> 'analytics_session_verified' is distinct from 'true'::jsonb;

create or replace function public.sanitize_lead_analytics_session_link()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  -- This keeps the migration backward-compatible with an older application
  -- release during deployment: unproved UUIDs are discarded rather than
  -- rejecting the entire lead write.
  if new.metadata ->> 'analytics_session_id' is not null
    and new.metadata -> 'analytics_session_verified' is distinct from 'true'::jsonb then
    new.metadata := new.metadata - 'analytics_session_id' - 'analytics_session_verified';
  end if;
  return new;
end;
$$;

drop trigger if exists contact_submissions_sanitize_analytics_link
on public.contact_submissions;
create trigger contact_submissions_sanitize_analytics_link
before insert or update of metadata on public.contact_submissions
for each row execute function public.sanitize_lead_analytics_session_link();

drop trigger if exists chat_transcripts_sanitize_analytics_link
on public.chat_transcripts;
create trigger chat_transcripts_sanitize_analytics_link
before insert or update of metadata on public.chat_transcripts
for each row execute function public.sanitize_lead_analytics_session_link();

revoke all on function public.sanitize_lead_analytics_session_link()
from public, anon, authenticated;

alter table public.contact_submissions
  drop constraint if exists contact_submissions_analytics_session_proof_check,
  add constraint contact_submissions_analytics_session_proof_check check (
    metadata ->> 'analytics_session_id' is null
    or (
      metadata -> 'analytics_session_verified' = 'true'::jsonb
      and metadata ->> 'analytics_session_id' ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  );

alter table public.chat_transcripts
  drop constraint if exists chat_transcripts_analytics_session_proof_check,
  add constraint chat_transcripts_analytics_session_proof_check check (
    metadata ->> 'analytics_session_id' is null
    or (
      metadata -> 'analytics_session_verified' = 'true'::jsonb
      and metadata ->> 'analytics_session_id' ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  );

drop function if exists public.delete_contact_subject_data(text, text);

create function public.delete_contact_subject_data(
  p_email text,
  p_recipient_hash text
)
returns table (
  contacts_deleted bigint,
  chats_deleted bigint,
  abuse_attempts_deleted bigint,
  analytics_sessions_deleted bigint
)
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email is null
    or length(normalized_email) > 255
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid subject email is required.';
  end if;

  if p_recipient_hash is null or p_recipient_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'A valid subject recipient hash is required.';
  end if;

  -- Anonymous analytics sessions are not exclusively attributable to an email
  -- address: one browser session can submit more than one subject address.
  -- Email-based erasure must therefore never delete or disclose that session.
  analytics_sessions_deleted := 0;

  delete from public.contact_submissions
  where email_normalized = normalized_email;
  get diagnostics contacts_deleted = row_count;

  -- A free-text email mention does not prove who a chat belongs to. Keep chats
  -- out of automated email-based erasure until a verified structured subject
  -- field exists in the product.
  chats_deleted := 0;

  delete from public.lead_capture_attempts
  where resource = 'contact'
    and recipient_hash = p_recipient_hash;
  get diagnostics abuse_attempts_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.delete_contact_subject_data(text, text)
from public, anon, authenticated;
grant execute on function public.delete_contact_subject_data(text, text)
to service_role;

comment on column public.chat_transcripts.visitor_message_count is
  'Count of visitor-authored messages; zero-message greeting sessions are not actionable leads.';
comment on function public.derive_chat_quality_fields() is
  'Derives message and visitor counts, archives greetings, and safely reopens an auto-archived chat when a visitor participates.';
comment on function public.sanitize_lead_analytics_session_link() is
  'Discards client-asserted analytics UUIDs unless the server verified a matching HMAC proof.';
comment on function public.delete_contact_subject_data(text, text) is
  'Atomically deletes exact-match contact subject and abuse-control records; free-text chats and anonymous analytics are not attributed to an email subject.';
