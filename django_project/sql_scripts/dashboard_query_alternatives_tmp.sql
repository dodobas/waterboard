drop table tmp_dashboard_chart_data;
select * from core_utils.get_dashboard_chart_data(
    1, -180, -90, 180, 90, 'Hbret'
);


select format(', and tabiya = %L', 1)

select coalesce(nullif(quote_nullable(null), ''), format(', and tabiya = %I', 1))

select format(', and tabiya = %s', 1)
CREATE OR REPLACE FUNCTION core_utils.get_dashboard_chart_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision,
    i_tabiya varchar default ''::varchar
)
    RETURNS text AS
$BODY$

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
                'amount_of_deposited', 'beneficiaries', 'fencing_exists', 'functioning','tabiya'
            ) as (
                point_geometry geometry,
                email varchar,
                ts timestamp with time zone,
                feature_uuid uuid,
                amount_of_deposited text,
                beneficiaries text,
                fencing_exists text,
                functioning text,
                tabiya text
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
$BODY$
LANGUAGE PLPGSQL volatile;


-- tmp_dashboard_chart_data

select
    jsonb_agg(mapRow)::text
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
) mapRow;




    -- create temporary table so the core_utils.get_core_dashboard_data is called only once
    -- filtering / aggregation / statistics should be taken from tmp_dashboard_chart_data
    create temporary table tmp_dashboard_chart_data
    -- on commit drop
        as
        select
            /*tabiya,
            beneficiaries,
            fencing_exists,*/ *
        FROM
            core_utils.get_core_dashboard_data(
                'amount_of_deposited', 'beneficiaries', 'fencing_exists', 'functioning','tabiya'
            ) as (
                point_geometry geometry,
                email varchar,
                ts timestamp with time zone,
                feature_uuid uuid,
                amount_of_deposited text,
                beneficiaries text,
                fencing_exists text,
                functioning text,
                tabiya text
            )
        WHERE
            point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326);
--     -- point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($2, $3), ST_Point($4, $5)), 4326)
--     ;
-- FENCING COUNT DATA (YES, NO, UNKNOWN)
    select
            json_build_object(
                'functioningCnt', jsonb_agg(functioningRow)
            )
    FROM
    (
        select
            functioning as functioning,
            count(functioning) as cnt
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            functioning
        ORDER BY
            cnt DESC
    ) functioningRow

    select json_build_object(
        'functioningData', data
    )
    FROM
        (

            SELECT
                functioning        AS functioning,
                json_agg(feature_uuid :: TEXT),
                count(functioning) AS cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                functioning
            ORDER BY
                cnt DESC
        ) data;


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
    ) amountOfDepositedData;


 select * from  core_utils.get_core_dashboard_data(
                        'amount_of_deposited', 'beneficiaries', 'fencing_exists', 'functioning', 'tabiya'
                    ) as (
                    point_geometry geometry,
                    email varchar,
                    ts timestamp with time zone,
                    feature_uuid uuid,
                    amount_of_deposited text,
                    beneficiaries text,
                    fencing_exists text,
                    functioning text,
                    tabiya text
                );








select json_agg(
		jsonb_build_object(
			'group', d.range_group,
			'cnt', d.cnt,
			'min', d.min,
			'max', d.max
		)
)::text
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
)d;

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
        sum(beneficiaries::int) as beneficiaries
    FROM
        core_utils.get_core_dashboard_data(
            'beneficiaries', 'fencing_exists', 'tabiya'
        ) as (point_geometry geometry, email varchar, ts timestamp with time zone, feature_uuid uuid, beneficiaries text, tabiya text)
           --  core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'beneficiaries') AS (feature_uuid uuid, tabiya varchar, beneficiaries integer)
    WHERE
         point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($2, $3), ST_Point($4, $5)), 4326)
    GROUP BY
	    tabiya
    ORDER BY
	    count(tabiya) DESC
) row;
$BODY$
  LANGUAGE SQL STABLE;



