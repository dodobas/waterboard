-- DASHBOARD RELATED FUNCTIONS

/*
Generate where clause predicates from json definition - i_filters
Handles two types of predicates:
- column / value - tabiya='Adi-Zata'
- text search predicate

SAMPLE CALL:

select * from core_utils._build_where_clause_predicates(
    '{"tabiya": ["Sero", "Laelay-Mgarya-Tsemri", "Adi-Zata"], "woreda": ["Ahferom", "Adwa", "Merebleke"], "funded_by": ["Wash", "Rest"]}'::json
);
RESULT:
    and (tabiya='Adi-Zata' or tabiya='Sero' or tabiya='Laelay-Mgarya-Tsemri') and (woreda='Adwa' or woreda='Merebleke' or woreda='Ahferom') and (funded_by='Wash' or funded_by='Rest')
*/
create or replace function core_utils._build_dashboard_filter_data_where_clause_predicates(
    i_filters json default '{}'::json
)
returns text
LANGUAGE sql
AS $BODY$

SELECT
        string_agg('and (' || same_filter_values || ')', ' ')
    from
    (
        SELECT distinct
            filter_key,
            case when
                filter_key = 'tableSearch'
            then
                $k$zone ||' '||woreda||' '||tabiya||' '||kushet||' '||name||' '||unique_id ILIKE '%$k$ || filter_value || $k$%'$k$
            else
                string_agg(
                    filter_key || '=' || quote_literal(filter_value) , ' or '
                ) over (partition by filter_key)
            end as same_filter_values
        FROM (
            SELECT
                "key" as filter_key,
                json_array_elements_text("value"::json) as filter_value
            FROM
                json_each_text($1::JSON)
        ) a
        where
            a.filter_value is not null
--         and
--             filter_key != 'tableSearch'
        group by
            filter_key,
            filter_value
    ) k;

$BODY$;



-- *
-- * Create Temporary table based on filters and user
-- * core_utils.prepare_filtered_dashboard_data
-- *
-- * filters and prepares data in public.active_data for display on the dashboards
-- *

create or replace function core_utils.prepare_filtered_dashboard_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision,
    i_filters json default '{}'::json
)
returns void
LANGUAGE plpgsql
AS $BODY$
declare
    l_query text;
    l_filter text;
    l_woreda_geofence_predicate text;
    l_geometry_predicate text;

begin

    -- build query filters from dashboard filter values
    Select
        * into l_filter
    from
        core_utils._build_dashboard_filter_data_where_clause_predicates(i_filters);

    -- build woreda - geofence predicates
    select
        * into l_woreda_geofence_predicate
    from
        core_utils._build_dashboard_filter_woreda_geofence_where_clause_predicates(i_webuser_id);

    IF i_min_x is not null AND i_max_x is not null AND i_min_y is not null AND i_max_y is not null THEN
        l_geometry_predicate := format($QUERY$
            point_geometry && ST_SetSRID(ST_MakeBox2D(
                ST_Point(%s, %s),
                ST_Point(%s, %s)
             ), 4326)
        $QUERY$, i_min_x, i_min_y, i_max_x, i_max_y);
    ELSE
        l_geometry_predicate := '1=1';
    END IF;
    -- create temporary table so core_utils.get_core_dashboard_data is called only once
    -- filtering / aggregation / statistics should be taken from tmp_dashboard_chart_data
    l_query :=  format($QUERY$
        create temporary table if not exists tmp_dashboard_chart_data on commit drop as
            select
                *
            from
                %s -- active_data
            WHERE
                %s
                %s
                %s
    $QUERY$,
                core_utils.const_table_active_data(),
                l_geometry_predicate,
                l_filter,
                l_woreda_geofence_predicate
    );

    execute l_query;
END;
$BODY$;


-- *
-- * core_utils.get_dashboard_chart_data
-- *
-- * Returns all needed data for dashboard page
-- *
-- *

create or replace function core_utils.filter_dashboard_chart_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision,
    i_filters json default '{}'::json
) returns text
LANGUAGE plpgsql
AS $$
declare
    l_query text;
    l_result text;
