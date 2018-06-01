-- *
-- Create superuser `admin@example.com` with password `admin`
-- *
INSERT INTO public.webusers_webuser (id, password, last_login, email, full_name, is_active, is_staff, is_readonly) VALUES (1, 'pbkdf2_sha256$36000$sY5yuQ0CPLoY$nIMAXnQnL5IhxLwqAWQwL6SQ1IPp0X4yNd20trNiR+8=', null, 'admin@example.com', 'admin', true, true, false);
INSERT INTO public.webusers_webuser (id, password, last_login, email, full_name, is_active, is_staff, geofence, is_readonly) VALUES (2, 'pbkdf2_sha256$36000$rksSvRlrFIB6$ZOA2Mm7yP0I2Y7WNhQ2Xeo7F6ButK7AXdHEh7fKCRks=', null, 'user@example.com', 'user', true, false, '0103000020E6100000010000000700000067752A162717434076342E27A6A32C40D5B81C159C0443406F4DCA7682672C40C303F1F3AA1D434006E763B051152C40EA685CEE383543409C94ADE965372C401F97A311404143409B9E856988712C40EA685CEE38354340C6F918DCB0B52C4067752A162717434076342E27A6A32C40', false);
INSERT INTO public.webusers_webuser (id, password, last_login, email, full_name, is_active, is_staff, is_readonly) VALUES (3, 'pbkdf2_sha256$36000$5wmHGsj6RuSC$k+MjBEMh4GrbUrvRFk5tB2zako0mySjIm0QAwUBmq1A=', null, 'readonly@example.com', 'Readonly User', true, false, true);

-- *
-- Load basic feature information
-- *

INSERT INTO features.changeset (
    id,
    webuser_id,
    ts_created
) select
    1 as id,
    1 as webuser_id,
    '2017-06-01T00:00:00' as ts_created;

-- attribute groups

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (1, 'Location description', 'location_description', 0);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (2, 'Scheme description', 'scheme_description', 1);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (3, 'Service description', 'service_description', 2);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (4, 'Management description', 'management_description', 3);

-- location description

