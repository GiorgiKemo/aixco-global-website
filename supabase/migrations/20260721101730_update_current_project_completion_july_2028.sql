update public.site_content_entries as entry
set payload = (
  select jsonb_agg(
    case
      when property.item ->> 'id' = 'current-project' then
        jsonb_set(
          jsonb_set(
            property.item,
            '{summary}',
            to_jsonb(
              $$Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.$$::text
            ),
            false
          ),
          '{metrics}',
          (
            select jsonb_agg(
              case
                when metric.item ->> 'label' = 'Completion'
                  then metric.item || jsonb_build_object('value', 'Jul 2028')
                else metric.item
              end
              order by metric.ordinality
            )
            from jsonb_array_elements(property.item -> 'metrics')
              with ordinality as metric(item, ordinality)
          ),
          false
        )
      else property.item
    end
    order by property.ordinality
  )
  from jsonb_array_elements(entry.payload)
    with ordinality as property(item, ordinality)
)
where entry.section = 'batumi_properties'
  and entry.entry_key = 'items'
  and entry.locale = 'en'
  and jsonb_typeof(entry.payload) = 'array';

do $verify$
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
        from jsonb_array_elements(entry.payload) as property(item)
        where property.item ->> 'id' = 'current-project'
          and property.item ->> 'summary' = $$Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.$$
          and (
            select count(*)
            from jsonb_array_elements(property.item -> 'metrics') as metric(item)
            where metric.item ->> 'label' = 'Completion'
              and metric.item ->> 'value' = 'Jul 2028'
          ) = 1
      ) = 1
  ) then
    raise exception 'Current-project completion date update did not apply cleanly';
  end if;
end
$verify$;
