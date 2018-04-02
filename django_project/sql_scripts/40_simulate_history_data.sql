CREATE OR REPLACE FUNCTION test_data.generate_history_data()
    RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_numRows		bigint;
    l_query         text;
    l_from          timestamp with time zone;
    l_to            timestamp with time zone;
    v_ts_created    timestamp with time zone;
    v_yield_attr_id INTEGER;
    v_static_water_attr_id INTEGER;
BEGIN

    -- yield id
    l_query:= $q$SELECT
        id
    FROM
        public.attributes_attribute
    WHERE key = 'yield';$q$;
    execute l_query into v_yield_attr_id;

    -- static_water_level id
    l_query:= $q$SELECT
    id
        FROM
    public.attributes_attribute
        WHERE key = 'static_water_level';$q$;

    execute l_query into v_static_water_attr_id;

    create temporary table if not exists tmp_simulate_history_data (
        id serial primary key,
        ts_created timestamp with time zone,
        changeset_id int
    ) on commit drop;

    -- static_water_level id
    l_query:= $q$select
            generate_series as ts_created
        from
            generate_series('2017-06-10T00:00:00'::TIMESTAMP, '2018-01-01T00:00:00'::TIMESTAMP, '10 days');$q$;
    -- generate timestamps and create change sets
    FOR v_ts_created IN
        select
            generate_series as ts_created
        from
            generate_series('2017-06-10T00:00:00'::TIMESTAMP, '2018-01-01T00:00:00'::TIMESTAMP, '10 days') LOOP

        -- insert new change set
        INSERT INTO
                features.changeset (webuser_id, ts_created)
        VALUES
                (1, v_ts_created);

       -- raise notice '%' ,lastval();
        INSERT INTO
                tmp_simulate_history_data (changeset_id, ts_created)
        VALUES
                (lastval(), v_ts_created) ;
    END LOOP;

    -- deactivate yield and static_water_level attribute value
    UPDATE
        features.feature_attribute_value fav SET is_active = FALSE
    from
        features.feature as ff
    WHERE
        fav.feature_uuid = ff.feature_uuid
    AND
        ff.is_active = TRUE
    AND
        (fav.attribute_id = v_yield_attr_id or fav.attribute_id = v_static_water_attr_id);


    -- insert feature data for created change sets
    INSERT INTO features.feature (
        feature_uuid, point_geometry, changeset_id, is_active, upstream_id
    )
    select
        ff.feature_uuid,
        ff.point_geometry,
        tmp.changeset_id,
        FALSE as is_active,
        upstream_id
    from
        features.feature as ff
    cross join
        tmp_simulate_history_data tmp
    WHERE
        ff.is_active = TRUE
    on conflict do NOTHING;


    GET DIAGNOSTICS l_numRows = ROW_COUNT;
    raise notice 'Inserted features.feature: %', l_numRows;

    -- insert new active static_water_attr feature attribute value for created changesets
    INSERT INTO features.feature_attribute_value (
        val_text, val_int, val_real, feature_uuid, attribute_id, changeset_id, is_active, ts
    )
    SELECT
        fav.val_text,
        fav.val_int,
        case when random() < 0.2 THEN NULL ELSE (random() * 150 + 1)::decimal(9,2) end as val_real,
        fav.feature_uuid,
        fav.attribute_id,
        tmp.changeset_id,
        TRUE,
        fav.ts
    FROM
        features.feature_attribute_value fav
    JOIN
        features.feature ff
    ON
        fav.changeset_id = ff.changeset_id
    and
        fav.feature_uuid = ff.feature_uuid
    AND
       fav.attribute_id = v_static_water_attr_id
    cross join
        tmp_simulate_history_data tmp
    on conflict do NOTHING;

    GET DIAGNOSTICS l_numRows = ROW_COUNT;
    raise notice 'Inserted feature_attribute_value static_water_level: %', l_numRows;

    -- insert new yield active feature attribute value for changesets
    INSERT INTO features.feature_attribute_value (
        val_text, val_int, val_real, feature_uuid, attribute_id, changeset_id, is_active, ts
    )
    SELECT
        fav.val_text,
        fav.val_int,
        case when random() < 0.2 THEN NULL ELSE (random() * 20 + 1)::decimal(9,2) end as val_real,
        fav.feature_uuid,
        fav.attribute_id,
        tmp.changeset_id,
        TRUE,
        fav.ts
    FROM
        features.feature_attribute_value fav
    JOIN
        features.feature ff
    ON
        fav.changeset_id = ff.changeset_id
    and
        fav.feature_uuid = ff.feature_uuid
    AND
        fav.attribute_id = v_yield_attr_id
    cross join
        tmp_simulate_history_data tmp
    on conflict do NOTHING;

    GET DIAGNOSTICS l_numRows = ROW_COUNT;
    raise notice 'Inserted feature_attribute_value yield: %', l_numRows;
END;

$$;

-- drop table tmp_simulate_history_data;
-- select * from tmp_simulate_history_data;
select test_data.generate_history_data();
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
    fav.attribute_id = (SELECT id FROM public.attributes_attribute WHERE key = 'yield');


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
    fav.attribute_id = (SELECT id FROM public.attributes_attribute WHERE key = 'static_water_level');
