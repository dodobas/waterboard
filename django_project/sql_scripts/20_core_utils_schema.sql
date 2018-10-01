-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

-- * ==================================
-- * CONST FUNCTIONS - common constants used in other sql functions
-- * ==================================

CREATE OR REPLACE FUNCTION core_utils.const_table_active_data()
  RETURNS text IMMUTABLE LANGUAGE SQL AS
$$SELECT 'features.active_data'$$;

CREATE OR REPLACE FUNCTION core_utils.const_table_history_data()
  RETURNS text IMMUTABLE LANGUAGE SQL AS
$$SELECT 'features.history_data'$$;


-- * ==================================
-- * FEATURE FUNCTIONS
-- * ==================================

-- *
-- * core_utils.get_features, used od features / table reports
-- *
-- * has limit / offset pagination - TODO update to use row_number()

CREATE OR REPLACE FUNCTION core_utils.get_features(
    i_webuser_id integer, i_limit integer, i_offset integer, i_order_text text, i_search_predicates text
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
        l_geofence_predicate := format($$ AND st_within(attrs.point_geometry, %L)$$, l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    v_query := format($q$
    WITH user_active_data AS (
    SELECT
             ts as _last_update,
             email AS _webuser,
             *
         FROM %s attrs -- active_data
         WHERE 1=1
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
$q$, core_utils.const_table_active_data(), l_woreda_predicate, l_geofence_predicate, i_search_predicates, i_order_text, i_limit, i_offset, i_search_predicates);

    RETURN QUERY EXECUTE v_query;
END;

$fun$;


CREATE or replace FUNCTION core_utils.insert_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_feature_uuid uuid default NULL, i_changeset_id integer default NULL)
  RETURNS uuid
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

    if i_feature_uuid is null THEN
        -- create a new feature uuid
        l_feature_uuid := uuid_generate_v4();
    ELSE
        l_feature_uuid := i_feature_uuid;
    END IF;

    if i_changeset_id is null THEN
        -- create new changeset
        INSERT INTO
            features.changeset (webuser_id)
        VALUES (i_webuser_id) RETURNING id INTO l_feature_changeset;
    ELSE
        l_feature_changeset := i_changeset_id;
    END IF;

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
        WHERE
            aa.is_active = True
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
                WHEN static_water_level >= 100
                  THEN 5
                WHEN static_water_level >= 50 AND static_water_level < 100
                  THEN 4
                WHEN static_water_level >= 20 AND static_water_level < 50
                  THEN 3
                WHEN static_water_level > 10 AND static_water_level < 20
                  THEN 2
                ELSE 1
            END AS static_water_level_group_id,
            CASE
              WHEN amount_of_deposited >= 5000
                  THEN 5
              WHEN amount_of_deposited >= 3000 AND amount_of_deposited < 5000
                  THEN 4
              WHEN amount_of_deposited >= 500 AND amount_of_deposited < 3000
                  THEN 3
              WHEN amount_of_deposited > 1 AND amount_of_deposited < 500
                  THEN 2
              ELSE 1
            END AS amount_of_deposited_group_id,
            CASE
                WHEN yield >= 6
                  THEN 5
                WHEN yield >= 3 AND yield < 6
                  THEN 4
                WHEN yield >= 1 AND yield < 3
                  THEN 3
                WHEN yield > 0 AND yield < 1
                  THEN 2
                ELSE 1
            END AS yield_group_id,
            %s -- other columns
            FROM (SELECT %s) computed_data

        $OUTER_QUERY$;

    -- generate query that will insert data to history_data
    l_query := format(l_query_template, core_utils.const_table_active_data(), l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, core_utils.const_table_history_data(), l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    RETURN l_feature_uuid;
END;
$$;


-- *
-- core_utils.create_feature , used in features/views
-- *
-- CREATE or replace FUNCTION core_utils.create_feature(i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
CREATE or replace FUNCTION core_utils.create_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_changeset_id integer DEFAULT NULL)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid   uuid;

BEGIN
    l_feature_uuid := core_utils.insert_feature(i_webuser_id, i_feature_point_geometry, i_feature_attributes, NULL, i_changeset_id);

    return l_feature_uuid;
END;
$$;


-- *
-- * core_utils.update_feature, used in attributes/views
-- *
CREATE or replace FUNCTION core_utils.update_feature(i_feature_uuid uuid, i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_changeset_id integer DEFAULT NULL)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_query text;
    l_feature_uuid uuid;
BEGIN

    -- UPDATE: we need to delete data before inserting an updated data row
    l_query := format($qq$DELETE FROM %s WHERE feature_uuid = %L;$qq$, core_utils.const_table_active_data(), i_feature_uuid);
    EXECUTE l_query;

    l_feature_uuid := core_utils.insert_feature(i_webuser_id, i_feature_point_geometry, i_feature_attributes, i_feature_uuid, i_changeset_id);

    -- currently we are relading the page on success so no point on having this call for now
    return '{}';
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
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
    WHERE
        aa.is_active = True
    order by ag.position, aa.position, aa.id
) row;
$$;



CREATE or replace FUNCTION core_utils.filter_attributes()
  RETURNS text
STABLE
LANGUAGE SQL
AS $$
select jsonb_agg(row)::text
FROM
(
    select aa.label, aa.key, required, searchable, orderable
    from attributes_attribute aa join attributes_attributegroup ag on aa.attribute_group_id = ag.id
    WHERE
        aa.is_active = True
    order by ag.position, aa.position, aa.id
) row;
$$;

-- *
-- * core_utils.get_feature_by_uuid_for_changeset
-- * used in attribute / features

CREATE OR REPLACE FUNCTION core_utils.get_feature_by_uuid_for_changeset(i_uuid UUID, i_changeset_id int default null )
    RETURNS TEXT AS
$BODY$

declare
    l_query text;
    l_result text;
    l_chg text;
begin

    IF i_changeset_id is not null THEN
        l_chg := format('and ad.changeset_id = %s' , i_changeset_id);
    ELSE
        l_chg := format('and ad.changeset_id = (select max(changeset_id) from %s hd WHERE hd.feature_uuid = %L)', core_utils.const_table_history_data(), i_uuid);
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
                %s ad -- history_data
            JOIN
                features.changeset chg ON ad.changeset_id = chg.id
            JOIN
                webusers_webuser wu ON chg.webuser_id = wu.id
            WHERE
                ad.feature_uuid = %L
                %s -- changeset condition
            ORDER BY
                ad.ts DESC, ad.feature_uuid
       ) d;
       $kveri$, core_utils.const_table_history_data(), i_uuid, l_chg);

    execute l_query into l_result;

    raise notice '%', l_query;

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
        %s hd
    WHERE
        hd.feature_uuid = %L
    and
        hd.ts > %L
    and
        hd.ts <= %L
    order by ts

) row$$, attribute_key, core_utils.const_table_history_data(), i_uuid, i_start, i_end);

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
    SELECT * from %s hd
    WHERE
        hd.feature_uuid = %L
    and
        hd.ts >= %L
    and
        hd.ts <=  %L
) row;
$kveri$, core_utils.const_table_history_data(), i_uuid, i_start, i_end);

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
CREATE OR REPLACE FUNCTION core_utils.export_all(search_predicate text)
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
        WHERE
            aa.is_active = True
    ) d;
    $attributes$;

    EXECUTE v_query INTO l_attribute_list;

    _query:= format($qveri$COPY (
        select feature_uuid, email, changeset_id as changeset, ts, %s from %s %s
    ) TO STDOUT WITH CSV HEADER$qveri$, l_attribute_list, core_utils.const_table_active_data(), search_predicate);

    RETURN _query;

