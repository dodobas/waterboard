-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

create EXTENSION if not exists tablefunc;

-- *
-- * core_utils.get_core_dashboard_data
-- *

CREATE OR REPLACE FUNCTION core_utils.get_core_dashboard_data(VARIADIC i_attributes character varying[])
  RETURNS SETOF record
STABLE
LANGUAGE plpgsql
AS $$
DECLARE l_query text;
        l_attribute_list text;
        l_attribute_values text;
BEGIN

l_query := 'select
      string_agg(format(''%s text'',field), '', '' order by field)
  from
            unnest('''|| i_attributes::text ||'''::varchar[]) as field
';

execute l_query into l_attribute_list;

l_query := 'select
      string_agg(format(''(%L)'',field), '', '' order by field)
  from
            unnest('''|| i_attributes::text ||'''::varchar[]) as field
';

execute l_query into l_attribute_values;

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
				$INNER_QUERY$, $VALUES$VALUES %s $VALUES$
			) as attrs (
                    feature_uuid uuid, %s
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
$OUTER_QUERY$, i_attributes, l_attribute_values, l_attribute_list

);
        return Query execute l_query;
END;

$$;



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
    l_filter_query text;
    l_filter text;
    l_is_staff boolean;
    l_geofence geometry;
    l_tabiya_predicate text;
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
          json_each_text(
              '%s'::JSON
          )
    ) a
  where a.filter_value is not null
    group by
      filter_key,
      filter_value
) k
$WHERE_FILTER$, i_filters);

    raise notice '%', l_filter_query;
    execute l_filter_query into l_filter;
                -- point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326)

    -- check if user has is_staff
    l_query := format('select is_staff, geofence FROM webusers_webuser where id = %L', i_webuser_id);

    EXECUTE l_query INTO l_is_staff, l_geofence;

    IF l_is_staff = FALSE
    THEN
        l_tabiya_predicate := format(' AND tabiya IN (SELECT unnest(values) FROM webusers_grant WHERE webuser_id = %L)',
                                     i_webuser_id);
    ELSE
        l_tabiya_predicate := NULL;
    END IF;

    -- geofence predicate
    IF l_geofence IS NOT NULL THEN
        l_geofence_predicate := format(' AND st_within(point_geometry, %L)', l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    -- create temporary table so the core_utils.get_core_dashboard_data is called only once
    -- filtering / aggregation / statistics should be taken from tmp_dashboard_chart_data
    l_query :=  format($TEMP_TABLE_QUERY$create temporary table tmp_dashboard_chart_data on commit drop
        as
        select *
        from (
          select *,
            CASE
                WHEN static_water_level::FLOAT >= 100
                  THEN 5
                WHEN static_water_level::FLOAT >= 50 AND static_water_level::FLOAT < 100
                  THEN 4
                WHEN static_water_level::FLOAT >= 20 AND static_water_level::FLOAT < 50
                  THEN 3
                WHEN static_water_level::FLOAT > 10 AND static_water_level::FLOAT < 20
                  THEN 2
                ELSE 1
                END AS static_water_level_group_id,
                CASE
                      WHEN amount_of_deposited::int >= 5000
                          THEN 5
                      WHEN amount_of_deposited::int >= 3000 AND amount_of_deposited::int < 5000
                          THEN 4
                      WHEN amount_of_deposited::int >= 500 AND amount_of_deposited::int < 3000
                          THEN 3
                      WHEN amount_of_deposited::int > 1 AND amount_of_deposited::int < 500
                          THEN 2
                      ELSE 1
                  END AS amount_of_deposited_group_id,
            CASE
                WHEN yield::FLOAT >= 6
                  THEN 5
                WHEN yield::FLOAT >= 3 AND yield::FLOAT < 6
                  THEN 4
                WHEN yield::FLOAT >= 1 AND yield::FLOAT < 3
                  THEN 3
                WHEN yield::FLOAT > 0 AND yield::FLOAT < 1
                  THEN 2
                ELSE 1
                END        AS yield_group_id
            FROM
            core_utils.get_core_dashboard_data(
                'amount_of_deposited',
                'beneficiaries',
                'fencing_exists',
                'functioning',
                'funded_by',
                'name',
                'static_water_level',
                'tabiya',
                'water_committe_exist',
                'yield'
            ) as (
                point_geometry geometry,
                email varchar,
                ts timestamp with time zone,
                feature_uuid uuid,
                amount_of_deposited text,
                beneficiaries text,
                fencing_exists text,
                functioning text,
                funded_by text,
                name text,
                static_water_level text,
                tabiya text,
                water_committe_exist text,
                yield text
            )
        ) core_data
        WHERE
            point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%s, %s), ST_Point(%s, %s)), 4326)
          %s %s %s limit 100
    $TEMP_TABLE_QUERY$, i_min_x, i_min_y, i_max_x, i_max_y, l_filter, l_tabiya_predicate, l_geofence_predicate);
    raise notice '%',l_query;

        execute l_query;

    l_query := $CHART_QUERY$
