-- *
-- Load basic feature information
-- *

INSERT INTO features.changeset (
    id,
    webuser_id,
    ts_created
) select
    1 as id,
    1 as webuser_id,
    '2017-06-01T00:00:00' as ts_created;


INSERT INTO
    public.attributes_attributegroup (id, name, position)
VALUES (1, 'Deposited', 0);

INSERT INTO
    public.attributes_attributegroup (id, name, position)
VALUES (2, 'Fencing', 0);

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (1, 'Amount_of_Deposited_', 1, 'Integer');

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (2, 'ave_dist_from_near_village', 1, 'Decimal');

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (3, 'Fencing exists', 2, 'DropDown');


INSERT INTO
    public.attributes_attributeoption (option, value, description, position, attribute_id)

    select
        r.option
        , row_number() OVER (ORDER BY r.option)
        , r.description
        , row_number() OVER (ORDER BY r.option)
        , r.attribute_id
    from (
        select
        coalesce(initcap(fencing_exist), 'Unknown') as option,
        '' as description,
        3 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(fencing_exist), 'Unknown')
        ORDER BY 1) r;



INSERT INTO features.feature (
    feature_uuid,
    name,
    point_geometry,
    changeset_id,
    overall_assessment
) select
    uuid_generate_v4() as feature_uuid,
    'feature_' || id as name,
    ST_SetSRID(ST_Point(Longitude::double precision, Latitude::double precision), 4326) as point_geometry,
    1 as changeset_id,
    (random() * 4)::int + 1 as overall_assessment
from
    test_data.import_raw_data;


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    1 as attribute_id,
    coalesce(amount_of_deposited_::varchar, '0')::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    2 as fetaure_attribute_id,
    coalesce(ave_dist_from_near_village::varchar, '0')::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    3 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.fencing_exist), 'Unknown') = aao.option AND aao.attribute_id = 3;
