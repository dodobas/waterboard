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
    ts_created,
    changeset_type
) select
    1 as id,
    1 as webuser_id,
    '2018-11-24T00:00:00' as ts_created,
    'I';

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

SELECT core_utils.load_text_attribute('"Unique_Id"', 'Unique ID', 'unique_id', 1, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('"Zone"', 'Zone', 'zone', 1, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('"Woreda"', 'Woreda', 'woreda', 1, False, True, False, 20);

SELECT core_utils.load_dropdown_attribute('"Tabiya"', 'Tabiya', 'tabiya', 1, False, True, False, 30);

SELECT core_utils.load_dropdown_attribute('"Kushet"', 'Kushet', 'kushet', 1, False, True, False, 40);

SELECT core_utils.load_text_attribute('"Site_Name"', 'Name', 'name', 1, True, True, False, 50);

SELECT core_utils.load_decimal_attribute('"Latitude"', 'Latitude', 'latitude', 1, True, True, False, 60);

SELECT core_utils.load_decimal_attribute('"Longitude"', 'Longitude', 'longitude', 1, True, True, False, 70);

SELECT core_utils.load_decimal_attribute('"Altitude"', 'Altitude', 'altitude', 1, False, True, False, 80);

SELECT core_utils.load_decimal_attribute('"Accuracy"', 'Accuracy', 'accuracy', 1, False, True, False, 90);

-- scheme description

SELECT core_utils.load_dropdown_attribute('"Scheme_Type"', 'Scheme Type', 'scheme_type', 2, False, True, False, 0, True);

SELECT core_utils.load_integer_attribute('"Year_of_Construction"', 'Year of Construction', 'year_of_construction', 2, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('"Result"', 'Result', 'result', 2, False, True, False, 20);

SELECT core_utils.load_decimal_attribute('"Depth"', 'Depth (m)', 'depth', 2, False, True, False, 30);

SELECT core_utils.load_decimal_attribute('"Yield"', 'Yield (l/s)', 'yield', 2, False, True, False, 40);

SELECT core_utils.load_decimal_attribute('"Static_Water_Level"', 'Static Water Level (m)', 'static_water_level', 2, False, True, False, 50);

SELECT core_utils.load_dropdown_attribute('"Pump_Type"', 'Pump Type', 'pump_type', 2, False, True, False, 60);

SELECT core_utils.load_dropdown_attribute('"Power_Source"', 'Power Source', 'power_source', 2, False, True, False, 70);

SELECT core_utils.load_dropdown_attribute('"Funded_By"', 'Funded By', 'funded_by', 2, False, True, False, 80);

SELECT core_utils.load_dropdown_attribute('"Constructed_By"', 'Constructed By', 'constructed_by', 2, False, True, False, 90);

SELECT core_utils.load_dropdown_attribute('"Well Use"', 'Well used by', 'well_used_by', 2, False, True, False, 100);

-- service description

SELECT core_utils.load_dropdown_attribute('"Functioning"', 'Functioning', 'functioning', 3, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('"Reason_of_Non_Functioning"', 'Reason of Non Functioning', 'reason_of_non_functioning', 3, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('"Intervention_Required"', 'Intervention Required', 'intervention_required', 3, False, True, False, 20);

SELECT core_utils.load_integer_attribute('"Beneficiaries"', 'Total Beneficiaries in 1km', 'beneficiaries', 3, False, True, False, 30);

SELECT core_utils.load_integer_attribute('"Femal Beneficiaries"', 'Female Beneficiaries in 1km', 'female_beneficiaries', 3, False, True, False, 40);

SELECT core_utils.load_integer_attribute('"Livestock"', 'Livestock', 'livestock', 3, False, True, False, 50);

SELECT core_utils.load_decimal_attribute('"Ave_Dist_from_near_Village (km)"', 'Average distance from nearby village (km)', 'ave_dist_from_near_village', 3, False, True, False, 60);

SELECT core_utils.load_dropdown_attribute('"General_Condition"', 'General Condition', 'general_condition', 3, False, True, False, 70);

-- management description

SELECT core_utils.load_dropdown_attribute('"Water_Committe_Exist"', 'Water Committee Exists', 'water_committee_exists', 4, False, True, False, 0);

SELECT core_utils.load_dropdown_attribute('"By Law (Sirit)"', 'Bylaw Sirit Exists', 'bylaw_sirit_exists', 4, False, True, False, 10);

SELECT core_utils.load_dropdown_attribute('"Fund_Raise"', 'Fund Raise Exists', 'fund_raise_exists', 4, False, True, False, 20);

SELECT core_utils.load_decimal_attribute('"Amount_of_Deposited_"', 'Amount of Fund Deposit (Birr)', 'amount_of_deposited', 4, False, True, False, 30);

SELECT core_utils.load_dropdown_attribute('"Bank book"', 'Bank Book Exists', 'bank_book_exists', 4, False, True, False, 40);

SELECT core_utils.load_dropdown_attribute('"Fencing_Exist"', 'Fencing Exist', 'fencing_exists', 4, False, True, False, 50);

SELECT core_utils.load_dropdown_attribute('"Guard"', 'Guard Exists', 'guard_exists', 4, False, True, False, 60);

SELECT core_utils.load_text_attribute('"Name_of_Data_Collector"', 'Name of Data Collector', 'name_of_data_collector', 4, False, True, False, 70);

SELECT core_utils.load_text_attribute('"Date_of_Data_Collection"', 'Date of Data Collection', 'date_of_data_collection', 4, False, True, False, 80);

SELECT core_utils.load_text_attribute('"Name_and_tel_of_Contact_Person"', 'Name and tel of Contact Person', 'name_and_tel_of_contact_person', 4, False, True, False, 90);

SELECT core_utils.load_text_attribute('"Img Picture_of_Scehem"', 'Picture of Scheme', 'picture_of_scheme', 4, False, True, False, 100);
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
select core_utils.create_dashboard_cache_table(core_utils.const_table_deleted_data());

-- *
-- * Insert initial data
-- *

insert into features.active_data
(point_geometry, email, ts, feature_uuid, changeset_id,
 static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
 unique_id, zone, woreda, tabiya, kushet, name, latitude, longitude, altitude, accuracy, scheme_type,
 year_of_construction, result, depth, yield, static_water_level, pump_type, power_source, funded_by, constructed_by,
 well_used_by, functioning, reason_of_non_functioning, intervention_required, beneficiaries, female_beneficiaries,
 livestock, ave_dist_from_near_village, general_condition, water_committee_exists, bylaw_sirit_exists,
 fund_raise_exists, amount_of_deposited, bank_book_exists, fencing_exists, guard_exists, name_of_data_collector,
 date_of_data_collection, name_and_tel_of_contact_person, picture_of_scheme)
select
    ST_SetSRID(ST_Point("Longitude" :: double precision, "Latitude" :: double precision), 4326) as point_geometry,
    'admin@example.com'                                                                         as email,
    '2018-11-24T00:00:00'                                                                       as ts,
    uuid_generate_v4()                                                                          as feature_uuid,
    1                                                                                           as changeset_id,
    -- id                                                                                      as upstream_id,
    CASE
        WHEN "Static_Water_Level"::numeric(17, 8) >= 100 THEN 5
        WHEN "Static_Water_Level"::numeric(17, 8) >= 50 AND "Static_Water_Level"::numeric(17, 8) < 100 THEN 4
        WHEN "Static_Water_Level"::numeric(17, 8) >= 20 AND "Static_Water_Level"::numeric(17, 8) < 50 THEN 3
        WHEN "Static_Water_Level"::numeric(17, 8) > 10 AND "Static_Water_Level"::numeric(17, 8) < 20 THEN 2
        ELSE 1 END
                                                                                                AS static_water_level_group_id,
    CASE
        WHEN "Amount_of_Deposited_"::numeric(17, 8) >= 5000
            THEN 5
        WHEN "Amount_of_Deposited_"::numeric(17, 8) >= 3000 AND "Amount_of_Deposited_"::numeric(17, 8) < 5000
            THEN 4
        WHEN "Amount_of_Deposited_"::numeric(17, 8) >= 500 AND "Amount_of_Deposited_"::numeric(17, 8) < 3000
            THEN 3
        WHEN "Amount_of_Deposited_"::numeric(17, 8) > 1 AND "Amount_of_Deposited_"::numeric(17, 8) < 500
            THEN 2
        ELSE 1
        END                                                                                     AS amount_of_deposited_group_id,
    CASE
        WHEN "Yield"::numeric(17, 8) >= 6
            THEN 5
        WHEN "Yield"::numeric(17, 8) >= 3 AND "Yield"::numeric(17, 8) < 6
            THEN 4
        WHEN "Yield"::numeric(17, 8) >= 1 AND "Yield"::numeric(17, 8) < 3
            THEN 3
        WHEN "Yield"::numeric(17, 8) > 0 AND "Yield"::numeric(17, 8) < 1
            THEN 2
        ELSE 1
        END                                                                                     AS yield_group_id,
    "Unique_Id",
    coalesce("Zone", 'Unknown')                                                                 as zone,
    coalesce("Woreda", 'Unknown')                                                               as woreda,
    coalesce("Tabiya", 'Unknown')                                                               as tabiya,
    coalesce("Kushet", 'Unknown')                                                               as kushet,
    "Site_Name"                                                                                 as name,
    "Latitude"::numeric(17, 8)                                                                  as latitude,
    "Longitude"::numeric(17, 8)                                                                 as longitude,
    "Altitude"::numeric(17, 8)                                                                  as altitude,
    "Accuracy"::numeric(17, 8)                                                                  as accuracy,
    coalesce("Scheme_Type", 'Unknown')                                                          as scheme_type,

    "Year_of_Construction"::int                                                                 as year_of_construction,
    coalesce("Result", 'Unknown')                                                               as result,
    "Depth"::numeric(17, 8)                                                                     as depth,
    "Yield"::numeric(17, 8)                                                                     as yield,
    "Static_Water_Level"::numeric(17, 8)                                                        as static_water_level,
    coalesce("Pump_Type", 'Unknown')                                                            as pump_type,
    coalesce("Power_Source", 'Unknown')                                                         as power_source,
    coalesce("Funded_By", 'Unknown')                                                            as funded_by,
    coalesce("Constructed_By", 'Unknown')                                                       as constructed_by,

    coalesce("Well Use", 'Unknown')                                                             as well_used_by,
    coalesce("Functioning", 'Unknown')                                                          as functioning,
    coalesce("Reason_of_Non_Functioning", 'Unknown')                                            as reason_of_non_functioning,
    coalesce("Intervention_Required", 'Unknown')                                                as intervention_required,
    "Beneficiaries"::int                                                                        as beneficiaries,
    "Femal Beneficiaries"::int                                                                  as female_beneficiaries,

    "Livestock"::int                                                                            as livestock,
    "Ave_Dist_from_near_Village (km)"::numeric(17, 8)                                           as ave_dist_from_near_village,
    coalesce("General_Condition", 'Unknown')                                                    as general_condition,
    coalesce("Water_Committe_Exist", 'Unknown')                                                 as water_committee_exists,
    coalesce("By Law (Sirit)", 'Unknown')                                                       as bylaw_sirit_exists,

    coalesce("Fund_Raise", 'Unknown')                                                           as fund_raise_exists,
    "Amount_of_Deposited_"::numeric(17, 8)                                                      as amount_of_deposited,
    coalesce("Bank book", 'Unknown')                                                            as bank_book_exists,
    coalesce("Fencing_Exist", 'Unknown')                                                        as fencing_exists,
    coalesce("Guard", 'Unknown')                                                                as guard_exists,
    "Name_of_Data_Collector"                                                                    as name_of_data_collector,

    "Date_of_Data_Collection"                                                                   as date_of_data_collection,
    "Name_and_tel_of_Contact_Person"                                                            as name_and_tel_of_contact_person,
    "Img Picture_of_Scehem"                                                                     as picture_of_scheme
from
    test_data.import_raw_data_2;









-- copy data to the history table

insert into features.history_data
    (
    point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
    zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
    scheme_type , year_of_construction , result , depth , yield , static_water_level , pump_type , power_source ,
    funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries,
    livestock , ave_dist_from_near_village , general_condition , water_committee_exists , bylaw_sirit_exists ,
     fund_raise_exists , amount_of_deposited , bank_book_exists , fencing_exists , guard_exists , name_of_data_collector , date_of_data_collection ,
     picture_of_scheme
) SELECT
  point_geometry, email, ts , feature_uuid, changeset_id,
    static_water_level_group_id, amount_of_deposited_group_id, yield_group_id,
    zone , woreda , tabiya , kushet , name , latitude , longitude , altitude , unique_id ,
    scheme_type , year_of_construction , result , depth , yield , static_water_level , pump_type , power_source , funded_by , constructed_by , functioning , reason_of_non_functioning , intervention_required , beneficiaries , female_beneficiaries,
         livestock , ave_dist_from_near_village , general_condition , water_committee_exists , bylaw_sirit_exists , fund_raise_exists , amount_of_deposited ,
         bank_book_exists , fencing_exists , guard_exists , name_of_data_collector , date_of_data_collection , picture_of_scheme
  from features.active_data;


-- *
-- * Create rules on attributes_attribute for active_data handling
-- *
-- select * from core_utils.attribute_rules('drop');
select * from core_utils.attribute_rules('create');

-- *
-- * Recalculate dropdown positions
-- *
select core_utils.recalculate_dropdown_positions();
