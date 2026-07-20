update public.site_content_entries as entry
set payload = jsonb_build_array(
  $$
  {
    "id": "guru",
    "url": "guru",
    "name": "Guru",
    "image": "batumi-guru",
    "video": "guruBatumi",
    "metrics": [
      { "label": "Floors", "value": "29", "subtext": "floors" },
      { "label": "Apartments", "value": "667", "subtext": "units" },
      { "label": "Sold", "value": "85%", "subtext": "apartments", "highlight": true }
    ],
    "summary": "Guru Status is in its final construction phase: a Batumi residence with 29 floors, 667 apartments, 85% sold, and a location about 150 meters from the sea.",
    "highlights": [
      { "label": "Scale", "value": "3,000 sqm of infrastructure area and 4,000 sqm total site area." },
      { "label": "Location", "value": "About 150 meters from the sea, with the beach 5 minutes away and Grand Mall 8 minutes away by car." },
      { "label": "Rental case", "value": "$600/month average long-term rent, $80/night average short-stay rent, 90% potential occupancy, and 12% ROI shown in the project deck." }
    ]
  }
  $$::jsonb,
  $$
  {
    "id": "current-project",
    "name": "Reverance",
    "url": "current-project",
    "image": "batumi-current-project",
    "video": "currentProject",
    "summary": "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for June 2028.",
    "metrics": [
      { "label": "Floors", "value": "17", "subtext": "per building" },
      { "label": "Apartments", "value": "408", "subtext": "total units" },
      { "label": "Completion", "value": "Jun 2028", "subtext": "target", "highlight": true }
    ],
    "highlights": [
      { "label": "Current availability", "value": "28 selected apartments on the 13th and 14th floors." },
      { "label": "Scale", "value": "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site." },
      { "label": "Location", "value": "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away." },
      { "label": "Rental case", "value": "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck." }
    ]
  }
  $$::jsonb
) || coalesce(
  (
    select jsonb_agg(existing.item order by existing.ordinality)
    from jsonb_array_elements(entry.payload) with ordinality as existing(item, ordinality)
    where coalesce(existing.item ->> 'id', '') not in ('guru', 'otium', 'current-project')
  ),
  '[]'::jsonb
)
where entry.section = 'batumi_properties'
  and entry.entry_key = 'items'
  and entry.locale = 'en';

do $$
begin
  if not exists (
    select 1
    from public.site_content_entries as entry
    where entry.section = 'batumi_properties'
      and entry.entry_key = 'items'
      and entry.locale = 'en'
      and jsonb_typeof(entry.payload) = 'array'
      and (
        select count(*)
        from jsonb_array_elements(entry.payload) as item
        where item ->> 'id' = 'guru'
      ) = 1
      and (
        select count(*)
        from jsonb_array_elements(entry.payload) as item
        where item ->> 'id' = 'current-project'
          and item ->> 'name' = 'Reverance'
          and item ->> 'url' = 'current-project'
          and item ->> 'image' = 'batumi-current-project'
          and item ->> 'video' = 'currentProject'
      ) = 1
      and entry.payload::text not ilike '%by Otium%'
  ) then
    raise exception 'Batumi property reconciliation did not apply cleanly';
  end if;
end
$$;
