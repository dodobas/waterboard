-- *
-- Create intermediary import_raw_data table
-- *

CREATE SCHEMA IF NOT EXISTS test_data;

-- drop table test_data.import_raw_data_2;
CREATE TABLE test_data.import_raw_data_2 (
    id serial PRIMARY KEY,
    Unique_Id text,
    Zone text,
    Woreda text,
    Tabiya text,
    Kushet text,
    Site_Name text,
    Scheme_Type text,
    Year_of_Construction text,
    Result  text,
    Depth text,
    Yield text,
    Static_Water_Level text,
    Pump_Type text,
    Power_Source text,
    Functioning text,
    Reason_of_Non_Functioning text,
    Intervention_Required text,
    Beneficiaries text,
    "Female Beneficiaries" text,
    Livestock text,
    Water_Committe_Exist  text,
    "Bylaw /Sirit/" text,
    "Fund Raise" text,
    "Amount of Fund Deposit" text,
    "Bank Book" text,
    Fencing_Exist text,
    Guard text,
    Ave_Dist_from_near_Village text,
    Funded_By text,
    Constructed_By text,
    General_Condition text,
    Name_of_Data_Collector text,
    Date_of_Data_Collection text,
    Name_and_tel_of_Contact_Person text,
    Latitude text,
    Longitude text,
    Altitude text,
    Picture_of_Scehem text,
    Beneficiaries_outside text
);

-- *
-- copy raw data from the csv file to the intermediary table
-- *


copy test_data.import_raw_data_2 (
    Unique_Id,Zone,Woreda,Tabiya,Kushet,Site_Name,Scheme_Type,Year_of_Construction,Result,Depth,Yield,Static_Water_Level,Pump_Type,Power_Source,Functioning,Reason_of_Non_Functioning,Intervention_Required,Beneficiaries,"Female Beneficiaries",Livestock,Water_Committe_Exist,"Bylaw /Sirit/","Fund Raise","Amount of Fund Deposit","Bank Book",Fencing_Exist,Guard,Ave_Dist_from_near_Village,Funded_By,Constructed_By,General_Condition,Name_of_Data_Collector,Date_of_Data_Collection,Name_and_tel_of_Contact_Person,Latitude,Longitude,Altitude,Picture_of_Scehem
)
from '/tmp/wb_dataset.csv' WITH header csv delimiter ',';


-- fix data
update test_data.import_raw_data_2 set
    longitude = replace(longitude, ',', '.'),
    latitude = replace(latitude, ',', '.'),
    depth = replace(depth, ',', '.'),
    yield = replace(yield, ',', '.'),
    static_water_level = replace(static_water_level, ',', '.'),
    "Amount of Fund Deposit" = replace("Amount of Fund Deposit", ',', '.'),
    Ave_Dist_from_near_Village = replace(Ave_Dist_from_near_Village, ',', '.');


update test_data.import_raw_data_2 set
    longitude = 0, latitude = 0, altitude = 0
WHERE
    not(longitude LIKE '%.%') OR not(latitude LIKE '%.%') OR not(altitude LIKE '%.%') OR latitude is null or longitude is null or altitude is null;