SELECT core_utils.load_dropdown_attribute('Zone', 'Zone', 'zone', 1, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('Woreda', 'Woreda', 'woreda', 1, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('Tabiya', 'Tabiya', 'tabiya', 1, False, True, False, 20);

SELECT core_utils.load_dropdown_attribute('Kushet', 'Kushet', 'kushet', 1, False, True, False, 30);

SELECT core_utils.load_text_attribute('Site_Name', 'Name', 'name', 1, True, True, False, 40);

SELECT core_utils.load_decimal_attribute('Latitude', 'Latitude', 'latitude', 1, True, True, False, 50);

SELECT core_utils.load_decimal_attribute('Longitude', 'Longitude', 'longitude', 1, True, True, False, 60);

SELECT core_utils.load_decimal_attribute('Altitude', 'Altitude', 'altitude', 1, False, True, False, 70);

-- scheme description

SELECT core_utils.load_text_attribute('Unique_Id', 'Unique id', 'unique_id', 2, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('Scheme_Type', 'Scheme Type', 'scheme_type', 2, False, True, False, 10);

SELECT core_utils.load_integer_attribute('Year_of_Construction', 'Year of Construction', 'construction_year', 2, False, True, False, 20);

SELECT core_utils.load_dropdown_attribute('Result', 'Result', 'result', 2, False, True, False, 30);

SELECT core_utils.load_decimal_attribute('Depth', 'Depth', 'depth', 2, False, True, False, 40);

SELECT core_utils.load_decimal_attribute('Yield', 'Yield (l/s)', 'yield', 2, False, True, False, 50);

SELECT core_utils.load_decimal_attribute('Static_Water_Level', 'Static Water Level (m)', 'static_water_level', 2, False, True, False, 60);

SELECT core_utils.load_dropdown_attribute('Pump_Type', 'Pump Type', 'pump_type', 2, False, True, False, 70);

SELECT core_utils.load_dropdown_attribute('Power_Source', 'Power Source', 'power_source', 2, False, True, False, 80);

SELECT core_utils.load_dropdown_attribute('Funded_By', 'Funded By', 'funded_by', 2, False, True, False, 90);

SELECT core_utils.load_dropdown_attribute('Constructed_By', 'Constructed By', 'constructed_by', 2, False, True, False, 100);

-- service description

SELECT core_utils.load_dropdown_attribute('Functioning', 'Functioning', 'functioning', 3, False, True, False, 0);

SELECT core_utils.load_text_attribute('Reason_of_Non_Functioning', 'Reason of Non Functioning', 'reason_of_non_functioning', 3, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('Intervention_Required', 'Intervention Required', 'intervention_required', 3, False, True, False, 20);

SELECT core_utils.load_integer_attribute('Beneficiaries', 'Beneficiaries in 1km', 'beneficiaries', 3, False, True, False, 30);

SELECT core_utils.load_integer_attribute('"Female Beneficiaries"', 'Female Beneficiaries in 1km', 'female_beneficiaries', 3, False, True, False, 40);

SELECT core_utils.load_integer_attribute('Beneficiaries_outside', 'Beneficiaries outside 1km', 'beneficiaries_outside', 3, False, True, False, 50);

SELECT core_utils.load_integer_attribute('Livestock', 'Livestock', 'livestock', 3, False, True, False, 60);

SELECT core_utils.load_decimal_attribute('Ave_Dist_from_near_Village', 'Average distance from nearby village (km)', 'ave_dist_from_near_village', 3, False, True, False, 70);

SELECT core_utils.load_dropdown_attribute('General_Condition', 'General Condition', 'general_condition', 3, False, True, False, 80);

-- management description

SELECT core_utils.load_dropdown_attribute('Water_Committe_Exist', 'Water Committe Exist', 'water_committe_exist', 4, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('"Bylaw /Sirit/"', 'Bylaw Sirit', 'bylaw_sirit', 4, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('"Fund Raise"', 'Fund Raise', 'fund_raise', 4, False, True, False, 20);

SELECT core_utils.load_decimal_attribute('"Amount of Fund Deposit"', 'Amount of Fund Deposit', 'amount_of_deposited', 4, False, True, False, 30);

SELECT core_utils.load_dropdown_attribute('"Bank Book"', 'Bank Book', 'bank_book', 4, False, True, False, 40);

SELECT core_utils.load_dropdown_attribute('Fencing_Exist', 'Fencing Exist', 'fencing_exists', 4, False, True, False, 50);

SELECT core_utils.load_dropdown_attribute('Guard', 'Guard', 'guard', 4, False, True, False, 60);

SELECT core_utils.load_dropdown_attribute('Name_of_Data_Collector', 'Name of Data Collector', 'name_of_data_collector', 4, False, True, False, 70);

SELECT core_utils.load_text_attribute('Date_of_Data_Collection', 'Date of Data Collection', 'date_of_data_collection', 4, False, True, False, 80);

SELECT core_utils.load_text_attribute('Name_and_tel_of_Contact_Person', 'Name and tel of Contact Person', 'name_and_tel_of_contact_person', 4, False, True, False, 90);

SELECT core_utils.load_text_attribute('Picture_of_Scehem', 'Picture of Scehem', 'picture_of_scehem', 4, False, True, False, 100);
-----------------------------------------------------------

-- *
-- Restart sequences
-- *

SELECT setval('public.webusers_webuser_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.webusers_webuser), 1), false);
SELECT setval('features.changeset_id_seq', COALESCE((SELECT MAX(id)+1 FROM features.changeset), 1), false);
SELECT setval('public.attributes_attributegroup_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.attributes_attributegroup), 1), false);
SELECT setval('public.attributes_attribute_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.attributes_attribute), 1), false);



-- *
-- * Create active data and history data tables
-- *

select core_utils.create_dashboard_cache_table(core_utils.const_table_active_data());
select core_utils.create_dashboard_cache_table(core_utils.const_table_history_data());

-- *
-- * Insert initial data
-- *

insert into features.active_data (
	point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
)
select
  ST_SetSRID(ST_Point(Longitude :: double precision, Latitude :: double precision), 4326) as point_geometry,
  'admin@example.com'                                                                     as email,
  '2017-06-01T00:00:00'                                                                   as ts,
  uuid_generate_v4()                                                                      as feature_uuid,
  1                                                                                       as changeset_id,
  -- id                                                                                      as upstream_id,
  CASE
  WHEN static_water_level::FLOAT >= 100 THEN 5
  WHEN static_water_level::FLOAT >= 50 AND static_water_level::FLOAT < 100 THEN 4
  WHEN static_water_level::FLOAT >= 20 AND static_water_level::FLOAT < 50 THEN 3
  WHEN static_water_level::FLOAT > 10 AND static_water_level::FLOAT < 20 THEN 2
  ELSE 1 END
  AS static_water_level_group_id,
  CASE
  WHEN "Amount of Fund Deposit" :: FLOAT >= 5000
    THEN 5
  WHEN "Amount of Fund Deposit" :: FLOAT >= 3000 AND "Amount of Fund Deposit" :: FLOAT < 5000
    THEN 4
  WHEN "Amount of Fund Deposit" :: FLOAT >= 500 AND "Amount of Fund Deposit" :: FLOAT < 3000
    THEN 3
  WHEN "Amount of Fund Deposit" :: FLOAT > 1 AND "Amount of Fund Deposit" :: FLOAT < 500
    THEN 2
  ELSE 1
  END                                                                                     AS amount_of_deposited_group_id,
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
  coalesce(substr(initcap(zone), 1, 128), 'Unknown')                                      as zone,
  coalesce(substr(initcap(woreda), 1, 128), 'Unknown')                                    as woreda,
  coalesce(substr(initcap(tabiya), 1, 128), 'Unknown')                                    as tabiya,
  coalesce(substr(initcap(kushet), 1, 128), 'Unknown')                                    as kushet,
  site_name                                                                               as name,
  latitude::float,
  longitude::float,
  altitude::float,
  unique_id,
  coalesce(substr(initcap(scheme_type), 1, 128), 'Unknown')                               as scheme_type,
  year_of_construction::int                                                                    as construction_year,
  coalesce(substr(initcap(result), 1, 128), 'Unknown')                                    as result,
  depth::float,
  yield::float,
  static_water_level::float,
  coalesce(substr(initcap(pump_type), 1, 128), 'Unknown')                                 as pump_type,
  coalesce(substr(initcap(power_source), 1, 128), 'Unknown')                              as power_source,
  coalesce(substr(initcap(funded_by), 1, 128), 'Unknown')                                 as funded_by,
  coalesce(substr(initcap(constructed_by), 1, 128), 'Unknown')                            as constructed_by,
  coalesce(substr(initcap(functioning), 1, 128), 'Unknown')                               as functioning,
  reason_of_non_functioning,
  coalesce(substr(initcap(intervention_required), 1, 128), 'Unknown')                     as intervention_required,
  beneficiaries::int,
  "Female Beneficiaries"::int                                                             as female_beneficiaries,
  beneficiaries_outside::int,
  livestock::int,
  ave_dist_from_near_village::float,
  coalesce(substr(initcap(general_condition), 1, 128), 'Unknown')                         as general_condition,
  coalesce(substr(initcap(water_committe_exist), 1, 128), 'Unknown')                      as water_committe_exist,
  coalesce(substr(initcap("Bylaw /Sirit/"), 1, 128), 'Unknown')                           as bylaw_sirit,
  coalesce(substr(initcap("Fund Raise"), 1, 128), 'Unknown')                              as fund_raise,
  "Amount of Fund Deposit"::float                                                                as amount_of_deposited,
  coalesce(substr(initcap("Bank Book"), 1, 128), 'Unknown')                               as bank_book,
  coalesce(substr(initcap(fencing_exist), 1, 128), 'Unknown')                             as fencing_exists,
  coalesce(substr(initcap(guard), 1, 128), 'Unknown')                                     as guard,
  name_of_data_collector,
  date_of_data_collection,
  picture_of_scehem
from
  test_data.import_raw_data_2;


-- copy data to the history table

insert into features.history_data (
	point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
) SELECT
  point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
	zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
	scheme_type , construction_year , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries , beneficiaries_outside , livestock , ave_dist_from_near_village , general_condition , water_committe_exist , bylaw_sirit , fund_raise , amount_of_deposited , bank_book , fencing_exists , guard , name_of_data_collector , date_of_data_collection , picture_of_scehem
  from features.active_data;


-- *
-- * Create rules on attributes_attribute for active_data handling
-- *
-- select * from core_utils.attribute_rules('drop');
select * from core_utils.attribute_rules('create');



