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

    RAISE NOTICE '%', _query;

    RETURN _query;

END
$$;
