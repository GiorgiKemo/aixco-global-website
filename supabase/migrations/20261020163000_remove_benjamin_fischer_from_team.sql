update public.site_content_entries
set payload = coalesce(
  (
    select jsonb_agg(member order by ordinality)
    from jsonb_array_elements(payload) with ordinality as members(member, ordinality)
    where member ->> 'name' <> 'Benjamin Fischer'
  ),
  '[]'::jsonb
)
where section = 'team'
  and entry_key = 'items'
  and jsonb_typeof(payload) = 'array';

do $$
begin
  if exists (
    select 1
    from public.site_content_entries
    where section = 'team'
      and entry_key = 'items'
      and payload @> '[{"name": "Benjamin Fischer"}]'::jsonb
  ) then
    raise exception 'Benjamin Fischer was not removed from team content';
  end if;
end
$$;
