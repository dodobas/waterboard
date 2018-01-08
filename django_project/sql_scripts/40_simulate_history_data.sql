CREATE OR REPLACE FUNCTION test_data.generate_history_data()
    RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_ts_created timestamp;
    v_chg_id INTEGER;
    v_feature_uuid uuid;
    v_yield_attr_id INTEGER;
    v_static_water_attr_id INTEGER;
BEGIN

    SELECT id INTO v_yield_attr_id FROM public.attributes_attribute WHERE label = 'yield';
    SELECT id INTO v_static_water_attr_id FROM public.attributes_attribute WHERE label = 'static_water_level';

FOR v_ts_created IN select generate_series as ts_created from generate_series('2017-06-10T00:00:00'::TIMESTAMP, '2018-01-01T00:00:00'::TIMESTAMP, '10 days') LOOP

    INSERT INTO features.changeset (webuser_id, ts_created)
    VALUES (1, v_ts_created) RETURNING id INTO v_chg_id;


    FOR v_feature_uuid IN select feature_uuid from features.feature WHERE is_active = TRUE LOOP

        -- deactivate yield attribute
        UPDATE features.feature_attribute_value SET is_active = FALSE
        WHERE feature_uuid = v_feature_uuid AND attribute_id = v_yield_attr_id;

        -- simulate some random data ... include NULL values
        INSERT INTO features.feature_attribute_value (val_real, feature_uuid, attribute_id, changeset_id)
            VALUES (case when random() < 0.2 THEN NULL ELSE (random() * 20 + 1)::decimal(9,2) end, v_feature_uuid, v_yield_attr_id, v_chg_id);


        -- deactivate static_water_level attribute
        UPDATE features.feature_attribute_value SET is_active = FALSE
        WHERE feature_uuid = v_feature_uuid AND attribute_id = v_static_water_attr_id;

        -- simulate some random data ... include NULL values
        INSERT INTO features.feature_attribute_value (val_real, feature_uuid, attribute_id, changeset_id)
            VALUES (case when random() < 0.2 THEN NULL ELSE (random() * 150 + 1)::decimal(9,2) end, v_feature_uuid, v_static_water_attr_id, v_chg_id);
    END LOOP;

END LOOP;

END;

$$;


select test_data.generate_history_data();
