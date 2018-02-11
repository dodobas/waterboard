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

    raise notice '%', v_query;
    return QUERY EXECUTE v_query;
END;
$fun$;


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

create or replace function core_utils.get_dashboard_chart_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_tabiya character varying DEFAULT ''::character varying) returns text


LANGUAGE plpgsql
AS $$
declare
    l_query text;
    l_result text;
begin
                -- point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326)
    -- create temporary table so the core_utils.get_core_dashboard_data is called only once
    -- filtering / aggregation / statistics should be taken from tmp_dashboard_chart_data
    l_query :=  format($TEMP_TABLE_QUERY$create temporary table tmp_dashboard_chart_data on commit drop
        as
        select *
        FROM
            core_utils.get_core_dashboard_data(
                'amount_of_deposited',
                'beneficiaries',
                'fencing_exists',
                'functioning',
                'funded_by',
                'tabiya',
                'water_committe_exist'
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
                tabiya text,
                water_committe_exist text
            )
        WHERE
            point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%s, %s), ST_Point(%s, %s)), 4326)
    $TEMP_TABLE_QUERY$, i_min_x, i_min_y, i_max_x, i_max_y);

    if nullif(i_tabiya, '') is not null then
        execute (l_query || format(' and tabiya = %L', i_tabiya))::text;
    else
        execute l_query;
    end if;


    l_query := $CHART_QUERY$
select (
(
    -- TABIYA COUNT
    select
            json_build_object(
                'tabiya', jsonb_agg(tabiyaRow)
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
                'fundedBy', jsonb_agg(fundedRow)
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
                'fencingCnt', jsonb_agg(fencingRow)
            )
    FROM
    (
        select
            fencing_exists as fencing,
            count(fencing_exists) as cnt
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            fencing
        ORDER BY
            cnt DESC
    ) fencingRow

)::jsonb || (

    -- WATER COMITEE COUNT DATA (YES, NO, UNKNOWN)
    select
            json_build_object(
                'waterCommiteeCnt', jsonb_agg(waterRow)
            )
    FROM
    (
        select
            water_committe_exist as water_committe_exist,
            count(water_committe_exist) as cnt
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            water_committe_exist
        ORDER BY
            cnt DESC
    ) waterRow


)::jsonb || (

    -- FUNCTIONING COUNT, AND FEATURES PER GROUP LIST (marker colorin)
    select json_build_object(
        'functioningData', json_agg(func)
    )
    FROM
    (
        SELECT
            jsonb_build_object(
                'group', functioning,
                'cnt', count(functioning),
                'features', json_agg(feature_uuid :: TEXT)
            ) as func
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            functioning
    ) d


)::jsonb || (

    -- MAP / MARKER DATA
    select json_build_object(
        'mapData', jsonb_agg(mapRow)
    )
    FROM (
        select
            ff.feature_uuid,
            d.functioning,
            ST_X(ff.point_geometry) as lng,
            ST_Y(ff.point_geometry) as lat
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
        'amountOfDeposited', data
    )
    FROM
    (
        select
            jsonb_agg(jsonb_build_object(
                'group', d.range_group,
                'cnt', d.cnt,
                'min', d.min,
                'max', d.max
            )) as data
        from
        (
            SELECT
                min(amount_of_deposited) AS min,
                max(amount_of_deposited) AS max,
                sum(amount_of_deposited) AS cnt,
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
                END AS range_group
            from
            (
                SELECT
                    amount_of_deposited::int
                FROM
                    tmp_dashboard_chart_data

            )r
            GROUP BY
                    range_group
            ORDER BY
                    range_group DESC
        )d
    ) amountOfDepositedData
    )::jsonb
)::text;$CHART_QUERY$;

    execute l_query into l_result;

    return l_result;
end;
$$;


-- *
-- core_utils.get_features
-- *

create or replace function core_utils.get_features(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision) returns SETOF text
STABLE
LANGUAGE plpgsql
AS $fun$
DECLARE
    l_args text;
    l_field_def text;
    v_query text;
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

    execute v_query into l_args, l_field_def;

    v_query := format($q$
         SELECT coalesce(jsonb_agg(row) :: TEXT, '[]') AS data
FROM (WITH attrs AS (

            select * from core_utils.get_core_dashboard_data(
            %s
        ) as (
        point_geometry geometry, email varchar, ts timestamp with time zone, feature_uuid uuid,
         %s)

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
$q$, l_args, l_field_def, i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y);

    raise notice '%', v_query;

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
