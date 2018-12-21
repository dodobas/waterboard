CREATE or replace FUNCTION core_utils.filter_attribute_options(attribute_key text, option_search_str text)
  RETURNS text
STABLE
LANGUAGE SQL
AS $$

with attribute_options as (
SELECT ao.attribute_id, ao.option, ao.value, ao.position, ao.id
from attributes_attribute aa
    JOIN attributes_attributeoption ao ON aa.id = ao.attribute_id
WHERE option ilike '%' || $2 || '%' aND aa.key = $1 ORDER BY ao.position DESC
LIMIT 25)

SELECT
  json_build_object(
    'attribute_id', aa.id ,
    'attribute_key', aa.key,
--     'attribute_group_id', ag.id,
--     'attribute_group_key', ag.key,
--     'attribute_group_label', ag.label,
    'attribute_options', json_agg(
        json_build_object(
            'option_value', ao.value,
            'option_id', ao.id,
            'option', ao.option)
        ORDER BY ao.position DESC)
    )::text
    FROM
        attributes_attribute aa
    JOIN
        attributes_attributegroup ag
    ON
        aa.attribute_group_id = ag.id
    LEFT JOIN
          attribute_options ao ON ao.attribute_id=aa.id
    where
      aa.key = $1

    group by
      aa.id,
      aa.key;

$$;


CREATE OR REPLACE FUNCTION core_utils.recalculate_dropdown_positions() RETURNS void
LANGUAGE plpgsql
AS $query$
  DECLARE
    r record;
    t_query text;
BEGIN
    FOR r IN select key from attributes_attribute where result_type = 'DropDown'
    LOOP
      t_query := format($inner_update$
      with dropdown_counts as (
        select %I as option, count(*) as data_count from %s group by %I
), data as (
  select ao.id, aa.key, ao.option, ao.position, dc.data_count

  from attributes_attribute aa JOIN attributes_attributeoption ao on aa.id = ao.attribute_id JOIN dropdown_counts dc ON dc.option=ao.option

  where aa.key=%L)

        update attributes_attributeoption SET position = data.data_count
from data
where attributes_attributeoption.id = data.id;
        $inner_update$,
        r.key, core_utils.const_table_active_data(), r.key, r.key
        );
     -- raise notice '%', t_query;
     execute t_query;

    END LOOP;
END$query$;


create or replace function core_utils.filter_dashboard_chart_data(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json default '{}'::json) returns text
LANGUAGE plpgsql
AS $$
declare
    l_query text;
    l_result text;
begin
    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);

    l_query := $CHART_QUERY$
select (
(
        -- Woreda COUNT
        select
            json_build_object(
                'woreda', coalesce(jsonb_agg(woredaRow), '[]'::jsonb)
            )
        FROM
        (
            select
                woreda as group,
                count(woreda) as cnt,
                sum(beneficiaries::int) as beneficiaries
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                woreda
            ORDER BY
                count(woreda) DESC
        ) woredaRow
)::jsonb || (
-- beneficiaries stats
    select
        jsonb_build_object(
            'datastats', coalesce(row_to_json(dataRow.*), '{}')::jsonb
        )
        FROM (
            select
                sum(beneficiaries)        as total_beneficiaries,
                min(beneficiaries)        as min_beneficiaries,
                avg(beneficiaries) :: int as avg_beneficiaries,
                max(beneficiaries)        as max_beneficiaries,
                sum(cnt)                  as total_features,
                min(cnt)                  as min_features,
                avg(cnt) :: int           as avg_features,
                max(cnt)                  as max_features
            FROM (
                SELECT count(*) as cnt, sum(beneficiaries) as beneficiaries
                FROM tmp_dashboard_chart_data
                GROUP BY woreda, tabiya
            ) as grouped
    ) as dataRow
)::jsonb || (
-- scheme_type stats
    select jsonb_build_object(
         'schemetype_stats', coalesce(
            (select jsonb_object_agg(option, row_to_json(scheme_type_agg.*))
            FROM (
                WITH aggregate AS (
                    select scheme_type as option, count(scheme_type) as total_features, sum(beneficiaries) as total_beneficiaries
                    from tmp_dashboard_chart_data
                    group by scheme_type
                )
                SELECT aao.option, total_features, total_beneficiaries
                FROM attributes_attributeoption aao
                LEFT JOIN aggregate ON aao.option = aggregate.option

                WHERE attribute_id = (SELECT id from attributes_attribute where key = 'scheme_type')
                ORDER BY total_beneficiaries DESC nulls last
            ) as scheme_type_agg), '{}')
    )
)::jsonb || (
-- TABIA COUNT
    select
        json_build_object(
            'tabiya', coalesce(jsonb_agg(tabiyaRow), '[]'::jsonb)
        )
    FROM
    (
        select
            tabiya as "group",
            count(tabiya) as cnt,
            sum(beneficiaries::int) as beneficiaries
        FROM
            tmp_dashboard_chart_data
        group by
          woreda,
          tabiya
        order by
          cnt desc
    ) tabiyaRow
    )::jsonb
|| (


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
        g.group as water_committee_exists,
        cnt
      from (
        SELECT UNNEST(ARRAY ['Yes', 'No', 'Unknown']) AS group
      ) g
      left join (
            select
                water_committee_exists as water_committee_exists,
                count(water_committee_exists) as cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                water_committee_exists
            ORDER BY
                cnt DESC
      ) d
      on d.water_committee_exists = g.group
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
                'group', functioning,
                'cnt', count(functioning)
            ) as func
        FROM
            tmp_dashboard_chart_data
        GROUP BY
            functioning
    ) d


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
        'cnt', d.cnt,
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
          MIN(static_water_level) AS MIN,
          max(static_water_level) AS max,
          count(static_water_level) AS cnt,
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
                min(yield) AS min,
                max(yield) AS max,
                count(yield) AS cnt,
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
)::jsonb

)::text;$CHART_QUERY$;

    execute l_query into l_result;

    return l_result;
end;
$$;
