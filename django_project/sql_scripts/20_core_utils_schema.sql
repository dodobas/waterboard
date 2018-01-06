-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

-- *
-- core_utils.get_events
-- *

CREATE OR REPLACE FUNCTION core_utils.get_events(min_x double precision, min_y double precision, max_x double precision, max_y double precision)
  RETURNS text
STABLE
LANGUAGE SQL
AS $body$
SELECT coalesce(jsonb_agg(d.row) :: TEXT, '[]') AS data
FROM (
         SELECT jsonb_build_object(
                    'assessment', coalesce(attributes.row, '{}' :: JSONB),
                    'id', ft.feature_uuid :: TEXT,
                    'created_date', chg.ts_created,
                    'data_captor', wu.email,
                    'overall_assessment', ft.overall_assessment,
                    'name', ft.name,
                    'geometry', ARRAY [ST_X(ft.point_geometry), ST_Y(ft.point_geometry)],
                    'enriched', TRUE,
                    'country', 'Unknown') AS row
         FROM
             features.feature ft

             LEFT JOIN LATERAL (
                       SELECT
                           fav.feature_uuid,
                           jsonb_object_agg(
                               dg.name || '/' || da.name,
                               jsonb_build_object(
                                   'option', '',
                                   'value', row_to_json(fav) -> CASE
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
                                                                END,
                                   'description', ''
                               )
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
             ft.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($1, $2), ST_Point($3, $4)), 4326)
             AND ft.is_active = TRUE
         GROUP BY ft.feature_uuid, chg.ts_created, wu.email, ft.overall_assessment, ft.name, ft.point_geometry,
             attributes.row
         ORDER BY ft.name) d;

$body$;

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

CREATE OR REPLACE FUNCTION core_utils.add_feature(i_feature_uuid uuid, i_feature_changeset integer, i_feature_name character varying, i_feature_point_geometry geometry, i_feature_overall_assessment integer, i_feature_attributes text)
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
    v_text_value     VARCHAR(32);

    v_fav_active     features.FEATURE_ATTRIBUTE_VALUE;
