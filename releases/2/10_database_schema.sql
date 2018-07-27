-- *
-- * Updated database functions
-- *

create or replace FUNCTION core_utils.cluster_map_points(i_webuser_id integer, i_min_x double precision, i_min_y double precision, i_max_x double precision, i_max_y double precision, i_filters json, i_zoom integer, i_icon_size integer)
  RETURNS SETOF text
LANGUAGE plpgsql
AS $fun$
DECLARE
    l_query text;
BEGIN

    execute core_utils.prepare_filtered_dashboard_data(i_webuser_id, i_min_x, i_min_y, i_max_x, i_max_y, i_filters);

    execute format($$
    create temporary table if not exists tmp_clustered_map_data on commit drop AS
    SELECT
        feature_uuid,
        point_geometry,
        core_utils.get_cluster(%s, %s, %s, %s, point_geometry) as center,
        name,
        yield,
        static_water_level,
        functioning,
        tabiya,
        woreda,
        kushet,
        unique_id
    FROM tmp_dashboard_chart_data
$$, i_zoom, i_icon_size, i_min_x, i_min_y);

    l_query := $$
    select jsonb_agg(mapRow.data)::text
    FROM (

-- non clustered points, count = 1

    select to_jsonb(r) as data FROM (
    select
        name,
        feature_uuid,
        ST_Y(point_geometry) as lat,
        ST_X(point_geometry) as lng,
        yield,
        functioning,
        static_water_level,
        tabiya,
        kushet,
        woreda,
        unique_id
FROM
    tmp_clustered_map_data cl INNER JOIN (
        select center from tmp_clustered_map_data group by center having count(center) = 1) sp
    ON sp.center = cl.center) r

UNION
-- clustered points, count > 1

    select to_jsonb(r) as data
    from (
        select
            cp.count as count,
            ST_Y(cp.cl_point) as lat,
            ST_X(cp.cl_point) as lng
        FROM tmp_clustered_map_data cl INNER JOIN (
                select center, count(center), st_centroid(st_collect(point_geometry)) as cl_point from tmp_clustered_map_data group by center having count(center) > 1) cp ON cp.center = cl.center
    ) r
) mapRow
    $$;

    return QUERY EXECUTE l_query;

END;
$fun$;


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



-- *
-- * clean up, drop function
-- *

drop function if exists core_utils.export_all();