begin
    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);

    l_query := $CHART_QUERY$
select (
(
        -- Woreda COUNT
        select
            json_build_object(
                'woreda', coalesce(jsonb_agg(woredaRow), '[]'::jsonb)
            )
        FROM
        (
            select
                woreda as group,
                count(woreda) as cnt,
                sum(beneficiaries::int) as beneficiaries
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                woreda
            ORDER BY
                count(woreda) DESC
        ) woredaRow
)::jsonb || (
-- beneficiaries stats
    select
        jsonb_build_object(
            'datastats', coalesce(row_to_json(dataRow.*), '{}')::jsonb
        )
        FROM (
            select
                sum(beneficiaries)        as total_beneficiaries,
                min(beneficiaries)        as min_beneficiaries,
                avg(beneficiaries) :: int as avg_beneficiaries,
                max(beneficiaries)        as max_beneficiaries,
                sum(cnt)                  as total_features,
                min(cnt)                  as min_features,
                avg(cnt) :: int           as avg_features,
                max(cnt)                  as max_features
            FROM (
                SELECT count(*) as cnt, sum(beneficiaries) as beneficiaries
                FROM tmp_dashboard_chart_data
                GROUP BY woreda, tabiya
            ) as grouped
    ) as dataRow
)::jsonb || (
-- scheme_type stats
    select jsonb_build_object(
         'schemetype_stats', coalesce(
            (select jsonb_object_agg(option, row_to_json(scheme_type_agg.*))
            FROM (
                WITH aggregate AS (
                    select scheme_type as option, count(scheme_type) as total_features, sum(beneficiaries) as total_beneficiaries
                    from tmp_dashboard_chart_data
                    group by scheme_type
                )
                SELECT aao.option, total_features, total_beneficiaries
                FROM attributes_attributeoption aao
                LEFT JOIN aggregate ON aao.option = aggregate.option

                WHERE attribute_id = (SELECT id from attributes_attribute where key = 'scheme_type')
                ORDER BY total_beneficiaries DESC nulls last
            ) as scheme_type_agg), '{}')
    )
)::jsonb || (
-- TABIA COUNT
    select
        json_build_object(
            'tabiya', coalesce(jsonb_agg(tabiyaRow), '[]'::jsonb)
        )
    FROM
    (
        select
            tabiya as "group",
            count(tabiya) as cnt,
            sum(beneficiaries::int) as beneficiaries
        FROM
            tmp_dashboard_chart_data
        group by
          woreda,
          tabiya
        order by
          cnt desc
    ) tabiyaRow
    )::jsonb
|| (


    -- FUNDED BY COUNT
    select
        json_build_object(
            'fundedBy', coalesce(jsonb_agg(fundedRow), '[]'::jsonb)
        )
    FROM
    (
        select
            funded_by as group,
            count(funded_by) as cnt
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            funded_by
        ORDER BY
            count(funded_by) DESC
    ) fundedRow

)::jsonb || (

    -- FENCING COUNT DATA (YES, NO, UNKNOWN)
   select
    json_build_object(
        'fencing', coalesce(jsonb_agg(fencingRow), '[]'::jsonb)
    )
    FROM
    (

      select
        g.group as fencing,
        cnt
      from (
        SELECT UNNEST(ARRAY ['Yes', 'No', 'Unknown']) AS group
      ) g
      left join (
            select
                fencing_exists as fencing,
                count(fencing_exists) as cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                fencing
            ORDER BY
                cnt DESC
      ) d
      on d.fencing = g.group
    ) fencingRow

)::jsonb || (

    -- WATER COMITEE COUNT DATA (YES, NO, UNKNOWN)
    select
        json_build_object(
            'waterCommitee', coalesce(jsonb_agg(waterRow), '[]'::jsonb)
        )
    FROM
    (

      select
        g.group as water_committee_exists,
        cnt
      from (
        SELECT UNNEST(ARRAY ['Yes', 'No', 'Unknown']) AS group
      ) g
      left join (
            select
                water_committee_exists as water_committee_exists,
                count(water_committee_exists) as cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                water_committee_exists
            ORDER BY
                cnt DESC
      ) d
      on d.water_committee_exists = g.group
    ) waterRow


)::jsonb || (

    -- FUNCTIONING COUNT, AND FEATURES PER GROUP LIST (marker coloring)
    select json_build_object(
        'functioning',  coalesce(jsonb_agg(func), '[]'::jsonb)
    )
    FROM
    (
        SELECT
            jsonb_build_object(
                'group', functioning,
                'cnt', count(functioning)
            ) as func
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            functioning
    ) d


)::jsonb || (

    -- AMOUNT OF DEPOSITED DATA
select json_build_object(
    'amountOfDeposited', chartData.amount_of_deposited_data
)
FROM
(
      select
               jsonb_agg(jsonb_build_object(
                 'group_id', group_data.key::int,
                 'group_def',group_data.value::json,
                 'cnt', d.cnt,
                 'min', d.min,
                 'max', d.max
             )) as  amount_of_deposited_data
            from
                json_each_text($GROUP_DEFINITION${
                    "5": {"label": ">= 5000", "group_id": 5},
                    "4": {"label": ">= 3000 and < 5000", "group_id": 4},
                    "3": {"label": ">= 500 and < 3000", "group_id": 3},
                    "2": {"label": "> 1  and < 500", "group_id": 2},
                    "1": {"label": "=< 1", "group_id": 1}
                }$GROUP_DEFINITION$::json
              ) as group_data
        LEFT JOIN (

            SELECT
                min(amount_of_deposited) AS min,
                max(amount_of_deposited) AS max,
                count(amount_of_deposited) AS cnt,
                amount_of_deposited_group_id
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                amount_of_deposited_group_id
            ORDER BY
                amount_of_deposited_group_id DESC
          ) d
        ON
           group_data.key::int = d.amount_of_deposited_group_id
) chartData

)::jsonb || (


    -- STATIC WATER LEVEL
select json_build_object(
  'staticWaterLevel', chartData.static_water_level_data
)
FROM
(
select
    jsonb_agg(jsonb_build_object(
        'group_id', group_data.key::int,
        'group_def',group_data.value::json,
        'cnt', d.cnt,
        'min', d.min,
        'max', d.max
      )) as static_water_level_data
FROM
    json_each_text($GROUP_DEFINITION${
        "5": {"label": ">= 100", "group_id": 5},
        "4": {"label": ">= 50 and < 100", "group_id": 4},
        "3": {"label": ">= 20 and < 50", "group_id": 3},
        "2": {"label": "> 10  and < 20", "group_id": 2},
        "1": {"label": "<= 10", "group_id": 1}
    }$GROUP_DEFINITION$::json) as  group_data
LEFT JOIN (
    SELECT
          MIN(static_water_level) AS MIN,
          max(static_water_level) AS max,
          count(static_water_level) AS cnt,
          static_water_level_group_id
    FROM
            tmp_dashboard_chart_data
      GROUP BY
              static_water_level_group_id
      ORDER BY
        static_water_level_group_id DESC
) d
ON
    group_data.key::int = d.static_water_level_group_id

) chartData

)::jsonb || (

    -- YIELD DATA
select json_build_object(
    'yield', chartData.yieldData
)
FROM
(
        select
          jsonb_agg(
             jsonb_build_object(
                 'group_id', group_data.key::int,
                 'group_def',group_data.value::json,
                 'cnt', d.cnt,
                 'min', d.min,
                 'max', d.max
             )
         ) AS yieldData
        from
            json_each_text($GROUP_DEFINITION${
                "5": {"label": ">= 6", "group_id": 5},
                "4": {"label": ">= 3 and < 6", "group_id": 4},
                "3": {"label": ">= 1 and < 3", "group_id": 3},
                "2": {"label": "> 0  and < 1", "group_id": 2},
                "1": {"label": "No Data", "group_id": 1}
            }$GROUP_DEFINITION$::json
        ) as group_data

      LEFT JOIN (

          SELECT
                min(yield) AS min,
                max(yield) AS max,
                count(yield) AS cnt,
                yield_group_id
              FROM
                  tmp_dashboard_chart_data
            GROUP BY
              yield_group_id
            ORDER BY
              yield_group_id DESC
      ) d
      ON
         group_data.key::int = d.yield_group_id
) chartData
)::jsonb

)::text;$CHART_QUERY$;

    execute l_query into l_result;

    return l_result;