select (
(
    -- TABIA COUNT
    select
        json_build_object(
            'tabia', coalesce(jsonb_agg(tabiyaRow), '[]'::jsonb)
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
)::jsonb || (


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
                'group_id', functioning,
                'cnt', count(functioning)
            ) as func
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            functioning
    ) d


)::jsonb || (

    -- MAP / MARKER DATA
    select json_build_object(
        'mapData', coalesce(jsonb_agg(mapRow), '[]'::jsonb)
    )
    FROM (
        select
            ff.feature_uuid,
            d.functioning,
            ST_X(ff.point_geometry) as lng,
            ST_Y(ff.point_geometry) as lat,
            d.name,
            d.yield,
            d.static_water_level
        from
                features.feature ff
        join tmp_dashboard_chart_data d
        on
                ff.feature_uuid = d.feature_uuid
     where
         is_active = True
    ) mapRow
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
        'cnt', d.sum,
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
          sum(static_water_level::FLOAT) AS sum,
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
--           group_data.key as group_id,
--           group_data.value as group_definition,
--           d.*,
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
                sum(yield::float) AS cnt,
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


)::jsonb || (
    select
        json_build_object(
            'tableData', coalesce(jsonb_agg(tableDataRow), '[]'::jsonb)
        )
    FROM (
        select
            email as _webuser,
            ts as _last_update,
            name as feature_name,
            feature_uuid,
            tabiya,
            yield,
            static_water_level
        from
            tmp_dashboard_chart_data
     ) tableDataRow
)::jsonb


)::text;$CHART_QUERY$;

    execute l_query into l_result;

    return l_result;
end;
$$;




-- *
-- core_utils.get_features
-- *

create or replace function core_utils.get_features(i_webuser_id integer, i_limit integer, i_offset integer, i_order_text text, i_search_name text) returns SETOF text

LANGUAGE plpgsql
AS $fun$
DECLARE
    l_args             TEXT;
    l_field_def        TEXT;
    v_query            TEXT;
    l_tabiya_predicate TEXT;
    l_geofence geometry;
    l_geofence_predicate TEXT;
    l_is_staff         BOOLEAN;
