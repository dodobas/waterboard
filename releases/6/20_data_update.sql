
-- change 'name_of_data_collector' to TEXT type

update attributes_attribute set result_type = 'Text' where key='name_of_data_collector';

delete from attributes_attributeoption where attribute_id = (select id from attributes_attribute where key = 'name_of_data_collector');
