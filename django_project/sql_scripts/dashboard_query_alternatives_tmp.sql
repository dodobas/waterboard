-- NEW FIELDS
-- Unique_Id;Zone;Woreda;Tabiya;Kushet;Site_Name;Scheme_Type;Year_of_Construction;Result;Depth;Yield;Static_Water_Level;Pump_Type;Power_Source;Functioning;Reason_of_Non_Functioning;Intervention_Required;Beneficiaries;Female Beneficiaries;Livestock;Water_Committe_Exist;Bylaw /Sirit/;Fund Raise;Amount of Fund Deposit;Bank Book;Fencing_Exist;Guard;Ave_Dist_from_near_Village;Funded_By;Constructed_By;General_Condition;Name_of_Data_Collector;Date_of_Data_Collection;Name_and_tel_of_Contact_Person;Latitude;Longitude;Altitude;Picture_of_Scehem
-- *
-- * Base Filter Queries used in filter function
-- *
-- *
-- drop table tmp_dashboard_chart_data;

-- * Core temporary table used to prepopulate dashboard data
create temporary table tmp_dashboard_chart_data as
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
    WHERE
        point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326)
and
  tabiya = 'Zelazile'
and
  fencing_exists ilike 'yes'
and
  functioning ilike 'yes'
and
  funded_by = 'Rest'
and
  water_committe_exist ilike 'yes'
and
  static_water_level::float > 0
and
  static_water_level::float < 100
and
  amount_of_deposited::float > 0
and
  amount_of_deposited::float < 5000
and
  yield::float > 0
and
  yield::float < 100;


-- *
-- * get yield range data from temporary table
-- *
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
 group_data.key::int = d.yield_group_id;



-- *
-- * get AMOUNT OF DEPOSITED RANGE DATA FROM TEMPORARY TABLE
-- *
select json_build_object(
    'amountOfDeposited', chartData
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
             )) as  group_data
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
) chartData;


-- *
-- * get STATIC WATER LEVEL RANGE DATA FROM TEMPORARY TABLE
-- *
select json_build_object(
  'staticWaterLevel', chartData
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
      )) as group_data
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

) chartData;


SELECT * FROM core_utils.get_dashboard_chart_data(1, -180, -90, 180, 90);
SELECT * from  core_utils.filter_dashboard_chart_data(1, -180, -90, 180, 90, '{"tabiya":"Egub","fencing_exists":"No","funded_by":"FoodSecurity","water_committe_exist":"Unknown","static_water_level":4,"amount_of_deposited":4,"yield":5,"should_not_appeat":null}');

SELECT * from  core_utils.filter_dashboard_chart_data(1, -180, -90, 180, 90, '{"tabiya":"Egub","fencing_exists":"No"}');
SELECT * from  core_utils.filter_dashboard_chart_data(1, -180, -90, 180, 90);

drop table tmp_dashboard_chart_data;
create temporary table tmp_dashboard_chart_data
        as
        select *
        FROM
            core_utils.get_core_dashboard_data(
                'amount_of_deposited',
                'beneficiaries',
                'fencing_exists',
                'functioning',
                'funded_by',
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
								static_water_level text,
                tabiya text,
                water_committe_exist text,
							yield text
            )
        WHERE
            point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(-180, -90), ST_Point(180, 90)), 4326);


select * from tmp_dashboard_chart_data
where
  /*tabiya = 'Zelazile'
and*/
  fencing_exists ilike 'yes'
and
  functioning ilike 'yes'
and
  funded_by = 'Catholic'
and
  water_committe_exist ilike 'yes'




create or replace function core_utils.filter_dashboard_chart_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json default '{}'::json) returns text


LANGUAGE plpgsql
AS $$
declare
    l_query text;
    l_result text;
    l_filter_query text;
    l_filter text;
begin
    -- TODO handle ranges
-- {"tabiya":"Egub","fencing_exists":"No","funded_by":"FoodSecurity","water_committe_exist":"Unknown","static_water_level":4,"amount_of_deposited":4,"yield":5,"should_not_appeat":null}
l_filter_query:= format($WHERE_FILTER$
SELECT
  string_agg(' and ' || key || '=' || quote_literal(value), '')
from
  (
    SELECT
      key,
      value
    FROM
        json_each_text(
            '%s' :: JSON
        )
  ) f
where value is not null;$WHERE_FILTER$, i_filters);

    raise notice '%', l_filter_query;
    execute l_filter_query into l_filter;
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
                static_water_level text,
                tabiya text,
                water_committe_exist text,
                yield text
            )
        WHERE
            point_geometry && ST_SetSRID(ST_MakeBox2D(ST_Point(%s, %s), ST_Point(%s, %s)), 4326)
          %s
    $TEMP_TABLE_QUERY$, i_min_x, i_min_y, i_max_x, i_max_y, l_filter);
    raise notice '%',l_query;

        execute l_query;



    l_query := $CHART_QUERY$