BEGIN

    v_query := $attributes$
    select
        string_agg(quote_literal(key), ',' ORDER BY key) as args,
        string_agg(key || ' text', ', ' ORDER BY key) as field_def
    from (
        SELECT key
        FROM
            attributes_attribute
        ORDER BY
            key
    )d;
    $attributes$;

    EXECUTE v_query
    INTO l_args, l_field_def;

    -- check if user has is_staff
    v_query := format('select is_staff, geofence FROM webusers_webuser where id = %L', i_webuser_id);

    EXECUTE v_query INTO l_is_staff, l_geofence;

    IF l_is_staff = FALSE
    THEN
        l_tabiya_predicate := format('AND tabiya IN (SELECT unnest(values) FROM webusers_grant WHERE webuser_id = %L)',
                                     i_webuser_id);
    ELSE
        l_tabiya_predicate := NULL;
    END IF;

    -- geofence predicate
    IF l_geofence IS NOT NULL THEN
        l_geofence_predicate := format($$ AND st_within(ff.point_geometry, %L)$$, l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    v_query := format($q$
    CREATE TEMPORARY TABLE active_data ON COMMIT DROP AS (
        WITH attrs as (
            select * from core_utils.get_core_dashboard_data(
            %s
        ) as (
        point_geometry geometry, email varchar, ts timestamp with time zone, feature_uuid uuid,
         %s)
        )
         SELECT
             ts as _last_update,
             wu.email AS _webuser,
             attrs.*
         FROM attrs
             JOIN features.feature ff ON ff.feature_uuid = attrs.feature_uuid
             JOIN features.changeset chg ON chg.id = ff.changeset_id
             JOIN webusers_webuser wu ON chg.webuser_id = wu.id

         WHERE ff.is_active = TRUE
         %s %s
         )
$q$, l_args, l_field_def, l_tabiya_predicate, l_geofence_predicate);

    EXECUTE v_query;
    v_query := format($q$
select (jsonb_build_object('data', (
         SELECT coalesce(jsonb_agg(row), '[]') AS data
FROM (
    SELECT * from active_data
    %s
    %s
    LIMIT %s OFFSET %s
         ) row)) || jsonb_build_object('recordsTotal', (Select count(*) from active_data))
         || jsonb_build_object('recordsFiltered', (Select count(*) from active_data %s))
         )::text
$q$, i_search_name, i_order_text, i_limit, i_offset, i_search_name);

    RETURN QUERY EXECUTE v_query;
END;

$fun$;


-- *
-- core_utils.create_changeset
-- *

CREATE OR REPLACE FUNCTION core_utils.create_changeset(i_webuser_id integer)
  RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_changeset_id INTEGER;
BEGIN

  INSERT INTO features.changeset (webuser_id) VALUES (i_webuser_id) RETURNING id INTO v_new_changeset_id;

  RETURN v_new_changeset_id;
END;

$$;


-- *
-- core_utils.add_feature
-- *

CREATE or replace FUNCTION core_utils.add_feature(i_feature_uuid uuid, i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_attributes JSONB;
    v_key            TEXT;

    v_attr_id        INTEGER;
    v_result_type    TEXT;
    v_allowed_values TEXT [];

    v_int_value      INTEGER;
    v_decimal_value  DECIMAL(9, 2);
    v_text_value     text;

    v_fav_active     features.FEATURE_ATTRIBUTE_VALUE;
BEGIN
    -- we first update feature and set is_active = FALSE
    UPDATE features.feature
    SET is_active = FALSE
    WHERE feature_uuid = i_feature_uuid AND is_active = TRUE;

    IF NOT FOUND
    THEN
        RAISE EXCEPTION 'NOT FOUND - Feature uuid=%, is_active=TRUE', i_feature_uuid;
    END IF;

    -- insert a new feature

    INSERT INTO features.feature (feature_uuid, changeset_id, point_geometry, is_active)
    VALUES (
        i_feature_uuid, i_feature_changeset, i_feature_point_geometry,
        TRUE
    );

    -- v_new_attributes := jsonb_strip_nulls(i_feature_attributes::jsonb);
    -- cast(i_feature_attributes AS JSONB);

    v_new_attributes := i_feature_attributes::jsonb;

    -- collect type definitions
    CREATE TEMPORARY TABLE tmp_attribute_types ON COMMIT DROP AS
        SELECT
            aa.id,
            aa.key AS key,
            aa.result_type,
            array_agg(ao.value) AS allowed_values
        FROM attributes_attribute aa
            JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
            LEFT JOIN attributes_attributeoption ao ON ao.attribute_id = aa.id
        GROUP BY aa.id, aa.key, aa.result_type;

    -- collect current active rows
    CREATE TEMPORARY TABLE tmp_fav_active ON COMMIT DROP AS
        SELECT *
        FROM features.feature_attribute_value
        WHERE feature_uuid = i_feature_uuid AND is_active = TRUE;

    FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_attributes) LOOP
        -- check attributes
        SELECT
            id,
            result_type,
            allowed_values
        INTO
            v_attr_id,
            v_result_type,
            v_allowed_values
        FROM tmp_attribute_types
        WHERE key = v_key;

        IF NOT FOUND
        THEN
            RAISE NOTICE 'Attribute="%" is not defined, skipping', v_key;
            CONTINUE;
        END IF;

        SELECT *
        INTO v_fav_active
        FROM tmp_fav_active
        WHERE attribute_id = v_attr_id;

        -- check attribute type
        IF v_result_type = 'Integer'
        THEN
            v_int_value := v_new_attributes ->> v_key;


            -- only insert new data if the value has changed
            -- insert new data
            INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
            VALUES (
                i_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
            );
            -- deactivate old attribute data
            UPDATE features.feature_attribute_value SET is_active = FALSE
            WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;

        ELSEIF v_result_type = 'Decimal'
            THEN
                v_decimal_value := v_new_attributes ->> v_key;

            -- only insert new data if the value has changed
                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_real)
                VALUES (
                    i_feature_uuid, i_feature_changeset, v_attr_id, v_decimal_value
                );
                -- deactivate old attribute data
                UPDATE features.feature_attribute_value SET is_active = FALSE
                WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;


        ELSEIF v_result_type = 'Text'
            THEN
                -- for whatever reason text values must be extracted as text (oprerator ->>)
                v_text_value := v_new_attributes ->> v_key;

                -- only insert new data if the value has changed

                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_text)
                VALUES (
                    i_feature_uuid, i_feature_changeset, v_attr_id, nullif(v_text_value::text, '')
                );
                -- deactivate old attribute data
                UPDATE features.feature_attribute_value SET is_active = FALSE
                WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;

        ELSEIF v_result_type = 'DropDown'
            THEN
                v_int_value := v_new_attributes ->> v_key;

                -- only insert new data if the value has changed
                IF NOT (v_allowed_values @> ARRAY [v_int_value :: TEXT])
                THEN
                    RAISE 'Attribute "%" value "%" is not allowed: %', v_key, v_int_value, v_allowed_values;
                END IF;

                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
                VALUES (
                    i_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
                );
                -- deactivate old attribute data
                UPDATE features.feature_attribute_value SET is_active = FALSE
                WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;

        END IF;

    END LOOP;

    RETURN core_utils.get_event_by_uuid(i_feature_uuid);
