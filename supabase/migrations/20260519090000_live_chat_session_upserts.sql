alter table public.chat_transcripts
add column if not exists session_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chat_transcripts_session_id_length'
      and conrelid = 'public.chat_transcripts'::regclass
  ) then
    alter table public.chat_transcripts
    add constraint chat_transcripts_session_id_length
    check (session_id is null or length(trim(session_id)) between 8 and 120);
  end if;
end $$;

create unique index if not exists chat_transcripts_session_id_idx
on public.chat_transcripts (session_id)
where session_id is not null;

drop policy if exists chat_transcripts_insert_public on public.chat_transcripts;

create policy chat_transcripts_insert_public
on public.chat_transcripts
for insert
to anon, authenticated
with check (
  source = 'live_chat'
  and status = 'new'
  and (session_id is null or length(trim(session_id)) between 8 and 120)
  and jsonb_typeof(messages) = 'array'
  and message_count = jsonb_array_length(messages)
  and message_count between 1 and 200
  and length(trim(transcript)) between 1 and 10000
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'chat_transcripts'
    ) then
    alter publication supabase_realtime add table public.chat_transcripts;
  end if;
end $$;

comment on column public.chat_transcripts.session_id is 'Stable anonymous visitor chat session id used to update one live transcript row per conversation.';
