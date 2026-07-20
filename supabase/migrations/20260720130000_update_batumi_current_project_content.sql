update public.site_content_entries
set payload = $$[
  {
    "id": "current-project",
    "name": "Reverance",
    "url": "current-project",
    "image": "batumi-current-project",
    "video": "currentProject",
    "summary": "Reverance is a premium residential complex at 59 Adlia Street, planned with 17 floors per building, 408 apartments, and completion targeted for June 2028.",
    "metrics": [
      { "label": "Floors", "value": "17", "subtext": "per building" },
      { "label": "Apartments", "value": "408", "subtext": "total units" },
      { "label": "Completion", "value": "Jun 2028", "subtext": "target", "highlight": true }
    ],
    "highlights": [
      { "label": "Scale", "value": "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site." },
      { "label": "Location", "value": "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away." },
      { "label": "Rental case", "value": "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck." }
    ]
  }
]$$::jsonb
where section = 'batumi_properties'
  and entry_key = 'items'
  and locale = 'en';

do $$
begin
  if not exists (
    select 1
    from public.site_content_entries
    where section = 'batumi_properties'
      and entry_key = 'items'
      and locale = 'en'
      and payload #>> '{0,id}' = 'current-project'
      and payload #>> '{0,name}' = 'Reverance'
      and payload #>> '{0,url}' = 'current-project'
      and payload #>> '{0,image}' = 'batumi-current-project'
      and payload #>> '{0,video}' = 'currentProject'
      and payload #>> '{0,summary}' not ilike '%by Otium%'
  ) then
    raise exception 'Batumi current-project content migration did not apply cleanly';
  end if;
end
$$;