select
    tabiya as group,
    count(tabiya) as cnt,
    sum(beneficiaries::int) as beneficiaries,
    count(fencing_exists) over (aprtition by )
from core_utils.get_core_dashboard_data(
    'beneficiaries', 'fencing_exists', 'tabiya'
) as (
     point_geometry geometry,
     email varchar,
     ts timestamp with time zone,
     feature_uuid uuid,
     beneficiaries text,
     fencing_exists text,
     tabiya text
 )


 WHERE
     attribute_key = 'tabiya' and val in( 'Hbret', 'Tsaeda-Ambora' ,'Gobagubo')
or
        attribute_key = 'beneficiaries'
and
    point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326);





select jsonb_agg(row)::text FROM (
    select
            ff.feature_uuid,
        ST_X(point_geometry) as lng,
        ST_Y(point_geometry) as lat
    from
            features.feature ff
    join (
        select
                feature_uuid from
            core_utils.q_feature_attributes(%s, %s, %s, %s, %s, 'tabiya') AS (feature_uuid UUID, tabiya VARCHAR)
                WHERE tabiya = %s

        ) d
    on
            ff.feature_uuid = d.feature_uuid
 where
     is_active = True) row  (self.request.user.id, coord[0], coord[1], coord[2], coord[3], tabiya)


-- //////////////////////////////////////////////////////////////////




select * from core_utils.get_core_dashboard_data(1, -180, -90, 180, 90, 'yield', 'amount_of_deposited');


SELECT *
                FROM
crosstab(
'select attribute_id, attribute_key, val from core_utils.get_core_dashboard_data(
    1, -180, -90, 180, 90, ''kushet'', ''tabiya''
) ORDER BY 1,2' )as cp
( attribute_id int, kushet VARCHAR, tabiya VARCHAR);





select attribute_key, val from core_utils.get_core_dashboard_data(
    1, -180, -90, 180, 90, 'tabiya', 'beneficiaries'
);




select * from crosstab(
'select feature_uuid, coalesce(attribute_key, '') as tabiya, coalesce(val, '') as beneficiaries from core_utils.get_core_dashboard_data(
    1, -180, -90, 180, 90, ''tabiya'', ''beneficiaries''
) ORDER BY 1,2' )as cp
(feature_uuid uuid ,tabiya varchar, beneficiaries VARCHAR);

select feature_uuid, attribute_key, val from core_utils.get_core_dashboard_data(
    1, -180, -90, 180, 90, 'tabiya', 'beneficiaries'
) ORDER BY 1,2;








-- ime tabije
-- koor
-- yes, no
-- 69ms
create or replace function
    core_utils.get_core_dashboard_data(
        i_webuser_id integer,
        i_min_x double precision,
        i_min_y double precision,
        i_max_x double precision,
        i_max_y double precision,
        VARIADIC i_attributes character varying[]
    ) returns setof core_utils.core_dashboard_data_record
AS $$

select
    ff.feature_uuid,
    fav.attribute_id,
-- uncomment for validating results
--     fav.val_real,
--     fav.val_int,
--     fav.val_text,
--     aa.result_type,
--     ao.option,
    aa.label as attribute_label,
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
   aa.key = any($6)
   -- (select key from attributes_attribute)
	 --('beneficiaries', 'tabyia', 'amount_of_deposited', 'kushet')
AND
 --ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%L, %L), ST_Point(%L, %L)), 4326)
 ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point($2, $3), ST_Point($4, $5)), 4326)
       -- ff.point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326)
AND
		 st_within(ff.point_geometry, (
					SELECT
							coalesce(geofence, ST_PolygonFromText('POLYGON((-180 -90, -180 90, 180 90, 180 -90, -180 -90))', 4326))
					FROM
							public.webusers_webuser WHERE id=$1
		 ));


--SELECT geofence FROM public.webusers_webuser WHERE id=1
   --st_within(ST_PolygonFromText('POLYGON((-180 -90, -180 90, 180 90, 180 -90, -180 -90))', 4326))