END
$$;


-- * ==================================
-- * ACTIVE_DATA MANIPULATION
-- * ==================================

-- *
-- * DROP attributes attribute column active_data
-- *
CREATE OR REPLACE FUNCTION core_utils.drop_active_data_column(i_old ATTRIBUTES_ATTRIBUTE)
    RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_query      TEXT;
BEGIN
    v_query := format($deactivate$
    UPDATE attributes_attribute SET is_active = False WHERE key = %L
$deactivate$, i_old.key);

    EXECUTE v_query;
END
$$;


-- *
-- * Add attributes attribute column active_data
-- *
create or replace function core_utils.add_active_data_column(i_new ATTRIBUTES_ATTRIBUTE)
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
          when i_new.result_type = 'Decimal' THEN 'numeric(17, 8)'
          when i_new.result_type = 'Text' THEN 'text'
          when i_new.result_type = 'DropDown' THEN 'text'
          ELSE null
      end as val,
      i_new.key as field_name
  into
    l_attribute_type, l_field_name;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_active_data(), l_field_name, l_attribute_type);
  execute v_query;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_history_data(), l_field_name, l_attribute_type);
  execute v_query;

end
$$;



-- * attributes_attribute RULES to handle active_data table
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
        DO INSTEAD
            select core_utils.drop_active_data_column(OLD)';

        RAISE NOTICE 'On delete Rule: %', l_query;

        execute l_query;

        -- * ADD ON ATTRIBUTE INSERT RULE
        l_query:='CREATE OR REPLACE RULE
            active_data_add_field_rule AS
        ON INSERT TO
            public.attributes_attribute
        DO ALSO
            SELECT core_utils.add_active_data_column(NEW)';

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
    WHERE is_active = True
  ORDER BY
    ag.position, aa.position) LOOP

    IF l_type = 'Integer' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$cast(%L as integer) as %I$$, l_json ->> l_key, l_key));
    elseif l_type = 'Decimal' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$cast(%L as numeric(17, 8)) as %I$$, l_json ->> l_key, l_key));
    ELSEif l_type = 'DropDown' THEN
      l_attribute_converters := array_append(l_attribute_converters, format($$
      coalesce(
        (
            select
                ao.option
            FROM attributes_attributeoption ao JOIN attributes_attribute aa ON ao.attribute_id = aa.id
            WHERE ao.option = %L AND aa.key = %L AND aa.is_active = True
        )
      , 'Unknown') as %I
$$, l_json ->> l_key, l_key, l_key));
    ELSE
      l_attribute_converters := array_append(l_attribute_converters, format($$%L as %I$$, l_json ->> l_key, l_key));
    end if;

  end loop;

  RETURN array_to_string(l_attribute_converters, ', ');

  END;
