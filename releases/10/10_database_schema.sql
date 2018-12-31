
CREATE OR REPLACE FUNCTION core_utils.const_table_deleted_data()
  RETURNS text IMMUTABLE LANGUAGE SQL AS
$$SELECT 'features.deleted_data'$$;

CREATE or replace FUNCTION core_utils.insert_feature(i_changeset_id integer, i_feature_attributes text, i_feature_uuid uuid default NULL)
  RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    l_attribute_values text;
    l_feature_uuid uuid;
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

    -- get data related to the changeset
    select wu.email, chg.ts_created FROM features.changeset chg JOIN webusers_webuser wu ON chg.webuser_id = wu.id
    WHERE chg.id = i_changeset_id
    INTO l_email, l_ts_created;

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
            ST_SetSRID(ST_Point(longitude, latitude), 4326) as point_geometry,
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

    l_attribute_list := core_utils.prepare_attributes_list();

    l_attribute_values := core_utils.json_to_data(i_feature_attributes);


    -- generate query that will insert data to history_data
    l_query := format(l_query_template, core_utils.const_table_active_data(), l_attribute_list, l_email, l_ts_created, l_feature_uuid, i_changeset_id, l_attribute_list, l_attribute_values);
    EXECUTE l_query;

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, core_utils.const_table_history_data(), l_attribute_list, l_email, l_ts_created, l_feature_uuid, i_changeset_id, l_attribute_list, l_attribute_values);
    EXECUTE l_query;

    RETURN l_feature_uuid;
END;
$$;


-- *
-- core_utils.create_feature , used in features/views
-- *
-- CREATE or replace FUNCTION core_utils.create_feature(i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
CREATE or replace FUNCTION core_utils.create_feature(i_changeset_id integer, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid uuid;

BEGIN
    l_feature_uuid := core_utils.insert_feature(i_changeset_id, i_feature_attributes, NULL);

    return l_feature_uuid;
END;
$$;


-- *
-- * core_utils.update_feature, used in attributes/views
-- *
CREATE or replace FUNCTION core_utils.update_feature(i_changeset_id integer, i_feature_uuid uuid, i_feature_attributes text)
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

    l_feature_uuid := core_utils.insert_feature(i_changeset_id, i_feature_attributes, i_feature_uuid);

    -- currently we are relading the page on success so no point on having this call for now
    return '{}';
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
END;
$$;


-- *
-- * core_utils.delete_feature
-- *
-- * delete a feature, removes feature from active_data and adds it to the deleted_data
-- *

CREATE or replace FUNCTION core_utils.delete_feature(i_feature_uuid uuid)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_query text;
    l_returned_uuid uuid;
BEGIN

    l_query := format($query$INSERT INTO %s select * from %s where feature_uuid=%L returning feature_uuid;$query$, core_utils.const_table_deleted_data(), core_utils.const_table_active_data(), i_feature_uuid);

    EXECUTE l_query into l_returned_uuid;

    if l_returned_uuid is null then
        return format('Feature not found: %s', i_feature_uuid);
    end if;

    l_query := format($qq$DELETE FROM %s WHERE feature_uuid = %L;$qq$, core_utils.const_table_active_data(), i_feature_uuid);
    EXECUTE l_query;

    return null;
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
END;
$$;


CREATE or replace FUNCTION core_utils.insert_feature(i_changeset_id integer, i_feature_attributes text, i_feature_uuid uuid default NULL)
  RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    l_attribute_values text;
    l_feature_uuid uuid;
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

    -- get data related to the changeset
    select wu.email, chg.ts_created FROM features.changeset chg JOIN webusers_webuser wu ON chg.webuser_id = wu.id
    WHERE chg.id = i_changeset_id
    INTO l_email, l_ts_created;

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
            ST_SetSRID(ST_Point(longitude, latitude), 4326) as point_geometry,
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

    l_attribute_list := core_utils.prepare_attributes_list();

    l_attribute_values := core_utils.json_to_data(i_feature_attributes);


    -- generate query that will insert data to history_data
    l_query := format(l_query_template, core_utils.const_table_active_data(), l_attribute_list, l_email, l_ts_created, l_feature_uuid, i_changeset_id, l_attribute_list, l_attribute_values);
    EXECUTE l_query;

    -- generate query that will insert data to active_data
    l_query := format(l_query_template, core_utils.const_table_history_data(), l_attribute_list, l_email, l_ts_created, l_feature_uuid, i_changeset_id, l_attribute_list, l_attribute_values);
    EXECUTE l_query;

    RETURN l_feature_uuid;
END;
$$;


-- *
-- core_utils.create_feature , used in features/views
-- *
-- CREATE or replace FUNCTION core_utils.create_feature(i_feature_changeset integer, i_feature_point_geometry geometry, i_feature_attributes text)
CREATE or replace FUNCTION core_utils.create_feature(i_changeset_id integer, i_feature_attributes text)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_feature_uuid uuid;

BEGIN
    l_feature_uuid := core_utils.insert_feature(i_changeset_id, i_feature_attributes, NULL);

    return l_feature_uuid;
END;
$$;


-- *
-- * core_utils.update_feature, used in attributes/views
-- *
CREATE or replace FUNCTION core_utils.update_feature(i_changeset_id integer, i_feature_uuid uuid, i_feature_attributes text)
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

    l_feature_uuid := core_utils.insert_feature(i_changeset_id, i_feature_attributes, i_feature_uuid);

    -- currently we are relading the page on success so no point on having this call for now
    return '{}';
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
END;
$$;


-- *
-- * core_utils.delete_feature
-- *
-- * delete a feature, removes feature from active_data and adds it to the deleted_data
-- *

CREATE or replace FUNCTION core_utils.delete_feature(i_feature_uuid uuid)
  RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    l_query text;
    l_returned_uuid uuid;
BEGIN

    l_query := format($query$INSERT INTO %s select * from %s where feature_uuid=%L returning feature_uuid;$query$, core_utils.const_table_deleted_data(), core_utils.const_table_active_data(), i_feature_uuid);

    EXECUTE l_query into l_returned_uuid;

    if l_returned_uuid is null then
        return format('Feature not found: %s', i_feature_uuid);
    end if;

    l_query := format($qq$DELETE FROM %s WHERE feature_uuid = %L;$qq$, core_utils.const_table_active_data(), i_feature_uuid);
    EXECUTE l_query;

    return null;
    -- RETURN core_utils.get_feature_by_uuid_for_changeset(i_feature_uuid);
END;
$$;


-- *
-- * Add attributes attribute column active_data
-- *
create or replace function core_utils.add_active_data_column(i_new ATTRIBUTES_ATTRIBUTE)
   RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_query TEXT;
    l_attribute_type text;
    l_field_name text;
BEGIN

  select
      case
          when i_new.result_type = 'Integer' THEN 'int'
          when i_new.result_type = 'Decimal' THEN 'numeric(17, 8)'
          when i_new.result_type = 'Text' THEN 'text'
          when i_new.result_type = 'DropDown' THEN 'text'
          ELSE null
      end as val,
      i_new.key as field_name
  into
    l_attribute_type, l_field_name;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_active_data(), l_field_name, l_attribute_type);
  execute v_query;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_history_data(), l_field_name, l_attribute_type);
  execute v_query;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_deleted_data(), l_field_name, l_attribute_type);
  execute v_query;

end
$$;


-- create cache table for deleted data
select core_utils.create_dashboard_cache_table(core_utils.const_table_deleted_data());
