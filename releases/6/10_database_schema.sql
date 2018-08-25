-- **
-- Drop functions
-- **

drop function core_utils.insert_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_feature_uuid uuid);
drop function core_utils.create_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text);
drop function core_utils.update_feature(i_feature_uuid uuid, i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text);

-- **
-- Create functions
-- **

CREATE or replace FUNCTION core_utils.insert_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_feature_uuid uuid default NULL, i_changeset_id integer default NULL)
  RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid   uuid;
    l_feature_changeset integer;
    l_query text;
    l_query_template text;
    l_attribute_list text;
    l_email text;
    l_ts_created timestamp with time zone;
BEGIN

    if i_feature_uuid is null THEN
        -- create a new feature uuid
        l_feature_uuid := uuid_generate_v4();
    ELSE
        l_feature_uuid := i_feature_uuid;
    END IF;

    if i_changeset_id is null THEN
        -- create new changeset
        INSERT INTO
            features.changeset (webuser_id)
        VALUES (i_webuser_id) RETURNING id INTO l_feature_changeset;
    ELSE
        l_feature_changeset := i_changeset_id;
    END IF;

    -- get data related to the changeset
    select wu.email, chg.ts_created FROM features.changeset chg JOIN webusers_webuser wu ON chg.webuser_id = wu.id
    WHERE chg.id = l_feature_changeset
    INTO l_email, l_ts_created;

    -- which attributes are available
    l_query := $attributes$
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

    EXECUTE l_query INTO l_attribute_list;

    l_query_template := $OUTER_QUERY$
        insert into %s (
            point_geometry,
            email,
            ts,
            feature_uuid,
            changeset_id,
            static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
            %s
        )

        select
            %L as point_geometry,
            %L as email,
            %L as ts,
            %L as feature_uuid,
            %L as changeset_id,
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
            END AS static_water_level_group_id,
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
            END AS amount_of_deposited_group_id,
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
            END AS yield_group_id,
            %s -- other columns
            FROM (SELECT %s) computed_data

        $OUTER_QUERY$;

    -- generate query that will insert data to history_data
    l_query := format(l_query_template, core_utils.const_table_active_data(), l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, core_utils.const_table_history_data(), l_attribute_list, i_feature_point_geometry, l_email, l_ts_created, l_feature_uuid, l_feature_changeset, l_attribute_list, core_utils.json_to_data(i_feature_attributes));
    EXECUTE l_query;

    RETURN l_feature_uuid;
END;
$$;

CREATE or replace FUNCTION core_utils.create_feature(i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_changeset_id integer DEFAULT NULL)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid   uuid;

BEGIN
    l_feature_uuid := core_utils.insert_feature(i_webuser_id, i_feature_point_geometry, i_feature_attributes, NULL, i_changeset_id);

    return l_feature_uuid;
END;
$$;


-- *
-- * core_utils.update_feature, used in attributes/views
-- *
CREATE or replace FUNCTION core_utils.update_feature(i_feature_uuid uuid, i_webuser_id integer, i_feature_point_geometry geometry, i_feature_attributes text, i_changeset_id integer DEFAULT NULL)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_query text;
    l_feature_uuid uuid;
BEGIN

    -- UPDATE: we need to delete data before inserting an updated data row
    l_query := format($qq$DELETE FROM %s WHERE feature_uuid = %L;$qq$, core_utils.const_table_active_data(), i_feature_uuid);
    EXECUTE l_query;

    l_feature_uuid := core_utils.insert_feature(i_webuser_id, i_feature_point_geometry, i_feature_attributes, i_feature_uuid, i_changeset_id);

    -- currently we are relading the page on success so no point on having this call for now
    return '{}';
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
END;
$$;


