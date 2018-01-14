-- select json_agg(row) from
--   (select * from
--    core_utils.q_feature_attributes('name','amount_of_deposited','ave_dist_from_near_village','fencing_exists','beneficiaries','constructed_by','date_of_data_collection','depth','functioning','fund_raise','funded_by','general_condition','intervention_required','kushet','livestock','name_and_tel_of_contact_person','power_source','pump_type','reason_of_non_functioning','result','scheme_type','static_water_level','tabiya','water_committe_exist','year_of_construction','yield') as (feature_uuid uuid, name varchar,amount_of_deposited integer,ave_dist_from_near_village decimal,fencing_exists varchar,beneficiaries integer,constructed_by varchar,date_of_data_collection varchar,depth decimal,functioning varchar,fund_raise varchar,funded_by varchar,general_condition varchar,intervention_required varchar,kushet varchar,livestock integer,name_and_tel_of_contact_person varchar,power_source varchar,pump_type varchar,reason_of_non_functioning varchar,result varchar,scheme_type varchar,static_water_level decimal,tabiya varchar,water_committe_exist varchar,year_of_construction integer,yield decimal) limit 5) row;


copy (core_utils.export_all()) to '/tmp/ddd.csv' with delimiter ';' csv HEADER  ENCODING 'UTF-8';


create function core_utils.export_all() returns text
LANGUAGE plpgsql
AS
$$
  declare
    r RECORD;
   _query text;
    attributes text;
    attributes_types text;
  BEGIN

_query:= 'select
    string_agg( quote_literal(key) , '','')
from (
  select
      key, _result_type
  from
      attributes_attribute
  order by id
) d';
RAISE NOTICE '%', _query;
    execute _query into attributes;

_query:= 'select
    string_agg(key || '' '' || _result_type, '','')
from (
  select
      key, _result_type
  from
      attributes_attribute
  order by id
) d';
    execute _query into attributes_types;



    _query:= 'select * from
   core_utils.q_feature_attributes(' || attributes  || ') as (feature_uuid uuid, ' || attributes_types || ');';


    return _query;

  end
$$;