end;
$$;

-- *
-- * core_utils.filter_dashboard_table_data
-- *
-- * used prepared temporary table for datatables on the dashboard page
-- *


create or replace function core_utils.filter_dashboard_table_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision,
    i_filters json,
    i_limit integer,
    i_offset integer,
    i_order_text text
)
    RETURNS SETOF text
LANGUAGE plpgsql STABLE
AS $$
declare
    l_query text;
begin
    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);

-- core_utils.const_table_active_data()
    l_query := format($q$
    WITH user_active_data AS (
    SELECT
            email as _webuser,
            ts as _last_update,
            name,
            feature_uuid,
            zone,
            woreda,
            tabiya,
            kushet,
            yield,
            static_water_level,
            unique_id
         FROM tmp_dashboard_chart_data attrs
    )

select (jsonb_build_object('data', (
        SELECT
            coalesce(jsonb_agg(row), '[]') AS data
        FROM (
            SELECT * from user_active_data
            %s
            LIMIT %s OFFSET %s
        ) row)
    ) || jsonb_build_object('recordsTotal', (
            Select count(*) from %s
        )
    ) || jsonb_build_object('recordsFiltered', (
        Select count(*) from user_active_data)
    )
)::text
$q$, i_order_text, i_limit, i_offset, core_utils.const_table_active_data());

    RETURN QUERY EXECUTE l_query;
