-- DROP SCHEMA IF EXISTS core_utils CASCADE;
CREATE SCHEMA IF NOT EXISTS core_utils;

create EXTENSION if not exists tablefunc;

CREATE OR REPLACE FUNCTION core_utils.q_feature_attributes(
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision,
    VARIADIC i_attributes character varying[])
  RETURNS SETOF record
STABLE
LANGUAGE plpgsql
AS $fun$
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

    v_geofence GEOMETRY(Polygon, 4326);

BEGIN

    -- TODO: handle geofence - move to a function
    SELECT geofence INTO v_geofence FROM public.webusers_webuser WHERE id=i_webuser_id;

    IF v_geofence IS NULL THEN
        v_geofence := ST_PolygonFromText('POLYGON((-180 -90, -180 90, 180 90, 180 -90, -180 -90))', 4326);
    END IF;

    IF NOT FOUND THEN
        v_geofence := null;
    END IF;

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
                FROM crosstab($ct$select ff.feature_uuid, fav.attribute_id, ao.option
   from features.feature ff
		 JOIN features.feature_attribute_value fav
			 ON ff.feature_uuid = fav.feature_uuid
		 JOIN attributes_attributeoption ao
			 ON fav.attribute_id=ao.attribute_id AND ao.value = val_int
   where fav.attribute_id = %L and fav.is_active = True
	AND ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%L, %L), ST_Point(%L, %L)), 4326) AND
		 st_within(ff.point_geometry, %L)
   order by 1,2$ct$) AS (feature_uuid UUID, value varchar))$$,
        v_attributes.key, v_attributes.id, i_min_x, i_min_y, i_max_x, i_max_y, v_geofence
    ));
            ELSEIF v_attributes.result_type = 'Decimal' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select ff.feature_uuid, fav.attribute_id, fav.val_real
      from features.feature ff
		 JOIN features.feature_attribute_value fav
			 ON ff.feature_uuid = fav.feature_uuid
   where fav.attribute_id = %L and fav.is_active = True
   	AND ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%L, %L), ST_Point(%L, %L)), 4326) AND
		 st_within(ff.point_geometry, %L)
   order by 1,2$ct$) AS (feature_uuid UUID, value decimal))$$,
        v_attributes.key, v_attributes.id, i_min_x, i_min_y, i_max_x, i_max_y, v_geofence
    ));
        ELSEIF v_attributes.result_type = 'Integer' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select ff.feature_uuid, fav.attribute_id, fav.val_int
      from features.feature ff
		 JOIN features.feature_attribute_value fav
			 ON ff.feature_uuid = fav.feature_uuid
   where fav.attribute_id = %L and fav.is_active = True
      	AND ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%L, %L), ST_Point(%L, %L)), 4326) AND
		 st_within(ff.point_geometry, %L)
   order by 1,2$ct$) AS (feature_uuid UUID, value integer))$$,
        v_attributes.key, v_attributes.id, i_min_x, i_min_y, i_max_x, i_max_y, v_geofence
    ));
     ELSEIF v_attributes.result_type = 'Text' THEN
            v_attr_q := array_append(v_attr_q, format($$%I AS (
                SELECT *
                FROM crosstab($ct$select ff.feature_uuid, fav.attribute_id, fav.val_text
      from features.feature ff
		 JOIN features.feature_attribute_value fav
			 ON ff.feature_uuid = fav.feature_uuid
   where fav.attribute_id = %L and fav.is_active = True
      	AND ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%L, %L), ST_Point(%L, %L)), 4326) AND
		 st_within(ff.point_geometry, %L)
   order by 1,2$ct$) AS (feature_uuid UUID, value varchar))$$,
        v_attributes.key, v_attributes.id, i_min_x, i_min_y, i_max_x, i_max_y, v_geofence
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
$fun$;


-- *
-- core_utils.get_features
-- *

CREATE OR REPLACE FUNCTION core_utils.get_features(
    i_webuser_id integer,
    i_min_x DOUBLE PRECISION, i_min_y DOUBLE PRECISION, i_max_x DOUBLE PRECISION, i_max_y DOUBLE PRECISION
)
    RETURNS SETOF TEXT
STABLE
LANGUAGE plpgsql
AS $body$
DECLARE
    v_attributes public.attributes_attribute%ROWTYPE;
    q_attributes text[];
    q_attributes_types text[];
    t_result_type varchar;

    v_query text;