$func$;















CREATE or replace FUNCTION core_utils.filter_attribute_options(attribute_key text, option_search_str text)
  RETURNS text
STABLE
LANGUAGE SQL
AS $$
-- Filter attribute options by attribute key and options key
--
-- select * from core_utils.filter_attribute_options('tabiya', 'selam');
-- {
--   "attribute_id": 3,
--   "attribute_key": "tabiya",
--   "attribute_group_id": 1,
--   "attribute_group_key": "location_description",
--   "attribute_group_label": "Location description",
--   "attribute_options": [
--     {
--       "option_id": 635,
--       "option": "Selam-Bkalsi"
--     },
--     {
--       "option_id": 634,
--       "option": "Selam-Bikalsi"
--     }...
--   ]
-- }
SELECT
  json_build_object(
    'attribute_id', aa.id ,
    'attribute_key', aa.key,
--     'attribute_group_id', ag.id,
--     'attribute_group_key', ag.key,
--     'attribute_group_label', ag.label,
    'attribute_options', json_agg(
        json_build_object(
            'option_value', ao.value ,
            'option', ao.option)
        )
    )::text
    FROM
        attributes_attribute aa
    JOIN
        attributes_attributegroup ag
    ON
        aa.attribute_group_id = ag.id
    LEFT JOIN
        attributes_attributeoption ao
    ON
        ao.attribute_id = aa.id
    where
      aa.key = $1
    and
      ao.option ilike '%' || $2 || '%'
    group by
      aa.id,
      aa.key;
