CREATE OR REPLACE FUNCTION test_data.generate_history_data()
    RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
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
        new_changeset_id int
    ) on commit drop;

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
                tmp_simulate_history_data (new_changeset_id, ts_created)
        VALUES
                (lastval(), v_ts_created);
    END LOOP;


insert into public.history_data (
	point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
)
SELECT
  point_geometry,
  email,
  ts,
  feature_uuid,
  new_changeset_id,
  CASE
  WHEN static_water_level :: FLOAT >= 100
    THEN 5
  WHEN static_water_level :: FLOAT >= 50 AND static_water_level :: FLOAT < 100
    THEN 4
  WHEN static_water_level :: FLOAT >= 20 AND static_water_level :: FLOAT < 50
    THEN 3
  WHEN static_water_level :: FLOAT > 10 AND static_water_level :: FLOAT < 20
    THEN 2
  ELSE 1
  END                                                                                     AS static_water_level_group_id,
amount_of_deposited_group_id,
  CASE
  WHEN yield :: FLOAT >= 6
    THEN 5
  WHEN yield :: FLOAT >= 3 AND yield :: FLOAT < 6
    THEN 4
  WHEN yield :: FLOAT >= 1 AND yield :: FLOAT < 3
    THEN 3
  WHEN yield :: FLOAT > 0 AND yield :: FLOAT < 1
    THEN 2
  ELSE 1
  END                                                                                     AS yield_group_id,
  zone,
  woreda,
  tabiya,
  kushet,
  name,
  latitude,
  longitude,
  altitude,
  unique_id,
  scheme_type,
  construction_year,
  result,
  depth,
  yield,
  static_water_level,
  pump_type,
  power_source,
  funded_by,
  constructed_by,
  functioning,
  reason_of_non_functioning,
  intervention_required,
  beneficiaries,
  female_beneficiaries,
  beneficiaries_outside,
  livestock,
  ave_dist_from_near_village,
  general_condition,
  water_committe_exist,
  bylaw_sirit,
  fund_raise,
  amount_of_deposited,
  bank_book,
  fencing_exists,
  guard,
  name_of_data_collector,
  date_of_data_collection,
  picture_of_scehem

FROM (
select
  point_geometry,
  email,
  ts_created as ts,
  feature_uuid,
  new_changeset_id,
  amount_of_deposited_group_id,
  zone,
  woreda,
  tabiya,
  kushet,
  name,
  latitude,
  longitude,
  altitude,
  unique_id,
  scheme_type,
  construction_year,
  result,
  depth,
  case when random() < 0.2 THEN NULL ELSE (random() * 20 + 1)::decimal(9,2) end as yield,
  case when random() < 0.2 THEN NULL ELSE (random() * 150 + 1)::decimal(9,2) end as static_water_level,
  pump_type,
  power_source,
  funded_by,
  constructed_by,
  functioning,
  reason_of_non_functioning,
  intervention_required,
  beneficiaries,
  female_beneficiaries,
  beneficiaries_outside,
  livestock,
  ave_dist_from_near_village,
  general_condition,
  water_committe_exist,
  bylaw_sirit,
  fund_raise,
  amount_of_deposited,
  bank_book,
  fencing_exists,
  guard,
  name_of_data_collector,
  date_of_data_collection,
  picture_of_scehem

-- cross join
from public.active_data, tmp_simulate_history_data) gen_data;

END;

$$;


-- generate history data
select test_data.generate_history_data();

-- overwrite active_data with the last value from history data

delete from public.active_data;

insert into public.active_data (
	point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
)
select
	point_geometry, email, ts , hd.feature_uuid, hd.changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
from public.history_data hd JOIN
    (
        select feature_uuid, max(changeset_id) as changeset_id
        from public.history_data
        group by feature_uuid
    ) last_update ON hd.feature_uuid = last_update.feature_uuid AND hd.changeset_id = last_update.changeset_id;