END;
$$;


-- *
-- core_utils.add_feature
-- *


CREATE or replace FUNCTION core_utils.create_feature(i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_attributes JSONB;
    v_key            TEXT;

    v_attr_id        INTEGER;
    v_result_type    TEXT;
    v_allowed_values TEXT [];

    v_feature_uuid   uuid;

    v_int_value      INTEGER;
    v_decimal_value  DECIMAL(9, 2);
    v_text_value     text;

BEGIN

    -- insert a new feature

    INSERT INTO features.feature (feature_uuid, changeset_id, point_geometry, is_active)
    VALUES (
        uuid_generate_v4(), i_feature_changeset, i_feature_point_geometry,
        TRUE
    ) RETURNING feature_uuid INTO v_feature_uuid;

    -- v_new_attributes := jsonb_strip_nulls(i_feature_attributes::jsonb);
    v_new_attributes := i_feature_attributes::jsonb;
    -- cast(i_feature_attributes AS JSONB);

    -- collect type definitions
    CREATE TEMPORARY TABLE tmp_attribute_types ON COMMIT DROP AS
        SELECT
            aa.id,
            aa.key AS key,
            aa.result_type,
            array_agg(ao.value) AS allowed_values
        FROM attributes_attribute aa
            JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
            LEFT JOIN attributes_attributeoption ao ON ao.attribute_id = aa.id
        GROUP BY aa.id, aa.key, aa.result_type;

    FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_attributes) LOOP
        -- check attributes
        SELECT
            id,
            result_type,
            allowed_values
        INTO
            v_attr_id,
            v_result_type,
            v_allowed_values
        FROM tmp_attribute_types
        WHERE key = v_key;

        IF NOT FOUND
        THEN
            RAISE NOTICE 'Attribute="%" is not defined, skipping', v_key;
            CONTINUE;
        END IF;

        -- check attribute type
        IF v_result_type = 'Integer'
        THEN
            v_int_value := v_new_attributes ->> v_key;


            -- only insert new data if the value has changed
            -- insert new data
            INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
            VALUES (
                v_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
            );

        ELSEIF v_result_type = 'Decimal'
            THEN
                v_decimal_value := v_new_attributes ->> v_key;

            -- only insert new data if the value has changed
                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_real)
                VALUES (
                    v_feature_uuid, i_feature_changeset, v_attr_id, v_decimal_value
                );

        ELSEIF v_result_type = 'Text'
            THEN
                -- for whatever reason text values must be extracted as text (oprerator ->>)
                v_text_value := v_new_attributes ->> v_key;

                -- only insert new data if the value has changed

                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_text)
                VALUES (
                    v_feature_uuid, i_feature_changeset, v_attr_id, nullif(v_text_value::text, '')
                );

        ELSEIF v_result_type = 'DropDown'
            THEN
                v_int_value := v_new_attributes ->> v_key;

                -- only insert new data if the value has changed
                IF NOT (v_allowed_values @> ARRAY [v_int_value :: TEXT])
                THEN
                    RAISE 'Attribute "%" value "%" is not allowed: %', v_key, v_int_value, v_allowed_values;
                END IF;

                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
                VALUES (
                    v_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
                );

        END IF;

    END LOOP;

    RETURN v_feature_uuid::text;
