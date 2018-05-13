-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

create EXTENSION if not exists tablefunc;
-- *
-- core_utils.get_features, used od features / table reports
-- *

CREATE OR REPLACE FUNCTION core_utils.get_features(i_webuser_id integer, i_limit integer, i_offset integer, i_order_text text, i_search_name text)
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
             wu.email AS _webuser,
             attrs.*
         FROM public.active_data attrs
             JOIN features.feature ff ON ff.feature_uuid = attrs.feature_uuid
             JOIN features.changeset chg ON chg.id = ff.changeset_id
             JOIN webusers_webuser wu ON chg.webuser_id = wu.id

         WHERE ff.is_active = TRUE
         %s %s
    )

select (jsonb_build_object('data', (
         SELECT coalesce(jsonb_agg(row), '[]') AS data
FROM (
    SELECT * from user_active_data
    %s
    %s
    LIMIT %s OFFSET %s
         ) row)) || jsonb_build_object('recordsTotal', (Select count(*) from user_active_data))
         || jsonb_build_object('recordsFiltered', (Select count(*) from user_active_data %s))
         )::text
$q$, l_woreda_predicate, l_geofence_predicate, i_search_name, i_order_text, i_limit, i_offset, i_search_name);

    RETURN QUERY EXECUTE v_query;
END;

$fun$;




-- *
-- core_utils.create_changeset, used in attributes / features
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
-- core_utils.create_feature
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

    -- we need to refresh the materialized view
   -- execute core_utils.refresh_active_data();

    RETURN v_feature_uuid::text;
END;
$$;



-- *
-- * core_utils.add_feature, used in attributes/views
-- *

