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
SELECT coalesce(jsonb_agg(row) :: TEXT, '[]') AS data
FROM (
select * from core_utils.q_feature_attributes('name', 'amount_of_deposited', 'ave_dist_from_near_village', 'fencing_exists', 'beneficiaries', 'constructed_by', 'date_of_data_collection', 'depth', 'functioning', 'fund_raise', 'funded_by', 'general_condition', 'intervention_required', 'kushet', 'livestock', 'name_and_tel_of_contact_person', 'power_source', 'pump_type', 'reason_of_non_functioning', 'result', 'scheme_type', 'static_water_level', 'tabiya', 'water_committe_exist', 'year_of_construction', 'yield') AS (
							feature_uuid uuid,
							name varchar,
							amount_of_deposited integer,
							ave_dist_from_near_village numeric,
							fencing_exists varchar,
							beneficiaries integer,
							constructed_by varchar,
							date_of_data_collection varchar,
							depth decimal,
							functioning varchar,
							fund_raise varchar,
							funded_by varchar,
							general_condition varchar,
							intervention_required varchar,
							kushet varchar,
							livestock integer,
							name_and_tel_of_contact_person varchar,
							power_source varchar,
							pump_type varchar,
							reason_of_non_functioning varchar,
							result varchar,
							scheme_type varchar,
							static_water_level decimal,
							tabiya varchar,
							water_committe_exist varchar,
							year_of_construction integer,
							yield decimal
							)
		 ) row

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

CREATE OR REPLACE FUNCTION core_utils.add_feature(i_feature_uuid uuid, i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
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

    v_new_attributes := cast(i_feature_attributes AS JSONB);

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
            v_int_value := v_new_attributes -> v_key;


            -- only insert new data if the value has changed
            IF v_int_value != v_fav_active.val_int or v_fav_active.val_int is NULL THEN
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
                v_decimal_value := v_new_attributes -> v_key;

                -- only insert new data if the value has changed
                IF v_decimal_value != v_fav_active.val_real or v_fav_active.val_real IS NULL THEN
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
                -- for whatever reason text values must be extracted as text (oprerator ->>)
                v_text_value := v_new_attributes ->> v_key;

                -- only insert new data if the value has changed
                IF v_text_value != v_fav_active.val_text or v_fav_active.val_text is null THEN
                    -- insert new data
                    INSERT INTO features.feature_attribute_value (feature_uuid, changeset_id, attribute_id, val_text)
                    VALUES (
                        i_feature_uuid, i_feature_changeset, v_attr_id, v_text_value::text
                    );
                    -- deactivate old attribute data
                    UPDATE features.feature_attribute_value SET is_active = FALSE
                    WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;
                END IF;

        ELSEIF v_result_type = 'DropDown'
            THEN
                v_int_value := v_new_attributes -> v_key;

                -- only insert new data if the value has changed
                IF NOT (v_allowed_values @> ARRAY [v_int_value :: TEXT])
                THEN
                    RAISE 'Attribute "%" value "%" is not allowed: %', v_key, v_int_value, v_allowed_values;
                END IF;

                IF v_int_value != v_fav_active.val_int or v_fav_active.val_int is null THEN

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
-- core_utils.get_attributes
-- *


create or replace function core_utils.get_attributes()
RETURNS text AS
$BODY$
select jsonb_agg(row)::text
FROM
(
	select label, key, required
	from public.attributes_attribute
	order by position, id
) row;
$BODY$
  LANGUAGE SQL STABLE;



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

create EXTENSION if not exists tablefunc;

CREATE OR REPLACE FUNCTION core_utils.q_feature_attributes(VARIADIC i_attributes varchar[])
    RETURNS setof record
    AS $BODY$
-- *
-- this function is used to pivot feature attributes so that we can simply select the data
-- *
DECLARE
    q_attributes text;
    v_query text;
    q_feature_values text[];
    t_ident_attributes text[];
    t_attr_conditions text[];
    t_attr text;
    t_first_attribute text;
    v_attr_q text[];
    v_attributes public.attributes_attribute%ROWTYPE;

BEGIN

    t_first_attribute := quote_ident(i_attributes[1]);

    FOREACH t_attr IN ARRAY i_attributes LOOP
        t_ident_attributes := array_append(t_ident_attributes, quote_ident(t_attr));
        t_attr_conditions := array_append(t_attr_conditions, format($$%I.feature_uuid=%I.feature_uuid$$, t_first_attribute, t_attr));
    END LOOP;

    v_query := format($$SELECT feature_uuid, %s FROM ( WITH $$, array_to_string(t_ident_attributes, ', '));

  q_attributes := format('SELECT * FROM attributes_attribute
    WHERE key = ANY(%L)', i_attributes);

  FOR v_attributes IN EXECUTE q_attributes LOOP

        IF v_attributes.result_type = 'DropDown' THEN
        v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select feature_uuid, fav.attribute_id, ao.option
   from features.feature_attribute_value fav join attributes_attributeoption ao ON fav.attribute_id=ao.attribute_id AND ao.value = val_int
   where fav.attribute_id = %L and fav.is_active = True
   order by 1,2$ct$) AS (feature_uuid UUID, value varchar))$$,
        v_attributes.key, v_attributes.id
    ));
            ELSEIF v_attributes.result_type = 'Decimal' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select feature_uuid, fav.attribute_id, fav.val_real
   from features.feature_attribute_value fav
   where fav.attribute_id = %L and fav.is_active = True
   order by 1,2$ct$) AS (feature_uuid UUID, value decimal))$$,
        v_attributes.key, v_attributes.id
    ));
        ELSEIF v_attributes.result_type = 'Integer' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select feature_uuid, fav.attribute_id, fav.val_int
   from features.feature_attribute_value fav
   where fav.attribute_id = %L and fav.is_active = True
   order by 1,2$ct$) AS (feature_uuid UUID, value integer))$$,
        v_attributes.key, v_attributes.id
    ));
     ELSEIF v_attributes.result_type = 'Text' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select feature_uuid, fav.attribute_id, fav.val_text
   from features.feature_attribute_value fav
   where fav.attribute_id = %L and fav.is_active = True
   order by 1,2$ct$) AS (feature_uuid UUID, value varchar))$$,
        v_attributes.key, v_attributes.id
    ));
    END IF;
    END LOOP;

    q_feature_values := array_append(q_feature_values, format($$%I.feature_uuid as feature_uuid$$, t_first_attribute));

    FOREACH t_attr IN ARRAY i_attributes LOOP
        q_feature_values := array_append(q_feature_values, format($$%I.value as %I$$, t_attr, t_attr));
    END LOOP;

    v_query := v_query || array_to_string(v_attr_q, ', ');

    v_query := v_query || format(
            $$SELECT %s FROM %s WHERE %s) fav$$,
            array_to_string(q_feature_values, ', '), array_to_string(t_ident_attributes, ', '), array_to_string(t_attr_conditions, ' AND ')
    );

    return QUERY EXECUTE v_query;
