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


INSERT INTO
    public.attributes_attributegroup (id, name, position)
VALUES (1, 'Deposited', 0);

INSERT INTO
    public.attributes_attributegroup (id, name, position)
VALUES (2, 'Fencing', 0);

-- attributes

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (1, 'Amount_of_Deposited_', 1, 'Integer');


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


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (2, 'ave_dist_from_near_village', 1, 'Decimal');

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

-----------------------------------------------------------

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

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (4, 'beneficiaries', 1, 'Integer');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    4 as attribute_id,
    coalesce(beneficiaries::varchar, '0')::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (5, 'constructed_by', 2, 'DropDown');

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
        coalesce(initcap(constructed_by), 'Unknown') as option,
        '' as description,
        5 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(constructed_by), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    5 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.constructed_by), 'Unknown') = aao.option AND aao.attribute_id = 5;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (6, 'date_of_data_collection', 1, 'Text');


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    6 as attribute_id,
    date_of_data_collection as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (7, 'depth', 1, 'Decimal');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    7 as attribute_id,
    depth::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (8, 'functioning', 1, 'DropDown');

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
        coalesce(initcap(functioning), 'Unknown') as option,
        '' as description,
        8 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(functioning), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    8 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.functioning), 'Unknown') = aao.option AND aao.attribute_id = 8;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (9, 'fund_raise', 1, 'DropDown');

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
        coalesce(initcap(fund_raise), 'Unknown') as option,
        '' as description,
        9 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(fund_raise), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    9 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.fund_raise), 'Unknown') = aao.option AND aao.attribute_id = 9;


-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (10, 'funded_by', 1, 'DropDown');

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
        coalesce(initcap(funded_by), 'Unknown') as option,
        '' as description,
        10 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(funded_by), 'Unknown')
        ORDER BY 1) r;


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    10 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.funded_by), 'Unknown') = aao.option AND aao.attribute_id = 10;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (11, 'general_condition', 1, 'DropDown');

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
        coalesce(initcap(general_condition), 'Unknown') as option,
        '' as description,
        11 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(general_condition), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    11 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.general_condition), 'Unknown') = aao.option AND aao.attribute_id = 11;

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (12, 'intervention_required', 1, 'Text');


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    12 as attribute_id,
    intervention_required as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (13, 'kushet', 1, 'DropDown');

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
        coalesce(initcap(kushet), 'Unknown') as option,
        '' as description,
        13 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(kushet), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    13 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.kushet), 'Unknown') = aao.option AND aao.attribute_id = 13;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (14, 'livestock', 1, 'Integer');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    14 as attribute_id,
    livestock::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (15, 'name_and_tel_of_contact_person', 1, 'Text');


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    15 as attribute_id,
    name_and_tel_of_contact_person as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (16, 'power_source', 1, 'DropDown');

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
        coalesce(initcap(power_source), 'Unknown') as option,
        '' as description,
        16 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(power_source), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    16 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.power_source), 'Unknown') = aao.option AND aao.attribute_id = 16;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (17, 'pump_type', 1, 'DropDown');

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
        coalesce(initcap(pump_type), 'Unknown') as option,
        '' as description,
        17 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(pump_type), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    17 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.pump_type), 'Unknown') = aao.option AND aao.attribute_id = 17;


-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (18, 'reason_of_non_functioning', 1, 'Text');


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    18 as attribute_id,
    reason_of_non_functioning as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (19, 'result', 1, 'DropDown');

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
        coalesce(initcap(result), 'Unknown') as option,
        '' as description,
        19 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(result), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    19 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.result), 'Unknown') = aao.option AND aao.attribute_id = 19;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (20, 'scheme_type', 1, 'DropDown');

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
        coalesce(initcap(scheme_type), 'Unknown') as option,
        '' as description,
        20 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(scheme_type), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    20 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.scheme_type), 'Unknown') = aao.option AND aao.attribute_id = 20;


-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (21, 'site_name', 1, 'Text');


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    21 as attribute_id,
    site_name as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (22, 'static_water_level', 1, 'Decimal');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    22 as attribute_id,
    static_water_level::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (23, 'tabiya', 1, 'DropDown');

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
        coalesce(initcap(tabiya), 'Unknown') as option,
        '' as description,
        23 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(tabiya), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    23 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.tabiya), 'Unknown') = aao.option AND aao.attribute_id = 23;



-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (24, 'water_committe_exist', 1, 'DropDown');

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
        coalesce(initcap(water_committe_exist), 'Unknown') as option,
        '' as description,
        24 as attribute_id
        from test_data.import_raw_data
        group by coalesce(initcap(water_committe_exist), 'Unknown')
        ORDER BY 1) r;

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    24 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=SUBSTR(ft.name, 9)::int
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.water_committe_exist), 'Unknown') = aao.option AND aao.attribute_id = 24;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (25, 'year_of_construction', 1, 'Integer');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    25 as attribute_id,
    year_of_construction::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, name, attribute_group_id, result_type)
VALUES (26, 'yield', 1, 'Decimal');

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    26 as attribute_id,
    yield::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;
