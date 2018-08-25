
-- upper case scheme_type options
update attributes_attributeoption Set option = upper(option) WHERE attribute_id = ( SELECT id from attributes_attribute where key='scheme_type');
update features.active_data set scheme_type = upper(scheme_type);
update features.history_data set scheme_type = upper(scheme_type);