select (
(
    -- TABIA COUNT
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
                'fundedByCnt', jsonb_agg(fundedRow)
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

    -- FUNCTIONING COUNT, AND FEATURES PER GROUP LIST (marker coloring)
    select json_build_object(
        'functioningDataCnt', json_agg(func)
    )
    FROM
    (
        SELECT
            jsonb_build_object(
                'group_id', functioning,
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
        'amountOfDepositedRange', depositeData
    )
    FROM
    (
        select
            jsonb_agg(jsonb_build_object(
                'group_id', d.range_group,
                'cnt', d.cnt,
                'min', d.min,
                'max', d.max
            )) as depositeData
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

)::jsonb || (


    -- STATIC WATER LEVEL
    select json_build_object(
        'staticWaterLevelRange', waterData
    )
    FROM
    (
            select
            jsonb_agg(jsonb_build_object(
                'group_id', d.range_group,
                'cnt', d.cnt,
                'min', d.min,
                'max', d.max
            )) as waterData
        from
        (
            SELECT
                min(static_water_level) AS min,
                max(static_water_level) AS max,
                sum(static_water_level) AS cnt,
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
                END AS range_group
            from
            (
                SELECT
                    static_water_level::float
                FROM
                    tmp_dashboard_chart_data

            )r
            GROUP BY
                    range_group
            ORDER BY
                    range_group DESC
        )d
    ) staticWaterLevel

)::jsonb || (

    -- YIELD DATA
    select json_build_object(
        'yieldRange', yieldData
    )
    FROM
        (

        select
            jsonb_agg(jsonb_build_object(
                'group_id', d.range_group,
                'cnt', d.cnt,
                'min', d.min,
                'max', d.max
            )) as yieldData
        from
        (
            SELECT
                min(yield) AS min,
                max(yield) AS max,
                sum(yield) AS cnt,
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
                END AS range_group
            from
            (
                SELECT
                    yield::float
                FROM
                    tmp_dashboard_chart_data

            )r
            GROUP BY
                    range_group
            ORDER BY
                    range_group DESC
        )d
    ) yld


)::jsonb



)::text;$CHART_QUERY$;

    execute l_query into l_result;

    return l_result;
end;
$$;







---------------------------------------------
drop table tmp_dashboard_chart_data;
select * from core_utils.get_dashboard_chart_data(
    1, -180, -90, 180, 90, 'Hbret'
);


select format(', and tabiya = %L', 1)

select coalesce(nullif(quote_nullable(null), ''), format(', and tabiya = %I', 1))

select format(', and tabiya = %s', 1)


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

select * from features.feature_attribute_value;

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












-- OLD RIGINAL
CREATE OR REPLACE FUNCTION test_data.generate_history_data()
    RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_ts_created timestamp;
    v_chg_id INTEGER;
    v_feature features.feature%ROWTYPE;
    v_yield_attr_id INTEGER;
    v_static_water_attr_id INTEGER;
BEGIN

    SELECT id INTO v_yield_attr_id FROM public.attributes_attribute WHERE label = 'yield';
    SELECT id INTO v_static_water_attr_id FROM public.attributes_attribute WHERE label = 'static_water_level';

FOR v_ts_created IN select generate_series as ts_created from generate_series('2017-11-10T00:00:00'::TIMESTAMP, '2018-01-01T00:00:00'::TIMESTAMP, '10 days') LOOP

    INSERT INTO features.changeset (webuser_id, ts_created)
    VALUES (1, v_ts_created) RETURNING id INTO v_chg_id;


    FOR v_feature IN select * from features.feature WHERE is_active = TRUE LOOP

        -- deactivate yield attribute
        -- deactivate static_water_level attribute
        UPDATE features.feature_attribute_value SET is_active = FALSE
        WHERE feature_uuid = v_feature.feature_uuid AND (attribute_id = v_yield_attr_id or attribute_id = v_static_water_attr_id) ;

        INSERT INTO features.feature (feature_uuid, point_geometry, changeset_id, is_active, upstream_id)
            VALUES (v_feature.feature_uuid, v_feature.point_geometry, v_chg_id, TRUE, v_feature.upstream_id);

        UPDATE features.feature SET is_active = FALSE WHERE changeset_id = v_feature.changeset_id AND feature_uuid = v_feature.feature_uuid;


        UPDATE features.feature_attribute_value SET is_active = FALSE WHERE feature_uuid = v_feature.feature_uuid AND changeset_id= v_feature.changeset_id;

        INSERT INTO features.feature_attribute_value
            (val_text, val_int, val_real, feature_uuid, attribute_id, changeset_id, is_active, ts)
            SELECT val_text, val_int, val_real, feature_uuid, attribute_id, v_chg_id, TRUE, ts FROM features.feature_attribute_value
                WHERE feature_uuid = v_feature.feature_uuid AND changeset_id = v_feature.changeset_id;

        -- simulate some random data ... include NULL values
        UPDATE  features.feature_attribute_value
            SET val_real = case when random() < 0.2 THEN NULL ELSE (random() * 20 + 1)::decimal(9,2) end
        WHERE feature_uuid = v_feature.feature_uuid AND attribute_id = v_yield_attr_id aND changeset_id = v_chg_id;

        -- simulate some random data ... include NULL values
        UPDATE  features.feature_attribute_value
            SET val_real = case when random() < 0.2 THEN NULL ELSE (random() * 150 + 1)::decimal(9,2) end
        WHERE feature_uuid = v_feature.feature_uuid AND attribute_id = v_static_water_attr_id aND changeset_id = v_chg_id;

    END LOOP;

END LOOP;

END;

$$;


select test_data.generate_history_data();