--       ag.id,
--       ag.key,
--       ag.label

$$;


create or replace function core_utils.wfs_get_feature_xml(i_hostname text, i_version text, i_x_min float DEFAULT NULL, i_y_min float DEFAULT NULL, i_x_max float DEFAULT NULL, i_y_max float DEFAULT NULL, i_srid integer DEFAULT 4326)
    RETURNS text
LANGUAGE plpgsql
AS $func$
DECLARE
    l_xml text;
    l_bounded_by text;
    l_waterpoints text;
    l_query text;
    l_inner_query text;
    l_outer_query text;
BEGIN
    l_xml := '<?xml version="1.0" encoding="UTF-8"?><wfs:FeatureCollection timeStamp="' || current_date || 'T' || current_time || '"
                numberMatched=""
                numberReturned=""
                xmlns="' || i_hostname || '"
                xmlns:wfs="http://www.opengis.net/wfs"
                xmlns:gml="http://www.opengis.net/gml/3.2">';

    IF i_x_min IS NULL OR i_y_min IS NULL OR i_x_max IS NULL OR i_y_max IS NULL THEN
        i_x_min := -180;
        i_y_min := -90;
        i_x_max := 180;
        i_y_max := 90;
    END IF;

    l_bounded_by := xmlelement(name "wfs:boundedBy", xmlelement(name "gml:Envelope", xmlattributes('http://www.opengis.net/def/crs/epsg/0/4326' as srsName), xmlelement(name "gml:lowerCorner", i_x_min, ' ', i_y_min), xmlelement(name "gml:upperCorner", i_x_max, ' ', i_y_max)));
    l_xml := l_xml || l_bounded_by;

    l_inner_query := $inner_query$
        (SELECT string_agg(('xmlelement(name ' || quote_ident(column_name) || ', waterpoint.' || quote_ident(column_name) || ')')::text, ', ')
        FROM (SELECT column_name FROM information_schema.columns WHERE table_name='active_data') d)
    $inner_query$;

    EXECUTE l_inner_query INTO l_inner_query;

    l_outer_query :=$outer_query$
        (SELECT string_agg(data.row::text, '')
        FROM (SELECT xmlelement(name "wfs:member", xmlelement(name "Waterpoints", xmlelement(name "location", xmlelement(name "gml:Point", xmlattributes(waterpoint.feature_uuid AS "gml:id", 'http://www.opengis.net/def/crs/epsg/0/4326' AS srsName), xmlelement(name "gml:pos", waterpoint.longitude, ' ', waterpoint.latitude))), %s)) AS row
            FROM features.active_data AS waterpoint
            WHERE ST_Intersects(waterpoint.point_geometry, ST_MakeEnvelope(%s, %s, %s, %s, 4326))) AS data);
    $outer_query$;

    l_query := format(l_outer_query, l_inner_query, i_x_min, i_y_min, i_x_max, i_y_max);

    EXECUTE l_query INTO l_waterpoints;

    l_xml := l_xml || l_waterpoints;

    l_xml := l_xml || '</wfs:FeatureCollection>';
  RETURN l_xml;

  END;
$func$;


create or replace function core_utils.wfs_describe_feature_type_xml(i_hostname text)
    RETURNS text
LANGUAGE plpgsql
AS $func$
DECLARE
    l_xml text;
    l_xml_query text;
    l_xml_elements text;
    l_query text;
    l_xml_elements_query text;
