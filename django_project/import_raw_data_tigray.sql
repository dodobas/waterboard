-- *
-- Create intermediary import_raw_data table
-- *

-- drop table import_raw_data;
CREATE TABLE import_raw_data (
    id                             SERIAL PRIMARY KEY,
    Longitude                      TEXT, -- #
    Latitude                       TEXT, -- #
    Amount_of_Deposited_           TEXT,
    Ave_Dist_from_near_Village     TEXT,
    Beneficiaries                  TEXT,
    Constructed_By                 TEXT,
    Date_of_Data_Collection        TEXT,
    Depth                          TEXT,
    Fencing_Exist                  TEXT,
    Functioning                    TEXT,
    Fund_Raise                     TEXT,
    Funded_By                      TEXT,
    General_Condition              TEXT,
    Intervention_Required          TEXT,
    Kushet                         TEXT,
    Livestock                      TEXT,
    Location                       TEXT,
    Name_and_tel_of_Contact_Person TEXT,
    Name_of_Data_Collector         TEXT,
    Picture_of_Scehem              TEXT,
    Power_Source                   TEXT,
    Pump_Type                      TEXT,
    Reason_of_Non_Functioning      TEXT,
    Record_Name                    TEXT,
    Result                         TEXT,
    Scheme_Type                    TEXT,
    Site_Name                      TEXT,
    Static_Water_Level             TEXT,
    Tabiya                         TEXT,
    Unique_Id                      TEXT,
    Video_of_Scheme                TEXT,
    Water_Committe_Exist           TEXT,
    Woreda                         TEXT,
    Year_of_Construction           TEXT,
    Yield                          TEXT,
    Zone                           TEXT,
    __Record_Index__               TEXT,
    deviceid                       TEXT,
    edit_datestring                TEXT,
    "end"                          TEXT,
    mobilekey                      TEXT,
    phonenumber                    TEXT,
    projectkey                     TEXT,
    recordid                       TEXT,
    simid                          TEXT,
    start                          TEXT,
    subscriberid                   TEXT,
    today                          TEXT,
    coordinates__                  TEXT
);

-- *
-- copy raw data from the csv file to the intermediary table
-- *
copy import_raw_data (Longitude,Latitude,Amount_of_Deposited_,Ave_Dist_from_near_Village,Beneficiaries,Constructed_By,Date_of_Data_Collection,Depth,Fencing_Exist,Functioning,Fund_Raise,Funded_By,General_Condition,Intervention_Required,Kushet,Livestock,Location,Name_and_tel_of_Contact_Person,Name_of_Data_Collector,Picture_of_Scehem,Power_Source,Pump_Type,Reason_of_Non_Functioning,Record_Name,Result,Scheme_Type,Site_Name,Static_Water_Level,Tabiya,Unique_Id,Video_of_Scheme,Water_Committe_Exist,Woreda,Year_of_Construction,Yield,Zone,__Record_Index__,deviceid,edit_datestring,"end",mobilekey,phonenumber,projectkey,recordid,simid,start,subscriberid,today,coordinates__)
from '/tmp/TigrayWaterBoards_Points.csv' WITH header csv;


-- select * from import_raw_data;

-- *
-- Load basic healthsite information
-- *
insert into healthsites_healthsite(
  name,
  point_geometry,
  version,
  uuid,
  date,
  is_healthsites_io
)
select
    'feature_' || id as name,
    ST_SetSRID(ST_Point(Longitude::double precision, Latitude::double precision),4326) as point_geometry,
    1 as version,
    md5(id::text)::text as uuid,
    clock_timestamp() as date,
    true as is_healthsites_io
from
    import_raw_data;

-- *
-- For every healthsite create an assessment
-- *
INSERT INTO healthsites_healthsiteassessment
(
  current,
  reference_url,
  reference_file,
  healthsite_id,
  created_date,
  data_captor_id,
  overall_assessment,
  name,
  point_geometry
)
SELECT
    true as current,
    '' as reference_url,
    '' as reference_file,
    hs.id as healthsite_id,
    clock_timestamp() as created_date,
    1 as data_captor_id,
    (random() * 4)::int + 1 overall_assessment,
    hs.name as name,
    hs.point_geometry as point_geometry