end;
$$;


-- *
-- * core_utils.cluster_map_points
-- *
-- * calculate clusters of map points and return data for non cluster points
-- *


create or replace FUNCTION core_utils.cluster_map_points(
    i_webuser_id integer, i_min_x double precision, i_min_y double precision,
    i_max_x double precision, i_max_y double precision, i_filters json, i_zoom integer,
    i_icon_size integer
)
  RETURNS SETOF text
LANGUAGE plpgsql
AS $fun$
DECLARE
    l_query text;
BEGIN

    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);

    execute format($$
    create temporary table if not exists tmp_clustered_map_data on commit drop AS
    SELECT
        feature_uuid,
        point_geometry,
        core_utils.get_cluster(%s, %s, %s, %s, point_geometry) as center,
        name,
        yield,
        static_water_level,
        functioning,
        tabiya,
        woreda,
        kushet,
        unique_id
    FROM tmp_dashboard_chart_data
$$, i_zoom, i_icon_size, i_min_x, i_min_y);

    l_query := $$
    select jsonb_agg(mapRow.data)::text
    FROM (

-- non clustered points, count = 1

    select to_jsonb(r) as data FROM (
    select
        name,
        feature_uuid,
        ST_Y(point_geometry) as lat,
        ST_X(point_geometry) as lng,
        yield,
        functioning,
        static_water_level,
        tabiya,
        kushet,
        woreda,
        unique_id
FROM
    tmp_clustered_map_data cl INNER JOIN (
        select center from tmp_clustered_map_data group by center having count(center) = 1) sp
    ON sp.center = cl.center) r

UNION
-- clustered points, count > 1

    select
        to_jsonb(r) as data
    from (
        select
            cp.count as count,
            ST_Y(cp.cl_point) as lat,
            ST_X(cp.cl_point) as lng
        FROM
            tmp_clustered_map_data cl INNER JOIN (
                select
                    center,
                    count(center),
                     st_centroid(st_collect(point_geometry)) as cl_point
                from
                    tmp_clustered_map_data
                group by
                    center
                having
                   count(center) > 1
            ) cp ON cp.center = cl.center
    ) r
) mapRow
    $$;

    return QUERY EXECUTE l_query;

END;
$fun$;
