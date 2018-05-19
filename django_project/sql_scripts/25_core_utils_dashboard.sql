-- DASHBOARD RELATED FUNCTIONS

-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

create EXTENSION if not exists tablefunc;

-- *
-- * core_utils.get_core_dashboard_data
-- *

CREATE OR REPLACE FUNCTION core_utils.get_core_dashboard_data(VARIADIC i_attribute_keys character varying[])
  RETURNS SETOF record
STABLE
LANGUAGE plpgsql
AS $$
DECLARE l_query text;
        l_attribute_def text;
        l_attribute_values text;
BEGIN

-- attr_list: asd text, dsa text
-- attr_vals: ('asd'), ('dsa')

l_query:=format($kveri$
select
    string_agg(format('%%s text',field), ', ' order by field) as attr_list, -- asd text, dsa text
    'VALUES ' || string_agg(format('(%%L)',field), ', ' order by field) as attr_vals
from
    unnest(%L::varchar[]) as field;

$kveri$, i_attribute_keys ) ;

execute l_query into l_attribute_def, l_attribute_values;

l_query := format($OUTER_QUERY$
SELECT
	  ff.point_geometry
    , wu.email
	, chg.ts_created as ts
	, attrs.*
FROM
			crosstab(
				$INNER_QUERY$select
						ff.feature_uuid,
						aa.key as attribute_key,
					 case
						when aa.result_type = 'Integer' THEN fav.val_int::text
						when aa.result_type = 'Decimal' THEN fav.val_real::text
						when aa.result_type = 'Text' THEN fav.val_text::text
						when aa.result_type = 'DropDown' THEN ao.option
						ELSE null
					 end as val
				from
					features.feature ff
				JOIN
					features.feature_attribute_value fav
				ON
					ff.feature_uuid = fav.feature_uuid
				join
					attributes_attribute aa
				on
					fav.attribute_id = aa.id
				left JOIN
					 attributes_attributeoption ao
				ON
					fav.attribute_id = ao.attribute_id
				AND
						ao.value = val_int
				where
					 fav.is_active = True
				and
					 ff.is_active = True
			    and
			        aa.key = any(%L)
				order by 1,2
				$INNER_QUERY$, %L
			) as attrs (
                    feature_uuid uuid,
                     %s
			 )
JOIN
  features.feature ff
ON
	attrs.feature_uuid = ff.feature_uuid
JOIN
    features.changeset chg
ON
    ff.changeset_id = chg.id
JOIN
      webusers_webuser wu
ON
    chg.webuser_id = wu.id
where
		 ff.is_active = True
$OUTER_QUERY$, i_attribute_keys, l_attribute_values, l_attribute_def

);
        return Query execute l_query;
END;

$$;


-- *
-- * core_utils.create_dashboard_cache_table (active_data)
-- *

CREATE or replace function core_utils.create_dashboard_cache_table (i_table_name varchar) returns void as

$$
DECLARE
	l_query text;
	l_fields text;
	l_default_fields text;
    l_calculated_fields text;
BEGIN
    -- until otherwise needed leave hardcoded
	l_default_fields:='id serial, point_geometry geometry, email varchar, ts timestamp with time zone, feature_uuid uuid';
    l_calculated_fields='static_water_level_group_id float,amount_of_deposited_group_id float, yield_group_id float';

	l_query:=$fields$select
				string_agg((aa.key || ' ' ||
				case
					when aa.result_type = 'Integer' THEN 'int'
					when aa.result_type = 'Decimal' THEN 'float'
                ELSE
                    'text'
				end), ', ')
			from
				attributes_attribute aa$fields$;

		execute l_query into l_fields;

    l_query:='create table if not exists '|| i_table_name ||' (' ||  l_default_fields || ',' || l_fields || ',' || l_calculated_fields || ');';

	execute l_query;

END$$ LANGUAGE plpgsql;


-- *
-- * core_utils.get_attribute_field_build_query_string
-- *
CREATE OR REPLACE FUNCTION core_utils.get_attribute_field_build_query_string()
  RETURNS table (attribute_key_list text, attribute_values text, attribute_definition text, attribute_cast text )
STABLE
LANGUAGE sql
AS $$


    select
        '{' || string_agg(key, ',' ORDER BY key) || '}' as attribute_key_list,
        'VALUES ' || string_agg('(' || quote_literal(key) || ')', ',' ORDER BY key) as attribute_values,
        string_agg(key || ' ' || field_type, ', ' ORDER BY key) as attribute_definition,
	     string_agg('attrs.' ||key || '::'|| field_type , ' ,' ORDER BY key) as attribute_cast
    from (
        SELECT key,
             case
                when result_type = 'Integer' THEN 'int'
                when result_type = 'Decimal' THEN 'float'
                ELSE 'text'
             end as field_type
        FROM
            attributes_attribute aa
        ORDER BY
            key
    )d;
