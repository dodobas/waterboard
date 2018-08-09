-- *
-- * Updated database functions
-- *

create or replace function core_utils.add_active_data_column(i_new ATTRIBUTES_ATTRIBUTE)
   RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_query TEXT;
    l_attribute_type text;
    l_field_name text;
BEGIN

  select
      case
          when i_new.result_type = 'Integer' THEN 'int'
          when i_new.result_type = 'Decimal' THEN 'numeric(17, 8)'
          when i_new.result_type = 'Text' THEN 'text'
          when i_new.result_type = 'DropDown' THEN 'text'
          ELSE null
      end as val,
      i_new.key as field_name
  into
    l_attribute_type, l_field_name;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_active_data(), l_field_name, l_attribute_type);
  execute v_query;

  v_query:= format($alter$
      alter table %s add column %s %s;
  $alter$, core_utils.const_table_history_data(), l_field_name, l_attribute_type);
  execute v_query;

end
$$;