BEGIN

  FOR v_attributes IN EXECUTE $$SELECT * FROM public.attributes_attribute ORDER BY position, id$$ LOOP

      IF v_attributes.result_type = 'DropDown' THEN
          t_result_type := 'VARCHAR';
      ELSEIF v_attributes.result_type = 'Decimal' THEN
          t_result_type := 'DECIMAL';
      ELSEIF v_attributes.result_type = 'Integer' THEN
          t_result_type := 'INTEGER';
      ELSEIF v_attributes.result_type = 'Text' THEN
          t_result_type := 'VARCHAR';
      END IF;

      q_attributes = array_append(q_attributes, format($$%L$$, v_attributes.key));

      q_attributes_types = array_append(q_attributes_types, format($$%I %s$$, v_attributes.key, t_result_type));
  END LOOP;

    v_query := format($q$
         SELECT coalesce(jsonb_agg(row) :: TEXT, '[]') AS data
FROM (WITH attrs AS (
             SELECT *
             FROM core_utils.q_feature_attributes(%L, %L, %L, %L, %L, %s) AS (
                  feature_uuid UUID,
                  %s
                  )
         )
         SELECT
             to_char(chg.ts_created, 'YY-MM-DD HH24:MI:SS') as _last_update,
             wu.email AS _webuser,
             attrs.*
         FROM attrs
             JOIN features.feature ff ON ff.feature_uuid = attrs.feature_uuid
             JOIN features.changeset chg ON chg.id = ff.changeset_id
             JOIN webusers_webuser wu ON chg.webuser_id = wu.id

         WHERE ff.is_active = TRUE) row
$q$, i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, array_to_string(q_attributes, ', '), array_to_string(q_attributes_types, ', '));

    RETURN QUERY EXECUTE v_query;
END;
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

create or replace function core_utils.add_feature(i_feature_uuid uuid, i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text) returns text
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
                v_decimal_value := v_new_attributes -> v_key;

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
                    i_feature_uuid, i_feature_changeset, v_attr_id, v_text_value::text
                );
                -- deactivate old attribute data
                UPDATE features.feature_attribute_value SET is_active = FALSE
                WHERE feature_uuid=i_feature_uuid AND is_active = TRUE and changeset_id != i_feature_changeset AND attribute_id = v_attr_id;

        ELSEIF v_result_type = 'DropDown'
            THEN
                v_int_value := v_new_attributes -> v_key;

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
-- * tabiya, beneficiaries
-- *

CREATE OR REPLACE FUNCTION core_utils.get_dashboard_group_count(
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision)
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
            core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'beneficiaries') AS (feature_uuid uuid, tabiya varchar, beneficiaries integer)
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
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision
)
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
        core_utils.q_feature_attributes($1, $2, $3, $4, $5,'tabiya', 'fencing_exists') AS (feature_uuid uuid, tabiya varchar, fencing_exists varchar)
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
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision
)
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
        core_utils.q_feature_attributes($1, $2, $3, $4, $5,'tabiya', 'fencing_exists') AS (feature_uuid uuid, tabiya varchar, functioning varchar)
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
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision
)
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
        core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'scheme_type') AS (feature_uuid uuid, tabiya varchar, scheme_type varchar)
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
    i_webuser_id integer,
    i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision
)
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

        FROM core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'yield') AS (feature_uuid UUID, tabiya VARCHAR, yield DECIMAL)
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
create or replace function core_utils.get_feature_history_by_uuid(
    i_uuid uuid, i_start timestamp with time zone , i_end timestamp with time zone) returns text
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

l_query := 'select
    json_agg(row)::text
from (
     select
         ff.feature_uuid,
		chg.id as changeset_id,
		wu.email,
		chg.ts_created as ts
    from
        features.feature ff
    JOIN
        features.changeset chg ON ff.changeset_id = chg.id
    JOIN
        webusers_webuser wu ON chg.webuser_id = wu.id
    where
        ff.feature_uuid = ''' || i_uuid || '''
    and
        chg.ts_created >= ''' || i_start || '''::date
    and
        chg.ts_created <= ''' || i_end || '''::date
    order by ts desc
 ) row';

	execute l_query into l_result;

	return l_result;
	end
$$;