CREATE or replace FUNCTION core_utils.add_feature(i_feature_uuid uuid, i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_result text;
BEGIN

    -- DISABLE CURRENT ACTIVE FEATURE
    UPDATE
        features.feature
    SET
        is_active = FALSE
    WHERE
        feature_uuid = i_feature_uuid
    AND
        is_active = TRUE;

    IF NOT FOUND
    THEN
        RAISE EXCEPTION 'NOT FOUND - Feature uuid=%, is_active=TRUE', i_feature_uuid;
    END IF;

    -- INSERT NEW FEATURE

    INSERT INTO
        features.feature (feature_uuid, changeset_id, point_geometry, is_active)
    VALUES (
        i_feature_uuid, i_feature_changeset, i_feature_point_geometry,TRUE
    );



-- new feature -drop down / val_int
-- drop table tmp_add_feature;
/*
Create main temporary table for provided feature uuid
Build based on attributes
'{"funded_by": 1, "water_committe_exist": 1, "name": "knek1", "functioning": 2, "zone":21}'
*/
CREATE TEMPORARY TABLE tmp_add_feature ON COMMIT DROP AS
select
    fav.feature_uuid,
    new_attr.key::text as attribute_key,
    new_attr.value::text as attribute_value,
    i_feature_changeset as changeset_id,
    d.attribute_id,
    d.result_type,
    d.allowed_values
from json_each(
    json_strip_nulls(i_feature_attributes::json)
) new_attr
left join (
   SELECT
        aa.id as  attribute_id,
        aa.key AS attribute_key,
        aa.result_type,
        array_agg(ao.value) AS allowed_values
    FROM attributes_attribute aa
    JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
    LEFT JOIN attributes_attributeoption ao ON ao.attribute_id = aa.id
    GROUP BY aa.id, aa.key, aa.result_type
) d
ON
  new_attr.key::text = d.attribute_key
left join
  features.feature_attribute_value fav
on
  fav.attribute_id = d.attribute_id
where
  fav.feature_uuid = i_feature_uuid
AND
  is_active = TRUE;

-- insert new Dropdown data
INSERT INTO features.feature_attribute_value (feature_uuid, attribute_id, val_int, changeset_id)
select
    feature_uuid,
    attribute_id,
    attribute_value::int,
    i_feature_changeset::int
from
    tmp_add_feature where result_type = 'DropDown';

-- insert new TEXT data
INSERT INTO features.feature_attribute_value (
    feature_uuid, attribute_id, val_text, changeset_id
)
select
    feature_uuid,
    attribute_id,
    nullif(attribute_value::text, ''),
    i_feature_changeset::int
from
    tmp_add_feature where result_type = 'Text';

-- insert new INT data
INSERT INTO features.feature_attribute_value (
    feature_uuid, attribute_id, val_int, changeset_id
)
select
    feature_uuid,
    attribute_id,
    attribute_value::int,
    i_feature_changeset::int
from
    tmp_add_feature where result_type = 'Integer';

-- insert new DECIMAL data TODO DECIMAL(9, 2); ??
INSERT INTO features.feature_attribute_value (
    feature_uuid, attribute_id, val_real, changeset_id
)
select
    feature_uuid,
    attribute_id,
    attribute_value::float,
    i_feature_changeset::int
from
    tmp_add_feature where result_type = 'Decimal';


-- deactivate old attribute data
 UPDATE
    features.feature_attribute_value fav
SET
    is_active = FALSE
from (
    select feature_uuid, attribute_id from tmp_add_feature
) d
where
  fav.feature_uuid = d.feature_uuid
and
  fav.attribute_id = d.attribute_id
and
  is_active = true
and
    changeset_id != i_feature_changeset;


    -- update active data / TODO use a rule instead ?
   execute core_utils.update_active_data_row(i_feature_uuid);

    RETURN core_utils.get_event(i_feature_uuid);
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
	select label, key, required, searchable, orderable
	from public.attributes_attribute
	order by position, id
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
-- and fav.changeset_id = i_changeset_id
    -- ft.changeset_id = i_changeset_id
    l_chg='';
    l_chg_2='';
     if i_changeset_id is not null then
         l_chg:=format('and fav.changeset_id = %s' , i_changeset_id);
         l_chg_2:=format('and ft.changeset_id = %s' , i_changeset_id);
    END IF;
l_query=format($kveri$
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
                          and  ft.feature_uuid = %L
                           %s
                           AND fav.is_active = TRUE
                       GROUP BY fav.feature_uuid
                       ) attributes ON TRUE

                 JOIN features.changeset chg ON ft.changeset_id = chg.id
             JOIN webusers_webuser wu ON chg.webuser_id = wu.id

       WHERE
         ft.feature_uuid = %L
         %s
         AND ft.is_active = TRUE
       GROUP BY ft.feature_uuid, chg.ts_created, wu.email, ft.point_geometry,
         attributes.row
       ORDER BY ft.feature_uuid) d;
       $kveri$, i_uuid, l_chg, i_uuid, l_chg_2);

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
$$
-- select * from core_utils.get_attribute_history_by_uuid('0000866c-1062-478f-a538-117cf88c28ce', 26, now() - '6 month'::interval, now()) as ttt

select
	json_agg(row)::text
from (
	SELECT
		ch.ts_created as ts,
		fav.val_real as value
	FROM
		features.feature_attribute_value fav
	JOIN
		features.changeset ch
	ON
		fav.changeset_id = ch.id
    JOIN attributes_attribute attr ON fav.attribute_id = attr.id

    WHERE
		fav.feature_uuid = $1
	and
		attr.key = $2
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


-- * ACTIVE_DATA MANIPULATION

-- *
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
      alter table features.active_data DROP COLUMN IF EXISTS %s;
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
      alter table features.active_data add column %s %s;
  $alter$, l_field_name, l_attribute_type);

  raise notice '%', v_query;
  execute v_query;

end
$$;


-- * atrributes_attribute RULES to handle active_data table
-- * Add or Drop on delete or on insert RULE on atrributes_attribute table

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

    ELSEIF i_action = 'drop' then

        DROP RULE if exists drop_active_data_field_rule ON public.attributes_attribute;
        DROP RULE if exists active_data_add_field_rule ON public.attributes_attribute;
    END IF;

END
$$;