BEGIN
    l_xml := '<?xml version="1.0" encoding="UTF-8"?>';
    l_xml := l_xml || xmlcomment('http://cite.opengeospatial.org/pub/cite/files/edu/wfs/text/operations.html#describefeaturetype');
    l_xml := l_xml || '<schema targetNamespace="'|| i_hostname || '" xmlns="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" xmlns:gml="http://www.opengis.net/gml/3.2">';
    l_xml := l_xml || xmlelement(name import, xmlattributes('http://www.opengis.net/gml/3.2' AS namespace, 'http://schemas.opengis.net/gml/3.2.1/gml.xsd' AS schemaLocation));
    l_xml := l_xml || xmlelement(name element, xmlattributes('Waterpoints' AS name, 'WaterpointType' AS type));

    --https://stackoverflow.com/questions/10785767/postgresql-table-variable
    CREATE TEMPORARY TABLE IF NOT EXISTS l_temp_table ON COMMIT DROP AS
    SELECT aa.key, aa.result_type
    FROM attributes_attribute aa INNER JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
    WHERE aa.is_active = TRUE
    ORDER BY ag.position, aa.position;

    INSERT INTO l_temp_table(key, result_type) VALUES
        ('point_geometry', 'string'),
        ('email', 'string'),
        ('ts', 'string'),
        ('feature_uuid', 'string'),
        ('changeset_id', 'integer'),
        ('static_water_level_group_id', 'integer'),
        ('amount_of_deposited_group_id', 'integer'),
        ('yield_group_id', 'integer');

     l_xml_elements_query := $query$
        (SELECT string_agg(row::text, '') FROM (SELECT xmlelement(name element, xmlattributes(key as name, CASE WHEN (result_type = 'DropDown' OR result_type = 'Text') THEN 'string' ELSE lower(result_type) END AS type)) AS row FROM l_temp_table) AS data)
    $query$;

    l_xml_query := $query$
        SELECT xmlelement(name "complexType", xmlattributes('WaterpointType' as name), xmlelement(name "complexContent", xmlelement(name sequence, xmlelement(name element, xmlattributes('location' AS name, 'gml:PointPropertyType' AS type)), %s::xml)));
    $query$;

    l_query := format(l_xml_query, l_xml_elements_query);

    execute l_query INTO l_xml_elements;

    l_xml := l_xml || l_xml_elements;
    l_xml := l_xml || '</schema>';

    RETURN l_xml;
  END;
$func$;


create or replace function core_utils.wfs_get_capabilities_xml(i_hostname text, i_version text)
    RETURNS text
LANGUAGE plpgsql
AS $func$
DECLARE
    l_xml text;