$$;

-- *
-- * core_utils.get_typed_core_dashboard_data
-- *
-- * used on initial load data and on upsert_active_data_row()

CREATE OR REPLACE FUNCTION core_utils.get_typed_core_dashboard_data(i_feature_uuid uuid DEFAULT NULL )
  RETURNS SETOF record
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
    l_query text;
    l_field_list text;
    l_attribute_values text;
    l_attribute_def TEXT;
    l_field_cast TEXT;
    l_feature_uuid text;
BEGIN

    EXECUTE $kveri$
            select
                attribute_key_list, attribute_values, attribute_definition, attribute_cast
            from
                core_utils.get_attribute_field_build_query_string()
        $kveri$
    INTO
        l_field_list, l_attribute_values,l_attribute_def, l_field_cast;

    l_feature_uuid:= '';
    if i_feature_uuid is not null THEN
        l_feature_uuid:= format('and ff.feature_uuid = %L::uuid',i_feature_uuid);
    END IF;

l_query := format($OUTER_QUERY$
    SELECT
        ff.point_geometry
        , wu.email
		, chg.ts_created as ts
		, ff.feature_uuid
		, %s
    FROM
        crosstab(
            $INNER_QUERY$
            select
                ff.feature_uuid,
                aa.key as attribute_key,
                case
                    when aa.result_type = 'Integer' THEN fav.val_int::text
                    when aa.result_type = 'Decimal' THEN fav.val_real::text
                    when aa.result_type = 'Text' THEN fav.val_text::text
                    when aa.result_type = 'DropDown' THEN ao.option
                    ELSE null
                end as val
            from
                features.feature ff
            JOIN
                features.feature_attribute_value fav
            ON
                ff.feature_uuid = fav.feature_uuid
            join
                attributes_attribute aa
            on
                fav.attribute_id = aa.id
            left JOIN
                 attributes_attributeoption ao
            ON
                fav.attribute_id = ao.attribute_id
            AND
                ao.value = val_int
            where
                 fav.is_active = True
            and
                 ff.is_active = True
            %s
            and
                aa.key = any(%L)
            order by 1,2
            $INNER_QUERY$, %L
        ) as attrs (
            feature_uuid uuid,
            %s
        )
    JOIN
      features.feature ff
    ON
        attrs.feature_uuid = ff.feature_uuid
    JOIN
        features.changeset chg
    ON
        ff.changeset_id = chg.id
    JOIN
          webusers_webuser wu
    ON
        chg.webuser_id = wu.id
    where
             ff.is_active = True
            %s
    $OUTER_QUERY$, l_field_cast, l_feature_uuid, l_field_list, l_attribute_values, l_attribute_def, l_feature_uuid
);
raise notice '%', l_query;
  return Query execute l_query;
END;

$$;



-- *
-- * core_utils.prepare_filtered_dashboard_data
-- *
-- * filters and prepares data in public.active_data for display on the dashboards
-- *

create or replace function core_utils.prepare_filtered_dashboard_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json default '{}'::json)
returns void
LANGUAGE plpgsql
AS $BODY$
declare
    l_query text;
    l_filter_query text;
    l_filter text;
    l_is_staff boolean;
    l_geofence geometry;
    l_woreda_predicate text;
    l_geofence_predicate text;
begin
    -- TODO handle ranges
