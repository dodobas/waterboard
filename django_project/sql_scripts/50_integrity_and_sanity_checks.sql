-- COLLECTION FOR VARIOUS DATA CHECKS

-- *
-- * core_utils.check_active_data_columns()
-- *
-- * check if every attributes_attribute has a defined column in active_data
create or replace function
    core_utils.check_active_data_columns()
returns table (
    attributes_attribute_key text,
    active_data_column text,
    status text,
    attributes_attribute_data_type text,
    active_data_data_type text,
    data_type_short text,
    is_nullable text
) as
$$
-- select * from core_utils.check_active_data_columns();
-- result:
-- altitude	altitude	ok	Decimal	double precision	float8	YES
-- amount_of_deposited	amount_of_deposited	ok	Decimal	double precision	float8	YES

SELECT
    aa.key as attributes_attribute_key,
    column_name as active_data_column,
    case when
        aa.key = column_name then
            'ok'
        else
            'not ok'
    END as status,
    aa.result_type as attributes_attribute_data_type,
    data_type as active_data_data_type,
    udt_name as data_type_short,
    -- column_default,
    is_nullable
    -- ordinal_position
FROM
  information_schema.columns
left JOIN
    attributes_attribute aa
on column_name = aa.key
WHERE
  table_schema = 'features'
AND
  table_name   = 'active_data'

and column_name not in (
    'ts',
    'email',
    'id',
    'point_geometry',
    'changeset_id',
    'static_water_level_group_id',
    'amount_of_deposited_group_id',
    'yield_group_id',
    'feature_uuid'
)
order
by attributes_attribute_key;

$$
language sql;


-- select * from core_utils.check_active_data_columns()