-- ST_PolygonFromText('POLYGON((-180 -90, -180 90, 180 90, 180 -90, -180 -90))', 4326)
$$
STABLE
LANGUAGE SQL;





SELECT * FROM core_utils.get_dashboard_fencing_count(1, -180, -90, 180, 90) limit 100;



truncate features.changeset cascade;
truncate features.feature_attribute_value cascade;
select test_data.generate_history_data();

select * from core_utils.get_feature_history_by_uuid(
									'27b3603f-c650-4866-a9e9-dae6d438094a',
									(now() - '6 month'::interval)::date,
									(now())::date
							) as t;


select * from
	(
		SELECT
			ww.email,
			fav.feature_uuid,
			ch.ts_created AS ts,
			fav.attribute_id,
			fav.changeset_id,
			row_number() OVER (partition by feature_uuid ORDER BY ch.ts_created desc) as row_nmbr
FROM
features.feature_attribute_value fav
JOIN
features.changeset ch
ON
fav.changeset_id = ch.id
JOIN
PUBLIC.webusers_webuser ww
ON
ch.webuser_id = ww.id

WHERE
fav.feature_uuid = '27b3603f-c650-4866-a9e9-dae6d438094a'
AND
ch.ts_created > now() - '180 day':: INTERVAL
AND
ch.ts_created <= now()

)r where row_nmbr = 1;


select
		chg.id,
		wu.full_name,
		wu.email,
		chg.ts_created as ts
-- 		ch.ts_created as ts,
-- 		fav.val_real as value
	from
		features.feature ff JOIN features.changeset chg ON ff.changeset_id = chg.id
		JOIN webusers_webuser wu ON chg.webuser_id = wu.id

	where
		ff.feature_uuid = '27b3603f-c650-4866-a9e9-dae6d438094a'
AND
chg.ts_created > now() - '180 day':: INTERVAL
AND
chg.ts_created <= now()
	order by ts desc;




-- select json_agg(row) from
--   (select * from
--    core_utils.q_feature_attributes('name','amount_of_deposited','ave_dist_from_near_village','fencing_exists','beneficiaries','constructed_by','date_of_data_collection','depth','functioning','fund_raise','funded_by','general_condition','intervention_required','kushet','livestock','name_and_tel_of_contact_person','power_source','pump_type','reason_of_non_functioning','result','scheme_type','static_water_level','tabiya','water_committe_exist','year_of_construction','yield') as (feature_uuid uuid, name varchar,amount_of_deposited integer,ave_dist_from_near_village decimal,fencing_exists varchar,beneficiaries integer,constructed_by varchar,date_of_data_collection varchar,depth decimal,functioning varchar,fund_raise varchar,funded_by varchar,general_condition varchar,intervention_required varchar,kushet varchar,livestock integer,name_and_tel_of_contact_person varchar,power_source varchar,pump_type varchar,reason_of_non_functioning varchar,result varchar,scheme_type varchar,static_water_level decimal,tabiya varchar,water_committe_exist varchar,year_of_construction integer,yield decimal) limit 5) row;


copy (core_utils.export_all()) to '/tmp/ddd.csv' with delimiter ';' csv HEADER  ENCODING 'UTF-8';


create function core_utils.export_all() returns text
LANGUAGE plpgsql
AS
$$
  declare
    r RECORD;
   _query text;
    attributes text;
    attributes_types text;
  BEGIN

_query:= 'select
    string_agg( quote_literal(key) , '','')
from (
  select
      key, _result_type
  from
      attributes_attribute
  order by id
) d';
RAISE NOTICE '%', _query;
    execute _query into attributes;

    _query:=    'select
    string_agg(key || '' '' || _result_type, '','')
from (
  select
      key, _result_type
  from
      attributes_attribute
  order by id
) d';
    execute _query into attributes_types;



    _query:= 'select * from
   core_utils.q_feature_attributes(' || attributes  || ') as (feature_uuid uuid, ' || attributes_types || ');';


    return _query;

  end
$$;


