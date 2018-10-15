-- *
-- * core_utils.get_features, used od features / table reports
-- *
-- * has limit / offset pagination - TODO update to use row_number()

CREATE OR REPLACE FUNCTION core_utils.get_features(
    i_webuser_id integer, i_limit integer, i_offset integer, i_order_text text, i_search_predicates text, i_changest_id int DEFAULT NULL
)
  RETURNS SETOF text
LANGUAGE plpgsql
AS $fun$
DECLARE
    v_query            TEXT;
    l_woreda_predicate TEXT;
    l_geofence geometry;
    l_geofence_predicate TEXT;
    l_is_staff         BOOLEAN;
    l_changeset_predicate TEXT;
    l_table_name TEXT;
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
        l_geofence_predicate := format($$ AND st_within(attrs.point_geometry, %L)$$, l_geofence);
    ELSE
        l_geofence_predicate := NULL;
    END IF;

    -- changeset predicate
    IF i_changest_id IS NULL
    THEN
        l_changeset_predicate := '1=1';
        l_table_name := core_utils.const_table_active_data();
    ELSE
        l_changeset_predicate := format('changeset_id = %L', i_changest_id);
        l_table_name := core_utils.const_table_history_data();
    END IF;

    v_query := format($q$
    WITH user_data AS (
    SELECT
             ts as _last_update,
             email AS _webuser,
             *
         FROM %s attrs
         WHERE %s
         %s %s
    )

    select (jsonb_build_object('data', (
         SELECT coalesce(jsonb_agg(row), '[]') AS data
            FROM (
                SELECT * from user_data
                %s
                %s
                LIMIT %s OFFSET %s
            ) row)
        ) || jsonb_build_object(
                'recordsTotal',
                (Select count(*) from user_data)
        ) || jsonb_build_object(
                'recordsFiltered',
                (Select count(*) from user_data %s)
        )
    )::text
    $q$, l_table_name, l_changeset_predicate, l_woreda_predicate, l_geofence_predicate, i_search_predicates, i_order_text, i_limit, i_offset, i_search_predicates);
    RETURN QUERY EXECUTE v_query;
END;

$fun$;


-- *
-- * table data report | build export features data to csv query
-- *
CREATE OR REPLACE FUNCTION core_utils.export_all(search_predicate text, i_changeset_id integer default NULL)
    RETURNS TEXT
LANGUAGE plpgsql
AS
$$
DECLARE
    _query      TEXT;
    l_attribute_list TEXT;
    v_query     TEXT;
    l_changeset_predicate TEXT;
    l_table_name TEXT;

BEGIN

    IF i_changeset_id IS NULL
    THEN
        l_changeset_predicate := NULL;
        l_table_name := core_utils.const_table_active_data();
    ELSE
        l_changeset_predicate := format('and history_data.changeset_id = %L', i_changeset_id);
        l_table_name := core_utils.const_table_history_data();
    END IF;

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
    select feature_uuid, email, changeset_id as changeset, ts, %s from %s %s %s
    ) TO STDOUT WITH CSV HEADER$qveri$, l_attribute_list, l_table_name, search_predicate, l_changeset_predicate);

    RETURN _query;

END
$$;
