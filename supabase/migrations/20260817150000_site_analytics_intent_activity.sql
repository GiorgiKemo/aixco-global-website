-- Expose consent-linked intent activity to the protected administrator dashboard.
-- Portal records remain operational data; their network context is joined from
-- the verified analytics session instead of being copied into the portal table.

drop function if exists public.get_site_analytics_intent_activity(timestamptz, timestamptz, integer);

create function public.get_site_analytics_intent_activity(
  p_start timestamptz,
  p_end timestamptz,
  p_limit integer default 200
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_limit integer;
begin
  if p_start is null or p_end is null or p_start >= p_end then
    raise exception using
      errcode = '22023',
      message = 'Intent activity window must have a non-null start before its end.';
  end if;

  if p_end - p_start > interval '731 days' then
    raise exception using
      errcode = '22023',
      message = 'Intent activity window cannot exceed 731 days.';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 500 then
    raise exception using
      errcode = '22023',
      message = 'Intent activity limit must be between 1 and 500.';
  end if;

  v_limit := p_limit;

  return (
    with
    selected_sessions as materialized (
      select sessions.*
      from public.site_analytics_sessions as sessions
      where sessions.created_at >= p_start
        and sessions.created_at < p_end
    ),
    selected_events as materialized (
      select events.*
      from public.site_analytics_events as events
      join selected_sessions as sessions on sessions.id = events.session_id
      where events.received_at >= p_start
        and events.received_at < p_end
        and events.name in (
          'whatsapp_click', 'phone_click', 'email_click',
          'download_requested', 'social_click', 'outbound_link'
        )
    ),
    portal_records as materialized (
      select
        portal.id,
        portal.created_at,
        portal.mode,
        portal.role_title,
        portal.action,
        portal.portal_url,
        portal.locale,
        portal.page_path,
        portal.user_agent,
        case
          when portal.metadata ->> 'analytics_session_verified' = 'true'
            and coalesce(portal.metadata ->> 'analytics_session_id', '') ~*
              '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then (portal.metadata ->> 'analytics_session_id')::uuid
          else null::uuid
        end as session_id
      from public.portal_click_events as portal
      where portal.created_at >= p_start
        and portal.created_at < p_end
    ),
    portal_activity as materialized (
      select
        portal.id,
        portal.created_at,
        portal.mode,
        portal.role_title,
        portal.action,
        portal.portal_url,
        portal.locale,
        portal.page_path,
        portal.user_agent,
        portal.session_id,
        sessions.visitor_id,
        network.ip_address,
        network.ip_hash,
        network.country_code,
        network.region,
        network.city
      from portal_records as portal
      left join public.site_analytics_sessions as sessions
        on sessions.id = portal.session_id
      left join public.site_analytics_session_network as network
        on network.session_id = portal.session_id
    ),
    intent_counts as (
      select
        events.name,
        count(*)::bigint as clicks,
        count(distinct events.session_id)::bigint as sessions,
        count(distinct selected.visitor_id)::bigint as visitors
      from selected_events as events
      join selected_sessions as selected on selected.id = events.session_id
      group by events.name
      union all
      select
        'portal_handoff'::text,
        count(*)::bigint,
        count(distinct portal.session_id)::bigint,
        count(distinct portal.visitor_id)::bigint
      from portal_activity as portal
    ),
    count_json as (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'name', counts.name,
          'clicks', counts.clicks,
          'sessions', counts.sessions,
          'visitors', counts.visitors
        ) order by counts.clicks desc, counts.name
      ), '[]'::jsonb) as value
      from intent_counts as counts
    ),
    portal_json as (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', portal.id,
          'occurredAt', portal.created_at,
          'name', 'portal_handoff',
          'mode', portal.mode,
          'roleTitle', portal.role_title,
          'action', portal.action,
          'portalUrl', portal.portal_url,
          'locale', portal.locale,
          'pagePath', portal.page_path,
          'sessionId', portal.session_id,
          'visitorId', portal.visitor_id,
          'countryCode', portal.country_code,
          'region', portal.region,
          'city', portal.city,
          'ipAddress', portal.ip_address,
          'ipHash', portal.ip_hash,
          'userAgent', portal.user_agent
        ) order by portal.created_at desc, portal.id desc
      ), '[]'::jsonb) as value
      from (
        select * from portal_activity
        order by created_at desc, id desc
        limit v_limit
      ) as portal
    ),
    whatsapp_json as (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', events.id,
          'occurredAt', events.occurred_at,
          'name', events.name,
          'targetLabel', events.target_label,
          'pagePath', events.page_path,
          'sectionId', events.section_id,
          'linkHost', events.metadata ->> 'linkHost',
          'linkPath', events.metadata ->> 'linkPath',
          'sessionId', events.session_id,
          'visitorId', selected.visitor_id,
          'countryCode', network.country_code,
          'region', network.region,
          'city', network.city,
          'ipAddress', network.ip_address,
          'ipHash', network.ip_hash
        ) order by events.occurred_at desc, events.id desc
      ), '[]'::jsonb) as value
      from (
        select events.*
        from selected_events as events
        where events.name = 'whatsapp_click'
        order by events.occurred_at desc, events.id desc
        limit v_limit
      ) as events
      join selected_sessions as selected on selected.id = events.session_id
      left join public.site_analytics_session_network as network
        on network.session_id = events.session_id
    )
    select jsonb_build_object(
      'schemaVersion', '20260817150000',
      'window', jsonb_build_object('start', p_start, 'end', p_end),
      'summary', jsonb_build_object(
        'totalIntentClicks', (
          (select coalesce(sum(counts.clicks), 0) from intent_counts as counts)
        ),
        'portalHandoffs', (
          select count(*) from portal_activity
        ),
        'whatsappClicks', (
          select count(*) from selected_events where name = 'whatsapp_click'
        ),
        'phoneClicks', (
          select count(*) from selected_events where name = 'phone_click'
        ),
        'emailClicks', (
          select count(*) from selected_events where name = 'email_click'
        ),
        'downloadRequests', (
          select count(*) from selected_events where name = 'download_requested'
        ),
        'socialClicks', (
          select count(*) from selected_events where name = 'social_click'
        ),
        'outboundLinks', (
          select count(*) from selected_events where name = 'outbound_link'
        )
      ),
      'counts', (select value from count_json),
      'portalHandoffs', (select value from portal_json),
      'whatsappClicks', (select value from whatsapp_json)
    )
  );
end;
$$;

revoke all on function public.get_site_analytics_intent_activity(timestamptz, timestamptz, integer)
from public, anon, authenticated;
grant execute on function public.get_site_analytics_intent_activity(timestamptz, timestamptz, integer)
to service_role;

comment on function public.get_site_analytics_intent_activity(timestamptz, timestamptz, integer)
is 'Returns consent-linked portal and WhatsApp intent activity for the protected administrator dashboard. Raw IPs inherit the existing short retention window.';