END;
$$;


-- *
-- core_utils.get_attributes
-- *


CREATE or replace FUNCTION core_utils.get_attributes()
  RETURNS text
STABLE
LANGUAGE SQL
AS $$
select jsonb_agg(row)::text
FROM
(
	select label, key, required, searchable, orderable
	from public.attributes_attribute
	order by position, id
) row;
$$;



-- *
-- core_utils.get_event_by_uuid
-- *

CREATE OR REPLACE FUNCTION core_utils.get_event_by_uuid(i_uuid UUID)
    RETURNS TEXT AS
$BODY$
SELECT coalesce(jsonb_agg(d.row) :: TEXT, '[]') AS data
FROM (
       SELECT jsonb_build_object(
                  '_feature_uuid', ft.feature_uuid :: TEXT,
                  '_created_date', chg.ts_created,
                  '_data_captor', wu.email,
                  '_geometry', ARRAY [ST_X(ft.point_geometry), ST_Y(ft.point_geometry)]
              ) || coalesce(attributes.row, '{}' :: JSONB) AS row
       FROM
         features.feature ft

             LEFT JOIN LATERAL (
                       SELECT
                           fav.feature_uuid,
                           jsonb_object_agg(
                               dg.key || '/' || da.key,
                                row_to_json(fav) -> CASE
                                                                WHEN da.result_type = 'Integer'
                                                                    THEN 'val_int'
                                                                WHEN da.result_type = 'Decimal'
                                                                    THEN 'val_real'
                                                                WHEN da.result_type = 'Text'
                                                                    THEN 'val_text'
                                                                WHEN da.result_type = 'DropDown'
                                                                    THEN 'val_int'
                                                                WHEN da.result_type = 'MultipleChoice'
                                                                    THEN 'val_text'
                                                                ELSE NULL
                                                                END
                            ) AS row
                       FROM
                           features.feature_attribute_value fav
                           JOIN public.attributes_attribute da ON da.id = fav.attribute_id
                           JOIN public.attributes_attributegroup dg ON dg.id = da.attribute_group_id
                       WHERE
                           fav.feature_uuid = ft.feature_uuid
                           AND fav.is_active = TRUE
                       GROUP BY fav.feature_uuid
                       ) attributes ON TRUE

                 JOIN features.changeset chg ON ft.changeset_id = chg.id
             JOIN webusers_webuser wu ON chg.webuser_id = wu.id

       WHERE
         ft.feature_uuid = $1
         AND ft.is_active = TRUE
       GROUP BY ft.feature_uuid, chg.ts_created, wu.email, ft.point_geometry,
         attributes.row
       ORDER BY ft.feature_uuid) d;
