-- *
-- Create superuser `admin@example.com` with password `admin`
-- *
INSERT INTO public.webusers_webuser (id, password, last_login, email, full_name, is_active, is_staff) VALUES (1, 'pbkdf2_sha256$36000$sY5yuQ0CPLoY$nIMAXnQnL5IhxLwqAWQwL6SQ1IPp0X4yNd20trNiR+8=', null, 'admin@example.com', 'admin', true, true);
INSERT INTO public.webusers_webuser (id, password, last_login, email, full_name, is_active, is_staff, geofence) VALUES (2, 'pbkdf2_sha256$36000$rksSvRlrFIB6$ZOA2Mm7yP0I2Y7WNhQ2Xeo7F6ButK7AXdHEh7fKCRks=', null, 'user@example.com', 'user', true, false, '0103000020E6100000010000000700000067752A162717434076342E27A6A32C40D5B81C159C0443406F4DCA7682672C40C303F1F3AA1D434006E763B051152C40EA685CEE383543409C94ADE965372C401F97A311404143409B9E856988712C40EA685CEE38354340C6F918DCB0B52C4067752A162717434076342E27A6A32C40');


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
    point_geometry,
    changeset_id,
    upstream_id
) select
    uuid_generate_v4() as feature_uuid,
    ST_SetSRID(ST_Point(Longitude::double precision, Latitude::double precision), 4326) as point_geometry,
    1 as changeset_id,
    id as upstream_id
from
    test_data.import_raw_data;


INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (1, 'General', 'general', 0);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (2, 'Group1', 'group1', 1);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (3, 'Group2', 'group2', 2);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (4, 'Group3', 'group3', 3);

INSERT INTO
    public.attributes_attributegroup (id, label, key, position)
VALUES (5, 'Group4', 'group4', 4 );


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (1, 'Name', 'name', 1, 'Text', 0, TRUE, TRUE, TRUE);


-- attributes

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    1 as attribute_id,
    site_name,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (2, 'Amount_of_Deposited_', 'amount_of_deposited', 2, 'Integer', 0, FALSE, TRUE, FALSE);


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    2 as attribute_id,
    amount_of_deposited_::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (3, 'ave_dist_from_near_village', 'ave_dist_from_near_village', 2, 'Decimal', 0, FALSE, TRUE, FALSE);

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    3 as fetaure_attribute_id,
    ave_dist_from_near_village::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (4, 'Fencing exists', 'fencing_exists', 2, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        4 as attribute_id
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
    4 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.fencing_exist), 'Unknown') = aao.option AND aao.attribute_id = 4;

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (5, 'beneficiaries', 'beneficiaries', 2, 'Integer', 0, FALSE, TRUE, FALSE);

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    5 as attribute_id,
    beneficiaries::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (6, 'constructed_by', 'constructed_by', 2, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        6 as attribute_id
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
    6 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.constructed_by), 'Unknown') = aao.option AND aao.attribute_id = 6;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (7, 'date_of_data_collection', 'date_of_data_collection', 2, 'Text', 0, FALSE, TRUE, FALSE);


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    7 as attribute_id,
    date_of_data_collection as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (8, 'depth', 'depth', 3, 'Decimal', 0, FALSE, TRUE, FALSE);

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    8 as attribute_id,
    depth::float as val_real,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (9, 'functioning','functioning', 3, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        9 as attribute_id
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
    9 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.functioning), 'Unknown') = aao.option AND aao.attribute_id = 9;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (10, 'fund_raise', 'fund_raise', 3, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        10 as attribute_id
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
    10 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.fund_raise), 'Unknown') = aao.option AND aao.attribute_id = 10;


-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (11, 'funded_by', 'funded_by', 3, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        11 as attribute_id
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
    11 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.funded_by), 'Unknown') = aao.option AND aao.attribute_id = 11;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (12, 'general_condition', 'general_condition', 3, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        12 as attribute_id
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
    12 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.general_condition), 'Unknown') = aao.option AND aao.attribute_id = 12;

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (13, 'intervention_required', 'intervention_required', 3, 'Text', 0, FALSE, TRUE, FALSE);


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    13 as attribute_id,
    intervention_required as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (14, 'kushet', 'kushet', 3, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        14 as attribute_id
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
    14 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.kushet), 'Unknown') = aao.option AND aao.attribute_id = 14;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (15, 'livestock', 'livestock', 3, 'Integer', 0, FALSE, TRUE, FALSE);

INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    15 as attribute_id,
    livestock::int as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (16, 'name_and_tel_of_contact_person', 'name_and_tel_of_contact_person', 4, 'Text', 0, FALSE, TRUE, FALSE);


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    16 as attribute_id,
    name_and_tel_of_contact_person as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (17, 'power_source', 'power_source', 4, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        17 as attribute_id
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
    17 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.power_source), 'Unknown') = aao.option AND aao.attribute_id = 17;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (18, 'pump_type', 'pump_type', 4, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        18 as attribute_id
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
    18 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.pump_type), 'Unknown') = aao.option AND aao.attribute_id = 18;


-----------------------------------------------------------


INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (19, 'reason_of_non_functioning', 'reason_of_non_functioning', 4, 'Text', 0, FALSE, TRUE, FALSE);


INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    19 as attribute_id,
    reason_of_non_functioning as val_text,
    1 as changeset_id
FROM
    test_data.import_raw_data ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (20, 'result', 'result', 4, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        20 as attribute_id
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
    20 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.result), 'Unknown') = aao.option AND aao.attribute_id = 20;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (21, 'scheme_type', 'scheme_type', 4, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        21 as attribute_id
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
    21 as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.scheme_type), 'Unknown') = aao.option AND aao.attribute_id = 21;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (22, 'static_water_level', 'static_water_level', 5, 'Decimal', 0, FALSE, TRUE, FALSE);

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
    features.feature ft ON ird.id=ft.upstream_id;


-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (23, 'tabiya', 'tabiya', 5, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.tabiya), 'Unknown') = aao.option AND aao.attribute_id = 23;



-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (24, 'water_committe_exist', 'water_committe_exist', 5, 'DropDown', 0, FALSE, TRUE, FALSE);

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
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(initcap(ird.water_committe_exist), 'Unknown') = aao.option AND aao.attribute_id = 24;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (25, 'year_of_construction', 'year_of_construction', 5, 'Integer', 0, FALSE, TRUE, FALSE);

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
    features.feature ft ON ird.id=ft.upstream_id;

-----------------------------------------------------------

INSERT INTO
    public.attributes_attribute (id, label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (26, 'yield', 'yield', 5, 'Decimal', 0, FALSE, TRUE, FALSE);

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
    features.feature ft ON ird.id=ft.upstream_id;


-- *
-- Restart sequences
-- *

SELECT setval('public.webusers_webuser_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.webusers_webuser), 1), false);
SELECT setval('features.changeset_id_seq', COALESCE((SELECT MAX(id)+1 FROM features.changeset), 1), false);
SELECT setval('public.attributes_attributegroup_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.attributes_attributegroup), 1), false);
SELECT setval('public.attributes_attribute_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.attributes_attribute), 1), false);

-- *
-- *  Update attribute label field, camel case , remove _
-- *
update attributes_attribute set label = INITCAP (replace(label ,'_',' '));


-- *
-- * Refresh active data materialized view
-- *

select core_utils.refresh_active_data();
