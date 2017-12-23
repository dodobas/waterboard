-- *
-- Load basic healthsite information
-- *
insert into healthsites_healthsite (
    name,
    point_geometry,
    version,
    uuid,
    date,
    is_healthsites_io
)
    select
        'feature_' || id as name,
        ST_SetSRID(ST_Point(Longitude::double precision, Latitude::double precision), 4326) as point_geometry,
        1 as version,
        md5(id::text)::text as uuid,
        clock_timestamp() as date,
        true as is_healthsites_io
    from
        test_data.import_raw_data;

-- *
-- For every healthsite create an assessment
-- *
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

-- *
-- Create metadata for healthsite criteria - Amount_of_Deposited_
-- *
INSERT INTO
    healthsites_assessmentgroup (id, name, "order")
VALUES (1, 'Deposited', 0);

INSERT INTO
    healthsites_assessmentcriteria (id, name, assessment_group_id, result_type, placeholder)
VALUES (1, 'Amount_of_Deposited_', 1, 'Integer', null);

INSERT INTO
    healthsites_assessmentcriteria (id, name, assessment_group_id, result_type, placeholder)
VALUES (2, 'ave_dist_from_near_village', 1, 'Decimal', null);

-- *
-- Load Amount_of_Deposited_ data from the intermediary raw data table
-- *
-- INSERT INTO healthsites_healthsiteassessmententryinteger(
--     selected_option, assessment_criteria_id, healthsite_assessment_id
-- )
--     SELECT
--         coalesce(amount_of_deposited_::varchar, '0')::int as selected_option, 1 as assessment_criteria_id, hhass.id as healthsite_assessment_id
--     FROM test_data.import_raw_data ird INNER JOIN healthsites_healthsite hs ON ird.id=SUBSTR(hs.name, 9)::int
--         INNER JOIN healthsites_healthsiteassessment hhass ON hhass.healthsite_id=hs.id;


-- *
-- Load Amount_of_Deposited_ data from the intermediary raw data table
-- *

INSERT INTO data.changeset (
    id,
    webuser_id,
    version
) select
      1 as id,
      1 as webuser_id,
      1 as version;

INSERT INTO data.changeset (
    id,
    webuser_id,
    version
) select
      2 as id,
      1 as webuser_id,
      1 as version;

INSERT INTO data.feature_attribute_value(
    assessment_criteria_id,
    healthsite_assessment_id,
    val_real,
    changeset_id
)
    SELECT
        2 as assessment_criteria_id,
        hhass.id as healthsite_assessment_id,
        coalesce(ave_dist_from_near_village::varchar, '0')::float as val_real,
        2 as changeset_id
    FROM
        test_data.import_raw_data ird
        JOIN
        healthsites_healthsite hs ON ird.id=SUBSTR(hs.name, 9)::int
        JOIN
        healthsites_healthsiteassessment hhass ON hhass.healthsite_id=hs.id;


-- transpose data



INSERT INTO feature_attribute_value (
    healthsite_assessment_id,
    assessment_criteria_id,
    val_int,
    changeset_id
)
    SELECT
        h_as.id as healthsite_assessment_id,
        hai.assessment_criteria_id as assessment_criteria_id,
        hai.selected_option as val_int,
        1 as changeset_id
    FROM healthsites_healthsiteassessment h_as inner join healthsites_healthsiteassessmententryinteger hai
            ON h_as.id = hai.healthsite_assessment_id;