BEGIN
    -- we first update feature and it's attributes and set is_active = FALSE
    UPDATE features.feature
    SET is_active = FALSE
    WHERE feature_uuid = i_feature_uuid AND is_active = TRUE;

    IF NOT FOUND
    THEN
        RAISE EXCEPTION 'NOT FOUND - Feature uuid=%, is_active=TRUE', i_feature_uuid;
    END IF;

    -- insert a new feature

    INSERT INTO features.feature (feature_uuid, changeset_id, name, point_geometry, overall_assessment, is_active)
    VALUES (
        i_feature_uuid, i_feature_changeset, i_feature_name, i_feature_point_geometry, i_feature_overall_assessment,
        TRUE
    );

    v_new_attributes := cast(i_feature_attributes AS JSONB);

    -- collect type definitions
    CREATE TEMPORARY TABLE tmp_attribute_types ON COMMIT DROP AS
        SELECT
            aa.id,
            ag.name || '/' || aa.name AS key,
            aa.result_type,
            array_agg(ao.value)       AS allowed_values
        FROM attributes_attribute aa
            JOIN attributes_attributegroup ag ON aa.attribute_group_id = ag.id
            LEFT JOIN attributes_attributeoption ao ON ao.attribute_id = aa.id
        GROUP BY aa.id, ag.name || '/' || aa.name, aa.result_type;

    -- collect current active rows
    CREATE TEMPORARY TABLE tmp_fav_active ON COMMIT DROP AS
        SELECT *
        FROM features.feature_attribute_value
        WHERE feature_uuid = i_feature_uuid AND is_active = TRUE;

    FOR v_key IN SELECT *
                 FROM jsonb_object_keys(v_new_attributes) LOOP
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
            v_int_value = v_new_attributes -> v_key;

            -- only insert new data if the value has changed
            IF v_int_value != v_fav_active.val_int THEN
                -- insert new data
                INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
                VALUES (
                    i_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
                );
                -- deactivate old attribute data
                UPDATE features.feature_attribute_value SET is_active = FALSE
                WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;
            END IF;

        ELSEIF v_result_type = 'Decimal'
            THEN
                v_decimal_value = v_new_attributes -> v_key;

                -- only insert new data if the value has changed
                IF v_decimal_value != v_fav_active.val_real THEN
                    -- insert new data
                    INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_real)
                    VALUES (
                        i_feature_uuid, i_feature_changeset, v_attr_id, v_decimal_value
                    );
                    -- deactivate old attribute data
                    UPDATE features.feature_attribute_value SET is_active = FALSE
                    WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;
                END IF;

        ELSEIF v_result_type = 'Text'
            THEN
                v_text_value = v_new_attributes -> v_key;

                -- only insert new data if the value has changed
                IF v_text_value != v_fav_active.val_text THEN
                    -- insert new data
                    INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_text)
                    VALUES (
                        i_feature_uuid, i_feature_changeset, v_attr_id, v_text_value
                    );
                    -- deactivate old attribute data
                    UPDATE features.feature_attribute_value SET is_active = FALSE
                    WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;
                END IF;

        ELSEIF v_result_type = 'DropDown'
            THEN
                v_int_value = v_new_attributes -> v_key;

                -- only insert new data if the value has changed
                IF NOT (v_allowed_values @> ARRAY [v_int_value :: TEXT])
                THEN
                    RAISE 'Attribute "%" value "%" is not allowed: %', v_key, v_int_value, v_allowed_values;
                END IF;

                IF v_int_value != v_fav_active.val_int THEN

                    -- insert new data
                    INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_int)
                    VALUES (
                        i_feature_uuid, i_feature_changeset, v_attr_id, v_int_value
                    );
                    -- deactivate old attribute data
                    UPDATE features.feature_attribute_value SET is_active = FALSE
                    WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;
                END IF;
        END IF;

    END LOOP;

    RETURN core_utils.get_event_by_uuid(i_feature_uuid);
END;

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
                    'assessment', coalesce(attributes.row, '{}'::JSONB),
                    'id', ft.feature_uuid :: TEXT,
                    'created_date', chg.ts_created,
                    'data_captor', wu.email,
                    'overall_assessment', ft.overall_assessment,
                    'name', ft.name,
                    'geometry', ARRAY [ST_X(ft.point_geometry), ST_Y(ft.point_geometry)],
                    'enriched', TRUE,
                    'country', 'Unknown') AS row
         FROM
             features.feature ft

             LEFT JOIN LATERAL (
                       SELECT
                           fav.feature_uuid,
                           jsonb_object_agg(
                               dg.name || '/' || da.name,
                               jsonb_build_object(
                                   'option', '',
                                   'value', row_to_json(fav) -> CASE
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
                                                                END,
                                   'description', ''
                               )
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

         GROUP BY ft.feature_uuid, chg.ts_created, wu.email, ft.overall_assessment, ft.name, ft.point_geometry,
             attributes.row

         ORDER BY ft.name) d;
$BODY$
LANGUAGE SQL
STABLE
COST 100;


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
-- core_utils.get_dashboard_group_count
-- *
CREATE OR REPLACE FUNCTION core_utils.get_dashboard_group_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
-- '23';'tabiya';'DropDown';1
-- select * from core_utils.get_dashboard_group_count(-180, -90, 180, 90);
 select
	json_agg(row)::text
from
(
	select
		aao.option as group,
		count(fav.id) as cnt
	from
		features.feature_attribute_value fav
	join
		public.attributes_attributeoption aao
	on
		aao.attribute_id = fav.attribute_id
	and
		aao.value = fav.val_int
	where
	-- TODO get id from public.attributes_attribute
		fav.attribute_id = 23
	and
		fav.is_active = True
	group by
		aao.option
	order by
		cnt
) row;

$BODY$
  LANGUAGE sql STABLE
  COST 100;