create or replace function core_utils.get_fencing_dashboard_chart_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision) returns text
STABLE
LANGUAGE SQL
AS $$
--
-- select * from core_utils.get_fencing_dashboard_chart_data(1, -180, -90, 180, 90);
select
	json_agg(
		jsonb_build_object(
			'grouped', d.grouped,
			'min', d.min,
			'max', d.max,
			'cnt', d.sum,
			'filter_group', d.filter_group
		)
	)::text as data
from (
	SELECT
		json_agg(
            jsonb_build_object(
                    'groups', groups,
                    'fencing', fencing,
                    'cnt', cnt
            )
        ) AS grouped,
		min(cnt) AS min,
		max(cnt) AS max,
		sum(cnt) AS sum,
		CASE -- TODO build dynamically
		WHEN cnt >= 100
			THEN 5
		WHEN cnt >= 50 AND cnt < 100
			THEN 4
		WHEN cnt >= 10 AND cnt < 50
			THEN 3
		WHEN cnt < 10
			THEN 2
		ELSE 1
		END AS filter_group
	FROM (
         SELECT
             tabiya                AS groups,
             fencing_exists        AS fencing,
             count(fencing_exists) AS cnt
         FROM
             core_utils.q_feature_attributes(
                 -- 1, -180, -90, 180, 90, 'tabiya', 'fencing_exists'
                 $1, $2, $3, $4, $5, 'tabiya', 'fencing_exists'
             ) AS (
                feature_uuid UUID, tabiya VARCHAR, fencing_exists VARCHAR
             )
         GROUP BY
             tabiya, fencing
     ) r
	GROUP BY filter_group
) d;

$$;



create or replace function core_utils.get_dashboard_group_chart_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision) returns text
STABLE
LANGUAGE SQL
AS $$
--
-- select * from core_utils.get_fencing_dashboard_chart_data(1, -180, -90, 180, 90);
select
	json_agg(
		jsonb_build_object(
			'grouped', d.grouped,
			'cnt_min', d.cnt_min,
            'cnt_max', d.cnt_max,
            'cnt_sum', d.cnt_sum,
            'beneficiaries_min', d.beneficiaries_min,
            'beneficiaries_max', d.beneficiaries_max,
            'beneficiaries_sum', d.beneficiaries_sum,
			'filter_group', d.filter_group
		)
	)::text as data
from (
	SELECT
		json_agg(
            jsonb_build_object(
                'groups', groups,
                'beneficiaries', beneficiaries,
                'cnt', cnt
            )
        ) AS grouped,
		min(cnt) AS cnt_min,
		max(cnt) AS cnt_max,
		sum(cnt) AS cnt_sum,
        min(beneficiaries) AS beneficiaries_min,
		max(beneficiaries) AS beneficiaries_max,
		sum(beneficiaries) AS beneficiaries_sum,
		CASE -- TODO build dynamically
		WHEN cnt >= 5000
			THEN 5
		WHEN cnt >= 1000 AND cnt < 2000
			THEN 4
		WHEN cnt >= 500 AND cnt < 1000
			THEN 3
		WHEN cnt < 500
			THEN 2
		ELSE 1
		END AS filter_group
	FROM (
        select
            tabiya as groups,
            count(tabiya) as cnt,
            sum(beneficiaries) as beneficiaries
        FROM
--                 core_utils.q_feature_attributes(1, -180, -90, 180, 90, 'tabiya', 'beneficiaries')
                core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'beneficiaries')
        AS
                (feature_uuid uuid, tabiya varchar, beneficiaries integer)
        GROUP BY
            tabiya
        ORDER BY
            count(tabiya) DESC

             --    core_utils.get_dashboard_group_count(1, -180, -90, 180, 90)
     ) r
	GROUP BY filter_group
) d;
$$;



select
    tabiya as group,
    count(tabiya) as cnt,
    sum(beneficiaries) as beneficiaries
FROM
        core_utils.q_feature_attributes($1, $2, $3, $4, $5, 'tabiya', 'beneficiaries') AS (feature_uuid uuid, tabiya varchar, beneficiaries integer)
