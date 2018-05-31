-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

-- * ==================================
-- * FEATURE FUNCTIONS
-- * ==================================

-- *
-- * core_utils.get_features, used od features / table reports
-- *
-- * has limit / offset pagination - TODO update to use row_number()

CREATE OR REPLACE FUNCTION core_utils.get_features(
    i_webuser_id integer, i_limit integer, i_offset integer, i_order_text text, i_search_name text
)
  RETURNS SETOF text
LANGUAGE plpgsql
AS $fun$
DECLARE
    v_query            TEXT;
    l_woreda_predicate TEXT;
    l_geofence geometry;
    l_geofence_predicate TEXT;
    l_is_staff         BOOLEAN;
BEGIN

    -- check if user has is_staff
    v_query := format('select is_staff OR is_readonly, geofence FROM webusers_webuser where id = %L', i_webuser_id);

    EXECUTE v_query INTO l_is_staff, l_geofence;

    IF l_is_staff = FALSE
    THEN
        l_woreda_predicate := format('AND woreda IN (SELECT unnest(values) FROM webusers_grant WHERE webuser_id = %L)',
                                     i_webuser_id);
    ELSE
        l_woreda_predicate := NULL;
    END IF;

    -- geofence predicate
    IF l_geofence IS NOT NULL THEN
        l_geofence_predicate := format($$ AND st_within(ff.point_geometry, %L)$$, l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    v_query := format($q$
    WITH user_active_data AS (
    SELECT
             ts as _last_update,
             email AS _webuser,
             *
         FROM public.active_data attrs
         %s %s
    )

    select (jsonb_build_object('data', (
         SELECT coalesce(jsonb_agg(row), '[]') AS data
            FROM (
                SELECT * from user_active_data
                %s
                %s
                LIMIT %s OFFSET %s
            ) row)
        ) || jsonb_build_object(
                'recordsTotal',
                (Select count(*) from user_active_data)
        ) || jsonb_build_object(
                'recordsFiltered',
                (Select count(*) from user_active_data %s)
        )
    )::text
$q$, l_woreda_predicate, l_geofence_predicate, i_search_name, i_order_text, i_limit, i_offset, i_search_name);

    RETURN QUERY EXECUTE v_query;
END;

$fun$;


-- *
-- core_utils.create_feature , used in features/views
-- *
-- CREATE or replace FUNCTION core_utils.create_feature(i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
CREATE or replace FUNCTION core_utils.create_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid   uuid;
    l_feature_changeset integer;
    l_query text;
    l_query_template text;
    l_attribute_list text;
    l_email text;
    l_ts_created timestamp with time zone;
BEGIN

    -- create a new feature uuid
    l_feature_uuid = uuid_generate_v4();

    -- create new changeset
    INSERT INTO
        features.changeset (webuser_id)
    VALUES (i_webuser_id) RETURNING id INTO l_feature_changeset;

    -- get data related to the changeset
    select wu.email, chg.ts_created FROM features.changeset chg JOIN webusers_webuser wu ON chg.webuser_id = wu.id
    WHERE chg.id = l_feature_changeset
    INTO l_email, l_ts_created;

    -- which attributes are available
    l_query := $attributes$
    select
        string_agg(quote_ident(key), ', ' ORDER BY row_number) as attribute_list
    from (
        SELECT row_number() OVER (ORDER BY
            ag.position, aa.position), aa.key
        FROM
            attributes_attribute aa JOIN attributes_attributegroup ag on aa.attribute_group_id = ag.id
    ) d;
    $attributes$;

    EXECUTE l_query INTO l_attribute_list;

    l_query_template := $OUTER_QUERY$
        insert into %s (
            point_geometry,
            email,
            ts,
            feature_uuid,
            changeset_id,
            static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
            %s
        )

        select
            %L as point_geometry,
            %L as email,
            %L as ts,
            %L as feature_uuid,
            %L as changeset_id,
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
              WHEN amount_of_deposited::FLOAT >= 5000
                  THEN 5
              WHEN amount_of_deposited::FLOAT >= 3000 AND amount_of_deposited::FLOAT < 5000
                  THEN 4
              WHEN amount_of_deposited::FLOAT >= 500 AND amount_of_deposited::FLOAT < 3000
                  THEN 3
              WHEN amount_of_deposited::FLOAT > 1 AND amount_of_deposited::FLOAT < 500
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
            END AS yield_group_id,
            %s -- other columns
            FROM (SELECT %s) computed_data

        $OUTER_QUERY$;

    -- generate query that will insert data to history_data
    l_query := format(l_query_template, 'public.history_data', l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, 'public.active_data', l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    RETURN l_feature_uuid::text;
END;
$$;


-- *
-- * core_utils.update_feature, used in attributes/views
-- *
CREATE or replace FUNCTION core_utils.update_feature(i_feature_uuid uuid, i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_changeset integer;
    l_query text;
    l_query_template text;
    l_attribute_list text;
    l_email text;
    l_ts_created timestamp with time zone;
BEGIN

    -- create new changeset
    INSERT INTO
        features.changeset (webuser_id)
    VALUES (i_webuser_id) RETURNING id INTO l_feature_changeset;

    -- get data related to the changeset
    select wu.email, chg.ts_created FROM features.changeset chg JOIN webusers_webuser wu ON chg.webuser_id = wu.id
    WHERE chg.id = l_feature_changeset
    INTO l_email, l_ts_created;

    -- which attributes are available
    l_query := $attributes$
    select
        string_agg(quote_ident(key), ', ' ORDER BY row_number) as attribute_list
    from (
        SELECT row_number() OVER (ORDER BY
            ag.position, aa.position), aa.key
        FROM
            attributes_attribute aa JOIN attributes_attributegroup ag on aa.attribute_group_id = ag.id
    ) d;
    $attributes$;

    EXECUTE l_query INTO l_attribute_list;

    l_query_template := $OUTER_QUERY$
        insert into %s (
            point_geometry,
            email,
            ts,
            feature_uuid,
            changeset_id,
            static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
            %s
        )

        select
            %L as point_geometry,
            %L as email,
            %L as ts,
            %L as feature_uuid,
            %L as changeset_id,
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
              WHEN amount_of_deposited::FLOAT >= 5000
                  THEN 5
              WHEN amount_of_deposited::FLOAT >= 3000 AND amount_of_deposited::FLOAT < 5000
                  THEN 4
              WHEN amount_of_deposited::FLOAT >= 500 AND amount_of_deposited::FLOAT < 3000
                  THEN 3
              WHEN amount_of_deposited::FLOAT > 1 AND amount_of_deposited::FLOAT < 500
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
            END AS yield_group_id,
            %s -- other columns
            FROM (SELECT %s) computed_data

        $OUTER_QUERY$;

    -- generate query that will insert data to history_data
    l_query := format(l_query_template, 'public.history_data', l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, i_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    -- UPDATE: we need to delete data before inserting an updated data row
    EXECUTE format($qq$DELETE FROM public.active_data WHERE feature_uuid = %L;$qq$, i_feature_uuid);

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, 'public.active_data', l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, i_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    -- currently we are relading the page on success so no point on having this call for now
    return '{}';
    -- RETURN core_utils.get_event(i_feature_uuid);
END;
$$;


-- *
-- core_utils.get_attributes, used in table reports
-- *


CREATE or replace FUNCTION core_utils.get_attributes()
  RETURNS text
STABLE
LANGUAGE SQL
AS $$
select jsonb_agg(row)::text
FROM
(
	select aa.label, aa.key, required, searchable, orderable
	from attributes_attribute aa join attributes_attributegroup ag on aa.attribute_group_id = ag.id
	order by ag.position, aa.position, aa.id
) row;
$$;


-- *
-- * core_utils.get_event
-- * used in attribute / features

CREATE OR REPLACE FUNCTION core_utils.get_event(i_uuid UUID, i_changeset_id int default null )
    RETURNS TEXT AS
$BODY$

declare
    l_query text;
    l_result text;
    l_chg text;
    l_chg_2 text;
begin

    if i_changeset_id is not null then
         l_chg_2:=format('and ad.changeset_id = %s' , i_changeset_id);
    END IF;

    l_query=format($kveri$
        SELECT
            coalesce(jsonb_agg(d.row) :: TEXT, '[]') AS data
        FROM (
            SELECT jsonb_build_object(
                  '_feature_uuid', ad.feature_uuid :: TEXT,
                  '_created_date', chg.ts_created,
                  '_data_captor', wu.email,
                  '_geometry', ARRAY [ST_X(ad.point_geometry), ST_Y(ad.point_geometry)]
                ) || row_to_json(ad.*)::jsonb as row
            FROM
                public.active_data ad
            JOIN
                features.changeset chg ON ad.changeset_id = chg.id
            JOIN
                webusers_webuser wu ON chg.webuser_id = wu.id
            WHERE
                ad.feature_uuid = %L
            ORDER BY
                ad.feature_uuid
       ) d;
       $kveri$, i_uuid, l_chg);

    execute l_query into l_result;

    return l_result;
end
$BODY$
LANGUAGE plpgSQL
COST 100;



-- *
-- core_utils.get_attribute_history_by_uuid, used in features
-- *

create or replace function
	core_utils.get_attribute_history_by_uuid(i_uuid uuid, attribute_key text, i_start timestamp with time zone, i_end timestamp with time zone)
returns text as
$func$
DECLARE
    l_query text;
    l_result text;
BEGIN

l_query := format(
$$select
	json_agg(row)::text
from (
	SELECT
		hd.ts as ts,
		hd.%I as value
	FROM
		public.history_data hd
    WHERE
		hd.feature_uuid = %L
	and
		hd.ts > %L
	and
		hd.ts <= %L
	order by ts

) row$$, attribute_key, i_uuid, i_start, i_end);

    execute l_query into l_result;
    return l_result;
END
$func$
language plpgsql;



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
--     [
-- {"username":"admin",
-- "email":"admin@example.com",
-- "feature_uuid":"2578c3a6-a306-4756-957a-d1fd92aad1d1","changeset_id":22,"ts":"2017-12-27T00:00:00+01:00"}]

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
    SELECT * from public.history_data hd
    WHERE
        hd.feature_uuid = %L
    and
        hd.ts >= %L
    and
        hd.ts <=  %L
) row;
$kveri$, i_uuid, i_start, i_end, i_uuid, i_start, i_end);

	execute l_query into l_result;

	return l_result;
	end
$$;


-- *
-- * core_utils.get_cluster
-- *
-- * for a point, zoom and desired tile size, calculate center of the cluster
-- *

CREATE OR REPLACE FUNCTION core_utils.get_cluster(i_zoom int, i_tilesize integer, i_min_x float, i_min_y  float, i_point geometry)
  RETURNS geometry
  STABLE
  LANGUAGE plpgsql AS
$$
DECLARE
  l_res float;
BEGIN

    -- only cluster points on low zoom levels
    IF i_zoom <= 12 THEN
      l_res = (180.0 / 256 / 2 ^ i_zoom) * i_tilesize;

      return st_setsrid(ST_SnapToGrid(i_point, i_min_x, i_min_y, l_res, l_res), 4326);
    ELSE
        -- for other (high) zoom levels use real geometry
        return i_point;
    end if;

END;
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
    l_attribute_list TEXT;
    v_query     TEXT;

BEGIN

    v_query:= $attributes$
    select
        string_agg(quote_ident(key), ', ' ORDER BY row_number) as attribute_list
    from (
        SELECT row_number() OVER (ORDER BY
            ag.position, aa.position), aa.key
        FROM
            attributes_attribute aa JOIN attributes_attributegroup ag on aa.attribute_group_id = ag.id
    ) d;
    $attributes$;

    EXECUTE v_query INTO l_attribute_list;


    _query:= format($qveri$COPY (
        select point_geometry, feature_uuid, email, ts, %s from public.active_data
    ) TO STDOUT WITH CSV HEADER$qveri$, l_attribute_list);

    RETURN _query;

END
$$;


-- * ==================================
-- * ACTIVE_DATA MANIPULATION
-- * ==================================

-- * DROP attributes attribute column active_data
-- *
CREATE OR REPLACE FUNCTION core_utils.drop_active_data_column(i_old ATTRIBUTES_ATTRIBUTE)
    RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_query      TEXT;
    l_field_name TEXT;
BEGIN

    SELECT i_old.key AS field_name
    INTO
        l_field_name;

    v_query:= format($alter$
      alter table public.active_data DROP COLUMN IF EXISTS %s;
  $alter$, l_field_name);

    RAISE NOTICE '%', v_query;
    EXECUTE v_query;
END
$$;



-- *
-- * Add attributes attribute column active_data
-- *
create or replace function core_utils.add_active_data_column(i_new attributes_attribute)
   RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_query TEXT;
    l_attribute_type text;
    l_field_name text;
BEGIN

  select
    case
          when i_new.result_type = 'Integer' THEN 'int'
          when i_new.result_type = 'Decimal' THEN 'float'
          when i_new.result_type = 'Text' THEN 'text'
          when i_new.result_type = 'DropDown' THEN 'text'
          ELSE null
         end as val,
         i_new.key as field_name
  into
    l_attribute_type, l_field_name;

  v_query:= format($alter$
      alter table public.active_data add column %s %s;
  $alter$, l_field_name, l_attribute_type);

  raise notice '%', v_query;
  execute v_query;

end
$$;



-- * atrributes_attribute RULES to handle active_data table
-- * Add or Drop on delete or on insert RULE on atrributes_attribute table
-- * i_action: create | drop
CREATE OR REPLACE FUNCTION core_utils.attribute_rules(i_action text)
    RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    l_query      TEXT;
BEGIN


    if i_action = 'create' then
        -- * ADD ON ATTRIBUTE DELETE RULE
        l_query:='CREATE OR REPLACE RULE
            drop_active_data_field_rule AS
        ON delete TO
            public.attributes_attribute
        DO also
            select core_utils.drop_active_data_column(old)';

        RAISE NOTICE 'On delete Rule: %', l_query;

        execute l_query;

        -- * ADD ON ATTRIBUTE INSERT RULE
        l_query:='CREATE OR REPLACE RULE
            active_data_add_field_rule AS
        ON INSERT TO
            public.attributes_attribute
        DO ALSO
            SELECT core_utils.add_active_data_column(new)';

        RAISE NOTICE 'On INSERT Rule: %', l_query;

        execute l_query;

        -- UPDATE ON ATTRIBUTE update RULE for active data
        -- DO NOT ADD ANY ON UPDATE RULE - we pivot the table so n -> 1
        -- update active data manually when all fields are inserted / updated

    ELSEIF i_action = 'drop' then

        DROP RULE if exists drop_active_data_field_rule ON public.attributes_attribute;
        DROP RULE if exists active_data_add_field_rule ON public.attributes_attribute;
    END IF;

END
$$;


-- *
-- * core_utils.json_to_data - transform data form serialized as json to active_data columns
-- *

create or replace function core_utils.json_to_data(i_raw_json text)
    RETURNS text
LANGUAGE plpgsql
AS $func$
DECLARE
  l_attribute_converters text[];
  l_key text;
  l_type text;
  l_json json;
BEGIN
  l_json := cast(i_raw_json as json);

  FOR l_key, l_type IN (SELECT
    aa.key,
    aa.result_type
  FROM
    attributes_attribute aa
    JOIN attributes_attributegroup ag on aa.attribute_group_id = ag.id
  ORDER BY
    ag.position, aa.position) LOOP

    IF l_type = 'Integer' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$cast(%L as integer) as %I$$, l_json ->> l_key, l_key));
    elseif l_type = 'Decimal' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$cast(%L as real) as %I$$, l_json ->> l_key, l_key));
    ELSEif l_type = 'DropDown' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$coalesce((select ao.option from attributes_attributeoption ao JOIN attributes_attribute aa on ao.attribute_id = aa.id where ao.value = %L AND aa.key = %L), 'Unknown') as %I$$, l_json ->> l_key, l_key, l_key));
    ELSE
      l_attribute_converters := array_append(l_attribute_converters, format($$%L as %I$$, l_json ->> l_key, l_key));
    end if;

  end loop;

  RETURN array_to_string(l_attribute_converters, ', ');

  END;
$func$;