-- {"tabiya":"Egub","fencing_exists":"No","funded_by":"FoodSecurity","water_committe_exist":"Unknown","static_water_level":4,"amount_of_deposited":4,"yield":5,"should_not_appeat":null}
    l_filter_query:= format($WHERE_FILTER$
    SELECT
        string_agg('and (' || same_filter_values || ')', ' ')
    from
    (
        SELECT distinct
            filter_key,
            string_agg(
                filter_key || '=' || quote_literal(filter_value) , ' or '
            ) over (partition by filter_key) as same_filter_values
        FROM (
            SELECT
                "key" as filter_key,
                json_array_elements_text("value"::json) as filter_value
            FROM
                json_each_text(%L::JSON)
        ) a
        where
            a.filter_value is not null
        group by
            filter_key,
            filter_value
    ) k
    $WHERE_FILTER$, i_filters);

    execute l_filter_query into l_filter;

    -- check if user has is_staff
    l_query := format('select is_staff OR is_readonly, geofence FROM webusers_webuser where id = %L', i_webuser_id);

    EXECUTE l_query INTO l_is_staff, l_geofence;

    IF l_is_staff = FALSE
    THEN
        l_woreda_predicate := format(' AND woreda IN (SELECT unnest(values) FROM webusers_grant WHERE webuser_id = %L)',
                                     i_webuser_id);
    ELSE
        l_woreda_predicate := NULL;
    END IF;

    -- geofence predicate
    IF l_geofence IS NOT NULL THEN
        l_geofence_predicate := format(' AND st_within(point_geometry, %L)', l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    -- create temporary table so the core_utils.get_core_dashboard_data is called only once
    -- filtering / aggregation / statistics should be taken from tmp_dashboard_chart_data
    l_query :=  format($TEMP_TABLE_QUERY$
        create temporary table if not exists tmp_dashboard_chart_data on commit drop as
            select
                *
            from
                public.active_data
            WHERE
                point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%s, %s), ST_Point(%s, %s)), 4326)
                %s %s %s
    $TEMP_TABLE_QUERY$, i_min_x, i_min_y, i_max_x, i_max_y,l_filter, l_woreda_predicate, l_geofence_predicate);

    execute l_query;
END;
$BODY$;

-- *
-- * core_utils.get_dashboard_chart_data
-- *
-- * Returns all needed data for dashboard page
-- *
-- *

create or replace function core_utils.filter_dashboard_chart_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json default '{}'::json) returns text
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
    -- TABIA COUNT
    select
        json_build_object(
            'tabiya', coalesce(jsonb_agg(tabiyaRow), '[]'::jsonb)
        )
    FROM
    (
        select
            tabiya as group,
            count(tabiya) as cnt,
            sum(beneficiaries::int) as beneficiaries
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            tabiya
        ORDER BY
            count(tabiya) DESC
    ) tabiyaRow
)::jsonb ||
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
        g.group as water_committe_exist,
        cnt
      from (
        SELECT UNNEST(ARRAY ['Yes', 'No', 'Unknown']) AS group
      ) g
      left join (
            select
                water_committe_exist as water_committe_exist,
                count(water_committe_exist) as cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                water_committe_exist
            ORDER BY
                cnt DESC
      ) d
      on d.water_committe_exist = g.group
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
          MIN(static_water_level::FLOAT) AS MIN,
          max(static_water_level::FLOAT) AS max,
          count(static_water_level::FLOAT) AS cnt,
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
                min(yield::float) AS min,
                max(yield::float) AS max,
                count(yield::float) AS cnt,
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


create or replace function core_utils.filter_dashboard_table_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json, i_limit integer, i_offset integer, i_order_text text, i_search_name text)
    RETURNS SETOF text
LANGUAGE plpgsql
AS $$
declare
    l_query text;
begin
    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);


    l_query := format($q$
    WITH user_active_data AS (
    SELECT
            email as _webuser,
            ts as _last_update,
            name as feature_name,
            feature_uuid,
            woreda,
            tabiya,
            kushet,
            yield,
            static_water_level
         FROM tmp_dashboard_chart_data attrs
    )

select (jsonb_build_object('data', (
        SELECT
            coalesce(jsonb_agg(row), '[]') AS data
        FROM (
            SELECT * from user_active_data
            %s
            %s
            LIMIT %s OFFSET %s
        ) row)
    ) || jsonb_build_object('recordsTotal', (
        Select count(*) from user_active_data)
    ) || jsonb_build_object('recordsFiltered', (
        Select count(*) from user_active_data %s)
    )
)::text
$q$, i_search_name, i_order_text, i_limit, i_offset, i_search_name);

    RETURN QUERY EXECUTE l_query;
end;
$$;


-- *
-- * core_utils.cluster_map_points
-- *
-- * calculate clusters of map points and return data for non cluster points
-- *


create or replace FUNCTION core_utils.cluster_map_points(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json, i_zoom integer, i_icon_size integer)
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
        kushet
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
        woreda
FROM
    tmp_clustered_map_data cl INNER JOIN (
        select center from tmp_clustered_map_data group by center having count(center) = 1) sp
    ON sp.center = cl.center) r

UNION
-- clustered points, count > 1

    select to_jsonb(r) as data
    from (
        select
            cp.count as count,
            ST_Y(cp.cl_point) as lat,
            ST_X(cp.cl_point) as lng
        FROM tmp_clustered_map_data cl INNER JOIN (
                select center, count(center), st_centroid(st_collect(point_geometry)) as cl_point from tmp_clustered_map_data group by center having count(center) > 1) cp ON cp.center = cl.center
    ) r
) mapRow
    $$;

    return QUERY EXECUTE l_query;

END;
$fun$;
