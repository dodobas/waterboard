-- drop table import_raw_data;
create table import_raw_data(
id serial primary key,
Longitude text, -- #
Latitude text, -- #
Amount_of_Deposited_ text,
Ave_Dist_from_near_Village text,
Beneficiaries text,
Constructed_By text,
Date_of_Data_Collection text,
Depth text,
Fencing_Exist text,
Functioning text,
Fund_Raise text,
Funded_By text,
General_Condition text,
Intervention_Required text,
Kushet text,
Livestock text,
Location text,
Name_and_tel_of_Contact_Person text,
Name_of_Data_Collector text,
Picture_of_Scehem text,
Power_Source text,
Pump_Type text,
Reason_of_Non_Functioning text,
Record_Name text,
Result text,
Scheme_Type text,
Site_Name text,
Static_Water_Level text,
Tabiya text,
Unique_Id text,
Video_of_Scheme text,
Water_Committe_Exist text,
Woreda text,
Year_of_Construction text,
Yield text,
Zone text,
__Record_Index__ text,
deviceid text,
edit_datestring text,
"end" text,
mobilekey text,
phonenumber text,
projectkey text,
recordid text,
simid text,
start text,
subscriberid text,
today text,
coordinates__ text);

create extension "uuid-ossp";

copy import_raw_data (Longitude,Latitude,Amount_of_Deposited_,Ave_Dist_from_near_Village,Beneficiaries,Constructed_By,Date_of_Data_Collection,Depth,Fencing_Exist,Functioning,Fund_Raise,Funded_By,General_Condition,Intervention_Required,Kushet,Livestock,Location,Name_and_tel_of_Contact_Person,Name_of_Data_Collector,Picture_of_Scehem,Power_Source,Pump_Type,Reason_of_Non_Functioning,Record_Name,Result,Scheme_Type,Site_Name,Static_Water_Level,Tabiya,Unique_Id,Video_of_Scheme,Water_Committe_Exist,Woreda,Year_of_Construction,Yield,Zone,__Record_Index__,deviceid,edit_datestring,"end",mobilekey,phonenumber,projectkey,recordid,simid,start,subscriberid,today,coordinates__
)  from '/tmp/hcid_raw_data.csv'   header csv;

select * from import_raw_data;

insert into public.healthsites_healthsite(
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



select hhass.id from healthsites_healthsiteassessment hhass;


INSERT INTO public.healthsites_healthsiteassessmententryinteger(
            selected_option, assessment_criteria_id, healthsite_assessment_id)

SELECT 
coalesce(amount_of_deposited_::varchar, '0')::int as selected_option, 1 as assessment_criteria_id, hhass.id as healthsite_assessment_id
  FROM import_raw_data ird INNER JOIN healthsites_healthsite hs ON ird.id=SUBSTR(hs.name, 9)::int
  INNER JOIN healthsites_healthsiteassessment hhass ON hhass.healthsite_id=hs.id;





 explain analyze select
                    json_agg(r.row)::text as data
                from
                (
                    select 
                        json_build_object(
                            'assessment', json_build_object(
					ag.name || '/' ||ac.name , 
					json_build_object(
						'option', '',
						'value', selected_option,
						'description', ''
					)
				),
                            'id', hs.id,
                            'created_date', hs.created_date,
                            'data_captor', wu.email,
                            'overall_assessment', hs.overall_assessment,
                            'name', hs.name,
                            'geometry', ARRAY[ST_X(hs.point_geometry), ST_Y(hs.point_geometry)],
                            'enriched', 'true',
                            'country', 'Unknown'
                            ) as row	
                    	FROM
				public.healthsites_healthsiteassessmententryinteger hai
			inner join 	
				healthsites_healthsiteassessment hs
			on
				hai.healthsite_assessment_id = hs.id
			INNER JOIN
				webusers_webuser wu
			    ON
				hs.data_captor_id = wu.id
			INNER JOIN
				healthsites_assessmentcriteria ac
			ON
				ac.id = hai.assessment_criteria_id
				
			INNER JOIN
				healthsites_assessmentgroup ag
			    ON
				ag.id = ac.assessment_group_id
                )r; 
