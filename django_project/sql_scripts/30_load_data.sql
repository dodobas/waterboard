-- *
-- Load basic feature information
-- *

INSERT INTO data.changeset (
    id,
    webuser_id
) select
      1 as id,
      1 as webuser_id;


INSERT INTO
    data.attribute_group (id, name, position)
VALUES (1, 'Deposited', 0);

INSERT INTO
    data.attribute (id, name, attribute_group_id, result_type)
VALUES (1, 'Amount_of_Deposited_', 1, 'Integer');

INSERT INTO
    data.attribute (id, name, attribute_group_id, result_type)
VALUES (2, 'ave_dist_from_near_village', 1, 'Decimal');



INSERT INTO data.feature (
    name,
    point_geometry,
    changeset_id,
    overall_assessment
)
    select
        'feature_' || id as name,
        ST_SetSRID(ST_Point(Longitude::double precision, Latitude::double precision), 4326) as point_geometry,
        1 as changeset_id,
        (random() * 4)::int + 1 as overall_assessment
    from
        test_data.import_raw_data;


INSERT INTO data.feature_attribute_value(
    feature_id,
    attribute_id,
    val_int,
    changeset_id
)
    SELECT
        ft.id as feature_id,
        1 as attribute_id,
        coalesce(amount_of_deposited_::varchar, '0')::int as val_int,
        1 as changeset_id
    FROM
        test_data.import_raw_data ird
        JOIN
        data.feature ft ON ird.id=SUBSTR(ft.name, 9)::int;

INSERT INTO data.feature_attribute_value(
    feature_id,
    attribute_id,
    val_real,
    changeset_id
)
    SELECT
        ft.id as feature_id,
        2 as fetaure_attribute_id,
        coalesce(ave_dist_from_near_village::varchar, '0')::float as val_real,
        1 as changeset_id
    FROM
        test_data.import_raw_data ird
        JOIN
        data.feature ft ON ird.id=SUBSTR(ft.name, 9)::int