from healthsites_healthsite hs;

-- *
-- Create metadata for healthsite criteria - Amount_of_Deposited_
-- *
INSERT INTO public.healthsites_assessmentgroup (id, name, "order") VALUES (1, 'Deposited', 0);
INSERT INTO healthsites_assessmentcriteria (id, name, assessment_group_id, result_type, placeholder) VALUES (1, 'Amount_of_Deposited_', 1, 'Integer', null);

-- *
-- Load Amount_of_Deposited_ data from the intermediary raw data table
-- *
INSERT INTO healthsites_healthsiteassessmententryinteger(
    selected_option, assessment_criteria_id, healthsite_assessment_id
)
SELECT
    coalesce(amount_of_deposited_::varchar, '0')::int as selected_option, 1 as assessment_criteria_id, hhass.id as healthsite_assessment_id
FROM import_raw_data ird INNER JOIN healthsites_healthsite hs ON ird.id=SUBSTR(hs.name, 9)::int
    INNER JOIN healthsites_healthsiteassessment hhass ON hhass.healthsite_id=hs.id;

-- Import ... tbd data
INSERT INTO
	healthsites_assessmentcriteria (id, name, assessment_group_id, result_type, placeholder)
VALUES (2, 'ave_dist_from_near_village', 1, 'Decimal', null);


-- *
-- Load Amount_of_Deposited_ data from the intermediary raw data table
-- *
INSERT INTO feature_attribute_value(
    assessment_criteria_id,
    healthsite_assessment_id,
    val_real,
    changeset_id
)
SELECT
	2 as assessment_criteria_id,
	hhass.id as healthsite_assessment_id,
	coalesce(ave_dist_from_near_village::varchar, '0')::float as val_real,
	2 as changeset_id
FROM
	import_raw_data ird
JOIN 
	healthsites_healthsite hs ON ird.id=SUBSTR(hs.name, 9)::int
JOIN
	healthsites_healthsiteassessment hhass ON hhass.healthsite_id=hs.id;




CREATE TABLE public.feature_attributes
(
  id serial,
  
  val_text character varying(32),
  val_int int,
  val_real numeric(9,2),
  
  assessment_criteria_id integer NOt null,
  healthsite_assessment_id integer NOT NULL,
  
  ts timestamp with time zone default now()
);

alter table
	public.feature_attributes
add  primary key (healthsite_assessment_id, assessment_criteria_id);

create index
	ix_feature_attributes_pk
on
	public.feature_attributes
using
	btree (healthsite_assessment_id, assessment_criteria_id);


CREATE TABLE changeset (
	id serial primary key,

	ts_created timestamp with time zone default now(),
	webuser_id integer not null,

	prev_changeset_id int,
	version int default 1
);

-- add changeset_id to feature_values
ALTER TABLE feature_attributes ADD changeset_id int not null;

ALTER TABLE feature_attributes RENAME TO feature_attribute_value;


-- transpose data

INSERT INTO changeset (
	id,
	webuser_id,
	version
) select
	1 as id,
	1 as webuser_id,
	1 as version;

INSERT INTO changeset (
	id,
	webuser_id,
	version
) select
	2 as id,
	1 as webuser_id,
	1 as version;

INSERT INTO feature_attribute_value (
	healthsite_assessment_id,
	assessment_criteria_id,
	val_int,
	changeset_id
)
SELECT 
	h_as.id as healthsite_assessment_id,
	hai.assessment_criteria_id as assessment_criteria_id,
	hai.selected_option as val_int,
	1 as changeset_id
FROM healthsites_healthsiteassessment h_as inner join healthsites_healthsiteassessmententryinteger hai
	ON h_as.id = hai.healthsite_assessment_id;


