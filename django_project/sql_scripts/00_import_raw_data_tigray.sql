-- *
-- Create intermediary import_raw_data table
-- *

CREATE SCHEMA IF NOT EXISTS test_data;

-- drop table import_raw_data;
CREATE TABLE test_data.import_raw_data (
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
copy test_data.import_raw_data (Longitude,Latitude,Amount_of_Deposited_,Ave_Dist_from_near_Village,Beneficiaries,Constructed_By,Date_of_Data_Collection,Depth,Fencing_Exist,Functioning,Fund_Raise,Funded_By,General_Condition,Intervention_Required,Kushet,Livestock,Location,Name_and_tel_of_Contact_Person,Name_of_Data_Collector,Picture_of_Scehem,Power_Source,Pump_Type,Reason_of_Non_Functioning,Record_Name,Result,Scheme_Type,Site_Name,Static_Water_Level,Tabiya,Unique_Id,Video_of_Scheme,Water_Committe_Exist,Woreda,Year_of_Construction,Yield,Zone,__Record_Index__,deviceid,edit_datestring,"end",mobilekey,phonenumber,projectkey,recordid,simid,start,subscriberid,today,coordinates)
from '/tmp/TigrayWaterBoards_Points.csv' WITH header csv;

-- alter table import_raw_data set SCHEMA test_data;

-- select * from test_data.import_raw_data;