END;
    $BODY$
  LANGUAGE plpgsql STABLE;


-- *
-- * tabiya, beneficiaries
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_group_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
select
        jsonb_agg(row)::text
FROM
(
    select
        tabiya as group,
        count(tabiya) as cnt,
        sum(beneficiaries) as beneficiaries
    FROM
            core_utils.q_feature_attributes('tabiya', 'beneficiaries') AS (feature_uuid uuid, tabiya varchar, beneficiaries integer)
    GROUP BY
	    tabiya
    ORDER BY
	    count(tabiya) DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;

-- *
-- * tabiya, fencing_exists, count
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_fencing_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
select jsonb_agg(row)::text
FROM
(
    select
        tabiya as group,
        fencing_exists as fencing,
        count(fencing_exists) as cnt
    FROM
        core_utils.q_feature_attributes('tabiya', 'fencing_exists') AS (feature_uuid uuid, tabiya varchar, fencing_exists varchar)
    GROUP BY
        tabiya, fencing
    ORDER BY
        tabiya, cnt DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;

-- *
-- * tabiya, functioning, count
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_functioning_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
select jsonb_agg(row)::text
FROM
(
    select
        tabiya as group,
        functioning as functioning,
        count(functioning) as cnt
    FROM
        core_utils.q_feature_attributes('tabiya', 'fencing_exists') AS (feature_uuid uuid, tabiya varchar, functioning varchar)
    GROUP BY
        tabiya, functioning
    ORDER BY
        tabiya, cnt DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;


-- *
-- * tabiya, scheme_type, count
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_schemetype_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
select
    jsonb_agg(row)::text
FROM
(
    select
        tabiya as group,
        scheme_type as scheme_type,
        count(scheme_type) as cnt
    FROM
        core_utils.q_feature_attributes('tabiya', 'scheme_type') AS (feature_uuid uuid, tabiya varchar, scheme_type varchar)
    GROUP BY
        tabiya, scheme_type
    ORDER BY
        tabiya, cnt DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;



-- *
-- * tabiya, yield_group, count
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_yieldgroup_count(
    min_x double precision,
    min_y double precision,
    max_x double precision,
    max_y double precision)
  RETURNS text AS
$BODY$
select jsonb_agg(row)::text
FROM
    ( WITH yield_groups AS (
        SELECT
            feature_uuid,
            tabiya,
            CASE
            WHEN yield < 0
                THEN -1
            WHEN yield >= 0 AND yield < 1
                THEN 1
            WHEN yield >= 1 AND yield < 3
                THEN 2
            WHEN yield >= 3 AND yield < 5
                THEN 3
            WHEN yield >= 5 AND yield < 7
                THEN 4
            WHEN yield >= 7 AND yield < 100
                THEN 5
            ELSE 6
            END AS yield_group

        FROM core_utils.q_feature_attributes('tabiya', 'yield') AS (feature_uuid UUID, tabiya VARCHAR, yield DECIMAL)
    )
    SELECT tabiya as group, yield_group, count(yield_group) as cnt
    FROM yield_groups
    GROUP BY tabiya, yield_group
    ORDER BY tabiya, cnt DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;


-- *
-- * feature by uuid history table | fetch feature history by uuid
-- *
create or replace function
	core_utils.get_feature_history_by_uuid(i_uuid uuid, i_start date, i_end date) returns text
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
	-- 2578c3a6-a306-4756-957a-d1fd92aad1d1
l_query := 'select
		json_agg(row)::text
from (
	select
		ww.full_name as username,
		ww.email,
		fav.feature_uuid,
        ch.id as changeset_id,
        ch.ts_created as ts
	from
		features.feature_attribute_value fav
	join
		features.changeset ch
	on
		fav.changeset_id = ch.id
	join
		public.webusers_webuser ww
	on
		ch.webuser_id = ww.id

	where
		fav.feature_uuid = ''' || i_uuid || '''
	and
		ch.ts_created >= ''' || i_start || '''::date
	and
		ch.ts_created <= ''' || i_end || '''::date
	order by ts desc
) row';

	execute l_query into l_result;

	return l_result;
	end
$$
LANGUAGE PlPgSQL;
