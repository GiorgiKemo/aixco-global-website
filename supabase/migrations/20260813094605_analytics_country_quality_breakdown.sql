create or replace function public.get_site_analytics_country_breakdown(
  p_start timestamptz default (now() - interval '30 days'),
  p_end timestamptz default now(),
  p_limit integer default 20
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
      message = 'Analytics country window must have a non-null start before its end.';
  end if;

  if p_end - p_start > interval '731 days' then
    raise exception using
      errcode = '22023',
      message = 'Analytics country window cannot exceed 731 days.';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception using
      errcode = '22023',
      message = 'Analytics country limit must be between 1 and 100.';
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
    session_event_rollup as materialized (
      select
        sessions.id as session_id,
        count(events.id) as event_count,
        count(events.id) filter (
          where events.event_type = 'page_view' or events.name = 'page_view'
        ) as page_view_count
      from selected_sessions as sessions
      left join public.site_analytics_events as events
        on events.session_id = sessions.id
       and events.received_at >= p_start
       and events.received_at < p_end
      group by sessions.id
    ),
    country_rows as (
      select
        network.country_code,
        count(*) as sessions,
        count(distinct sessions.visitor_id) as visitors,
        count(*) filter (
          where sessions.active_seconds >= 10 or rollup.page_view_count >= 2
        ) as engaged_sessions,
        count(distinct sessions.visitor_id) filter (
          where sessions.active_seconds >= 10 or rollup.page_view_count >= 2
        ) as engaged_visitors,
        count(*) filter (
          where sessions.active_seconds < 10 and rollup.page_view_count <= 1
        ) as brief_sessions,
        count(*) filter (
          where lower(coalesce(sessions.referrer_host, '')) in ('localhost', '127.0.0.1', '::1')
             or sessions.landing_page_path like '%codex-production-smoke%'
             or lower(coalesce(sessions.user_agent, '')) ~
                '(playwright|headless|lighthouse|googlebot|bingbot|crawler|spider)'
             or host(network.ip_address) in ('127.0.0.1', '::1')
        ) as local_or_qa_sessions
      from selected_sessions as sessions
      join session_event_rollup as rollup on rollup.session_id = sessions.id
      join public.site_analytics_session_network as network
        on network.session_id = sessions.id
      where network.country_code is not null
      group by network.country_code
      order by engaged_visitors desc, visitors desc, sessions desc, network.country_code
      limit v_limit
    )
    select jsonb_build_object(
      'schemaVersion', '20260813094605',
      'window', jsonb_build_object('start', p_start, 'end', p_end),
      'countries', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'countryCode', countries.country_code,
            'sessions', countries.sessions,
            'visitors', countries.visitors,
            'engagedSessions', countries.engaged_sessions,
            'engagedVisitors', countries.engaged_visitors,
            'briefSessions', countries.brief_sessions,
            'localOrQaSessions', countries.local_or_qa_sessions
          ) order by
            countries.engaged_visitors desc,
            countries.visitors desc,
            countries.sessions desc,
            countries.country_code
        )
        from country_rows as countries
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.get_site_analytics_country_breakdown(
  timestamptz,
  timestamptz,
  integer
) from public, anon, authenticated;

grant execute on function public.get_site_analytics_country_breakdown(
  timestamptz,
  timestamptz,
  integer
) to service_role;

comment on function public.get_site_analytics_country_breakdown(
  timestamptz,
  timestamptz,
  integer
) is 'Returns country-grain first-party analytics with visitor, engagement, and review signals for the admin dashboard.';
