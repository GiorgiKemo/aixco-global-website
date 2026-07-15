update public.site_content_entries
set payload = jsonb_set(
  payload,
  '{portals}',
  jsonb_build_object(
    'customerLogin', 'https://customer.aixco.global/',
    'brokerLogin', 'https://broker.aixco.global/',
    'developerLogin', 'https://developer.aixco.global/',
    'customerSignup', 'https://customer.aixco.global/',
    'brokerSignup', 'https://broker.aixco.global/',
    'developerSignup', 'https://developer.aixco.global/'
  ),
  true
)
where section = 'company'
  and entry_key = 'profile'
  and locale = 'en';

do $$
begin
  if not exists (
    select 1
    from public.site_content_entries
    where section = 'company'
      and entry_key = 'profile'
      and locale = 'en'
      and payload -> 'portals' = jsonb_build_object(
        'customerLogin', 'https://customer.aixco.global/',
        'brokerLogin', 'https://broker.aixco.global/',
        'developerLogin', 'https://developer.aixco.global/',
        'customerSignup', 'https://customer.aixco.global/',
        'brokerSignup', 'https://broker.aixco.global/',
        'developerSignup', 'https://developer.aixco.global/'
      )
  ) then
    raise exception 'AIXCO portal links were not updated';
  end if;
end
$$;