$BODY$
LANGUAGE SQL
STABLE
COST 100;



-- *
-- core_utils.get_feature_by_changeset_uuid
-- *

CREATE OR REPLACE FUNCTION
		core_utils.get_feature_by_changeset_uuid(i_uuid UUID, i_changeset_id int)
RETURNS TEXT AS
$BODY$
SELECT coalesce(jsonb_agg(d.row) :: TEXT, '[]') AS data
FROM (
       SELECT jsonb_build_object(
                  '_feature_uuid', ft.feature_uuid :: TEXT,
                  '_created_date', chg.ts_created,
                  '_data_captor', wu.email,
                  '_geometry', ARRAY [ST_Y(ft.point_geometry), ST_X(ft.point_geometry)]
              ) || coalesce(attributes.row, '{}' :: JSONB) AS row
       FROM
         features.feature ft

			 LEFT JOIN LATERAL (
					 SELECT
							 fav.feature_uuid,
							 jsonb_object_agg(
									 dg.key || '/' || da.key,
										row_to_json(fav) -> CASE
													WHEN da.result_type = 'Integer'
															THEN 'val_int'
													WHEN da.result_type = 'Decimal'
															THEN 'val_real'
													WHEN da.result_type = 'Text'
															THEN 'val_text'
													WHEN da.result_type = 'DropDown'
															THEN 'val_int'
													WHEN da.result_type = 'MultipleChoice'
															THEN 'val_text'
													ELSE NULL
													END
								) AS row
					 FROM
							 features.feature_attribute_value fav
							 JOIN public.attributes_attribute da ON da.id = fav.attribute_id
							 JOIN public.attributes_attributegroup dg ON dg.id = da.attribute_group_id
					 WHERE
							 fav.feature_uuid = ft.feature_uuid
							and fav.changeset_id = i_changeset_id
					 GROUP BY fav.feature_uuid
			 ) attributes ON TRUE
			JOIN
					features.changeset chg ON ft.changeset_id = chg.id
			JOIN
				webusers_webuser wu ON chg.webuser_id = wu.id

       WHERE
         ft.feature_uuid = $1
			 AND
					 ft.changeset_id = i_changeset_id
       GROUP BY ft.feature_uuid, chg.ts_created, wu.email, ft.point_geometry,
         attributes.row
       ORDER BY ft.feature_uuid) d;
$BODY$
LANGUAGE SQL;

-- *
-- core_utils.get_attribute_history_by_uuid
-- *

create or replace function
	core_utils.get_attribute_history_by_uuid(i_uuid uuid, attribute_id int, i_start timestamp with time zone, i_end timestamp with time zone)
returns text as
$$
-- select * from core_utils.get_attribute_history_by_uuid('0000866c-1062-478f-a538-117cf88c28ce', 26, now() - '6 month'::interval, now()) as ttt

select
	json_agg(row)::text
from (
	select
		ch.ts_created as ts,
		fav.val_real as value
	from
		features.feature_attribute_value fav
	join
		features.changeset ch
	on
		fav.changeset_id = ch.id
	where
		fav.feature_uuid = $1
	and
		fav.attribute_id = $2
	and
		fav.val_real is not null
	and
		ch.ts_created > $3
	and
		ch.ts_created <= $4
	order by ts

) row


