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
        g.group as water_committe_exist,
        cnt
      from (
        SELECT UNNEST(ARRAY ['Yes', 'No', 'Unknown']) AS group
      ) g
      left join (
            select
                water_committe_exist as water_committe_exist,
                count(water_committe_exist) as cnt
            FROM
                tmp_dashboard_chart_data
            GROUP BY
                water_committe_exist
            ORDER BY
                cnt DESC
      ) d
      on d.water_committe_exist = g.group
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