BEGIN
    l_xml := '<?xml version="1.0" encoding="UTF-8"?>';
    l_xml := l_xml || xmlcomment('http://cite.opengeospatial.org/pub/cite/files/edu/wfs/text/operations.html#getcapabilities');

    IF i_version = '1.0.0' THEN
        l_xml := l_xml || '<WFS_Capabilities version="1.0.0" xmlns="http://www.opengis.net/wfs" xmlns:wfs="http://schemas.opengis.net/wfs/1.0.0/wfs.xsd" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">';
    ELSIF i_version = '1.1.0' THEN
        l_xml := l_xml || '<WFS_Capabilities version="1.1.0" xmlns="http://www.opengis.net/wfs" xmlns:wfs="http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">';
    ELSE
        l_xml := l_xml || '<WFS_Capabilities version="2.0.2" xmlns="http://www.opengis.net/wfs/2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd">';
    END IF;

    IF i_version = '1.0.0' THEN
        l_xml := l_xml || xmlelement(name "Service", xmlelement(name "Title", 'WFS'), xmlelement(name "Name", 'WFS'), xmlelement(name "Abstract"));
    ELSE
        l_xml := l_xml || xmlelement(name "ows:ServiceIdentification", xmlelement(name "ows_Title", 'WFS'), xmlelement(name "ows:Abstract"), xmlelement(name "ows:ServiceType", xmlattributes('http://www.opengeospatial.org/' AS "codeSpace"), 'WFS'), xmlelement(name "ows:ServiceTypeVersion", '1.1.0'), xmlelement(name "ows:ServiceTypeVersion", '2.0.0'), xmlelement(name "ows:ServiceTypeVersion", '2.0.2'));
    END IF;

    IF i_version = '1.0.0' THEN
        l_xml := l_xml || xmlelement(name "Capability", xmlelement(name "Request", xmlelement(name "GetCapabilities", xmlelement(name "DCPType", xmlelement(name "HTTP", xmlelement(name "Get", xmlattributes((i_hostname || '?') AS "onlineResource"))))), xmlelement(name "DescribeFeatureType", xmlelement(name "DCPType", xmlelement(name "HTTP", xmlelement(name "Get", xmlattributes((i_hostname || '?') AS "onlineResource"))))), xmlelement(name "GetFeature", xmlelement(name "DCPType", xmlelement(name "HTTP", xmlelement(name "Get", xmlattributes((i_hostname || '?') AS "onlineResource")))))));
    ELSE
        l_xml := l_xml || xmlelement(name "ows:OperationsMetadata", xmlelement(name "ows:Operation", xmlattributes('GetCapabilities' AS name), xmlelement(name "ows:DCP", xmlelement(name "ows:HTTP", xmlelement(name "ows:Get", xmlattributes(i_hostname || '?' AS "xlink:href")), xmlelement(name "ows:Post", xmlattributes(i_hostname AS "xlink:href"))))), xmlelement(name "ows:Parameter", xmlattributes('AcceptVersions' AS "ows:Parameter"), xmlelement(name "ows:AllowedValues", xmlelement(name "ows:Value", '2.0.2'), xmlelement(name "ows:Value", '2.0.0'), xmlelement(name "ows:Value", '1.1.0'), xmlelement(name "ows:Value", '1.0.0'))), xmlelement(name "ows:Operation", xmlattributes('GetFeature' AS name), xmlelement(name "ows:DCP", xmlelement(name "ows:HTTP", xmlelement(name "ows:Get", xmlattributes(i_hostname || '?' AS "xlink:href")), xmlelement(name "ows:Post", xmlattributes(i_hostname AS "xlink:href"))))), xmlelement(name "ows:Operation", xmlattributes('DescribeFeatureType' AS name), xmlelement(name "ows:DCP", xmlelement(name "ows:HTTP", xmlelement(name "ows:Get", xmlattributes(i_hostname || '?' AS "xlink:href")), xmlelement(name "ows:Post", xmlattributes(i_hostname AS "xlink:href"))))));
    END IF;

    IF i_version = '1.0.0' THEN
        l_xml := l_xml || xmlelement(name "FeatureTypeList", xmlelement(name "FeatureType", xmlelement(name "Name", xmlattributes(i_hostname AS "xmlns:gn"), 'gn:Waterpoints'), xmlelement(name "Title", 'Waterpoints'), xmlelement(name "SRS", 'EPSG:4326'), xmlelement(name "LatLongBoundingBox", xmlattributes('-180' AS minx, '-90' AS miny, '180' AS maxx, '90' AS maxy))));
    ELSE
        l_xml := l_xml || xmlelement(name "FeatureTypeList", xmlelement(name "FeatureType", xmlelement(name "Name", xmlattributes(i_hostname AS "xmlns:gn"), 'gn:Waterpoints'), xmlelement(name "Title", 'Waterpoints'), xmlelement(name "DefaultCRS", 'http://www.opengis.net/def/crs/epsg/0/4326'), xmlelement(name "OutputFormats", xmlelement(name "Format", 'application/xml; subtype="gml/3.2.1"')), xmlelement(name "ows:WGS84BoundingBox", xmlelement(name "ows:LowerCorner", '-180.000000 -90.000000'), xmlelement(name "ows:UpperCorner", '180.000000 90.000000'))));
    END IF;

    l_xml := l_xml || '</WFS_Capabilities>';

    RETURN l_xml;
  END;
$func$;
