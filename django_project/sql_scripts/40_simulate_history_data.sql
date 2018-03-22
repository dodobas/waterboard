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

    SELECT id INTO v_yield_attr_id FROM public.attributes_attribute WHERE key = 'yield';
    SELECT id INTO v_static_water_attr_id FROM public.attributes_attribute WHERE key = 'static_water_level';

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


END LOOP;

END;

$$;



select test_data.generate_history_data();

-- TODO quick and dirty fix for same values

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
