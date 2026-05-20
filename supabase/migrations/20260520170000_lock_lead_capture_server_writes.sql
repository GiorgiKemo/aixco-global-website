drop policy if exists contact_submissions_insert_public on public.contact_submissions;
drop policy if exists chat_transcripts_insert_public on public.chat_transcripts;
drop policy if exists portal_click_events_insert_public on public.portal_click_events;

revoke insert on public.contact_submissions from anon, authenticated;
revoke insert on public.chat_transcripts from anon, authenticated;
revoke insert on public.portal_click_events from anon, authenticated;

grant all on public.contact_submissions to service_role;
grant all on public.chat_transcripts to service_role;
grant all on public.portal_click_events to service_role;

comment on table public.contact_submissions is
  'Contact form leads submitted through the AIXCO server API. Public direct inserts are blocked.';
comment on table public.chat_transcripts is
  'Visitor live-chat transcripts captured through the AIXCO server API. Public direct inserts are blocked.';
comment on table public.portal_click_events is
  'Portal handoff analytics captured through the AIXCO server API. Public direct inserts are blocked.';
