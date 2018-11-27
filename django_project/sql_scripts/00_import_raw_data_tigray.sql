-- *
-- Create intermediary import_raw_data table
-- *

CREATE SCHEMA IF NOT EXISTS test_data;

-- drop table test_data.import_raw_data_2;
CREATE TABLE test_data.import_raw_data_2 (
    id serial PRIMARY KEY,
    "Unique_Id" text,
    "Zone" text,
    "Woreda" text,
    "Tabiya" text,
    "Kushet" text,
    "Site_Name" text,
    "Scheme_Type" text,
    "Year_of_Construction" text,
    "Result" text,
    "Well Use" text,
    "Depth" text,
    "Yield" text,
    "Static_Water_Level" text,
    "Pump_Type" text,
    "Power_Source" text,
    "Functioning" text,
    "Reason_of_Non_Functioning" text,
    "Intervention_Required" text,
    "Ave_Dist_from_near_Village (km)" text,
    "Beneficiaries" text,
    "Femal Beneficiaries" text,
    "Water_Committe_Exist" text,
    "By Law (Sirit)" text,
    "Fund_Raise" text,
    "Amount_of_Deposited_" text,
    "Bank book" text,
    "Fencing_Exist" text,
    "Guard" text,
    "Livestock" text,
    "Funded_By" text,
    "Constructed_By" text,
    "General_Condition" text,
    "Name_of_Data_Collector" text,
    "Date_of_Data_Collection" text,
    "Name_and_tel_of_Contact_Person" text,
    "Img Picture_of_Scehem" text,
    "Latitude" text,
    "Longitude" text,
    "Altitude" text,
    "Accuracy" text,
    "_import_errors" text,
    "_import_warnings" text
);

-- *
-- copy raw data from the csv file to the intermediary table
-- *


copy test_data.import_raw_data_2 (
        "Unique_Id", "Zone", "Woreda", "Tabiya", "Kushet", "Site_Name", "Scheme_Type", "Year_of_Construction",
        "Result", "Well Use", "Depth", "Yield", "Static_Water_Level", "Pump_Type", "Power_Source", "Functioning",
        "Reason_of_Non_Functioning", "Intervention_Required", "Ave_Dist_from_near_Village (km)", "Beneficiaries",
        "Femal Beneficiaries", "Water_Committe_Exist", "By Law (Sirit)", "Fund_Raise", "Amount_of_Deposited_",
        "Bank book", "Fencing_Exist", "Guard", "Livestock", "Funded_By", "Constructed_By", "General_Condition",
        "Name_of_Data_Collector", "Date_of_Data_Collection", "Name_and_tel_of_Contact_Person", "Img Picture_of_Scehem",
        "Latitude", "Longitude", "Altitude", "Accuracy",
        "_import_errors", "_import_warnings"
)
from '/tmp/wb_dataset.csv' WITH header csv delimiter ',';
