drop policy if exists contact_submissions_insert_public on public.contact_submissions;
drop policy if exists chat_transcripts_insert_public on public.chat_transcripts;
drop policy if exists portal_click_events_insert_public on public.portal_click_events;

create policy contact_submissions_insert_public
on public.contact_submissions
for insert
to anon, authenticated
with check (
  source = 'contact_form'
  and status = 'new'
  and length(trim(name)) between 2 and 100
  and length(trim(message)) between 10 and 1500
  and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
);

create policy chat_transcripts_insert_public
on public.chat_transcripts
for insert
to anon, authenticated
with check (
  source = 'live_chat'
  and status = 'new'
  and jsonb_typeof(messages) = 'array'
  and message_count = jsonb_array_length(messages)
  and message_count between 1 and 200
  and length(trim(transcript)) between 1 and 10000
);

create policy portal_click_events_insert_public
on public.portal_click_events
for insert
to anon, authenticated
with check (
  source in ('access_modal', 'chat_widget')
  and mode in ('login', 'register')
  and length(trim(role_title)) between 2 and 120
  and length(trim(action)) between 2 and 120
  and portal_url ~ '^https://workw\.com/realestate/'
);

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