GROUP BY
    tabiya
ORDER BY
    count(tabiya) DESC;


create function get_fencing_dashboard_chart_data(
    i_webuser_id integer,
    i_min_x double precision,
    i_min_y double precision,
    i_max_x double precision,
    i_max_y double precision) returns text
STABLE
LANGUAGE SQL
AS $$
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
$$;





truncate features.changeset cascade;
truncate features.feature_attribute_value cascade;
select test_data.generate_history_data();

--
CREATE OR REPLACE FUNCTION test_data.generate_history_data()
    RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_ts_created timestamp;
    v_chg_id INTEGER;
    v_yield_attr_id INTEGER;
    v_static_water_attr_id INTEGER;
BEGIN

    SELECT id INTO v_yield_attr_id FROM public.attributes_attribute WHERE label = 'yield';
    SELECT id INTO v_static_water_attr_id FROM public.attributes_attribute WHERE label = 'static_water_level';

FOR v_ts_created IN select generate_series as ts_created from generate_series('2017-06-10T00:00:00'::TIMESTAMP, '2018-01-01T00:00:00'::TIMESTAMP, '10 days') LOOP

    INSERT INTO
			features.changeset (webuser_id, ts_created)
    VALUES
			(1, v_ts_created) RETURNING id INTO v_chg_id;


		UPDATE
			features.feature_attribute_value fav SET is_active = FALSE
		from
			features.feature as ff
		WHERE
			fav.feature_uuid = ff.feature_uuid
		AND
			ff.is_active = TRUE
		AND
			(fav.attribute_id = v_yield_attr_id or fav.attribute_id = v_static_water_attr_id) ;


		INSERT INTO features.feature (
			feature_uuid, point_geometry, changeset_id, is_active, upstream_id
		)
		select
			ff.feature_uuid,
			ff.point_geometry,
			v_chg_id as chanegset_id,
			TRUE as is_active,
			upstream_id
		from
			features.feature as ff
		WHERE
			ff.is_active = TRUE;


		UPDATE
			features.feature aff
		SET
			is_active = FALSE
		from
			features.feature ff
		WHERE
				aff.changeset_id = ff.changeset_id
		AND
				aff.feature_uuid = ff.feature_uuid;

		UPDATE
			features.feature_attribute_value fav SET is_active = FALSE
		from
			features.feature ff
		WHERE
			fav.feature_uuid = ff.feature_uuid
		AND
			fav.changeset_id = ff.changeset_id;


		INSERT INTO features.feature_attribute_value (
			val_text, val_int, val_real, feature_uuid, attribute_id, changeset_id, is_active, ts
		)
		SELECT
			fav.val_text, fav.val_int, fav.val_real, fav.feature_uuid, fav.attribute_id, v_chg_id, TRUE, fav.ts
		FROM
			features.feature_attribute_value fav
		JOIN
			features.feature ff
		ON
				fav.changeset_id = ff.changeset_id
		and
				fav.feature_uuid = ff.feature_uuid;


		-- simulate some random data ... include NULL values
		UPDATE
			features.feature_attribute_value fav
		SET
			val_real = case when random() < 0.2 THEN NULL ELSE (random() * 20 + 1)::decimal(9,2) end
		from
			features.feature ff
		WHERE
			fav.feature_uuid = ff.feature_uuid
		AND
			fav.attribute_id = v_yield_attr_id
		AND
			fav.changeset_id = v_chg_id;


		-- simulate some random data ... include NULL values
		UPDATE
			features.feature_attribute_value fav
		SET
			val_real = case when random() < 0.2 THEN NULL ELSE (random() * 150 + 1)::decimal(9,2) end
		from
			features.feature ff
		WHERE
			fav.feature_uuid = ff.feature_uuid
		AND
			fav.attribute_id = v_static_water_attr_id
		AND
			fav.changeset_id = v_chg_id;


END LOOP;

END;

$$;