$$
language sql;



-- *
-- * feature by uuid history table | fetch feature history by uuid
-- *
CREATE or replace FUNCTION core_utils.get_feature_history_by_uuid(i_uuid uuid, i_start timestamp with time zone, i_end timestamp with time zone)
  RETURNS text
LANGUAGE plpgsql
AS $$
-- IN:
--     i_uuid uuid representing the feature
--     i_start date, from date
--     i_end date, to date
-- OUT:
--     [{"username":"admin","email":"admin@example.com","feature_uuid":"2578c3a6-a306-4756-957a-d1fd92aad1d1","changeset_id":22,"ts":"2017-12-27T00:00:00+01:00"}]

-- select * from core_utils.get_feature_history_by_uuid(
--     '2578c3a6-a306-4756-957a-d1fd92aad1d1',
--     (now() - '6 month'::interval)::date,
--     (now())::date
-- ) as t;

declare
    l_query text;
    l_result text;

begin

l_query=format($kveri$
select
    json_agg(row)::text
from (
    SELECT
          ff.point_geometry
        , wu.email
        , chg.ts_created as ts
        , attrs.*

    FROM
                crosstab(
                    $INNER_QUERY$select
                            ff.feature_uuid::text || '_'||fav.changeset_id::text as feature_uuid_id,
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
                    join
                        features.changeset chg
                    ON
                    fav.changeset_id = chg.id
                    ON
                        ff.feature_uuid = fav.feature_uuid
                    and
                        ff.changeset_id = fav.changeset_id
                    and
                        fav.feature_uuid = %L
                    and
                chg.ts_created >= %L
                and
                    chg.ts_created <=  %L
                    join
                        attributes_attribute aa
                    on
                        fav.attribute_id = aa.id

                    left JOIN
                         attributes_attributeoption ao
                    ON
                        fav.attribute_id = ao.attribute_id
                    where

                                aa.key = 'yield'
                        or
                                aa.key = 'static_water_level'

                    order by 1,2
                    $INNER_QUERY$
                ) as attrs(
                    feature_uuid_id text,static_water_level text,  yield text
                 )
    JOIN
      features.feature ff
    ON
        attrs.feature_uuid_id = ff.feature_uuid::text || '_'|| ff.changeset_id::text
    JOIN
        features.changeset chg
    ON
        ff.changeset_id = chg.id
    JOIN
          webusers_webuser wu
    ON
        chg.webuser_id = wu.id
    where
        ff.feature_uuid = %L
    and
            chg.ts_created >= %L
        and
            chg.ts_created <=  %L
) row;
$kveri$, i_uuid, i_start, i_end, i_uuid, i_start, i_end);


	execute l_query into l_result;

	return l_result;
	end
$$;






-- *
-- * table data report | build export features data to csv query
-- *
CREATE OR REPLACE FUNCTION core_utils.export_all()
    RETURNS TEXT
LANGUAGE plpgsql
AS
$$
DECLARE
    _query      TEXT;
    l_args      TEXT;
    l_field_def TEXT;
    v_query     TEXT;

BEGIN

    v_query:= $attributes$
    select
        string_agg(quote_literal(key), ',' ORDER BY key) as args,
        string_agg(key || ' text', ', ' ORDER BY key) as field_def
    from (
        SELECT key
        FROM
            attributes_attribute
        ORDER BY
            key
    )d;
    $attributes$;

    EXECUTE v_query
    INTO l_args, l_field_def;


    _query:= format(' COPY (select * from core_utils.get_core_dashboard_data(%s
        ) as (
        point_geometry geometry, email varchar, ts timestamp with time zone, feature_uuid uuid,
         %s)) TO STDOUT WITH CSV HEADER', l_args, l_field_def);

    RETURN _query;

END
$$;
