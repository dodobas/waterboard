-- FUNCTIONS FOR INITIAL DATA LOAD - excel -> csv -> DB

-- 'Unique ID', 'unique_id', 1, 'Text', 0, TRUE, TRUE, FALSE

CREATE OR REPLACE FUNCTION core_utils.load_text_attribute(
    i_field_id text, i_label text, i_key text, i_attr_group_id integer, i_required boolean, i_orderable boolean, i_searchable boolean, i_position integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id integer;
BEGIN

    INSERT INTO
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (i_label, i_key, i_attr_group_id, 'Text', i_position, i_required, i_orderable, i_searchable) RETURNING id INTO l_attr_id;


execute format($r$INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_text,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    %L as attribute_id,
    ird.%s,
    1 as changeset_id
FROM
    test_data.import_raw_data_2 ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;$r$, l_attr_id, i_field_id);
END;
$$;

CREATE OR REPLACE FUNCTION core_utils.load_integer_attribute(
    i_field_id text, i_label text, i_key text, i_attr_group_id integer, i_required boolean, i_orderable boolean, i_searchable boolean, i_position integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id integer;
BEGIN

    INSERT INTO
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (i_label, i_key, i_attr_group_id, 'Integer', i_position, i_required, i_orderable, i_searchable) RETURNING id INTO l_attr_id;


execute format($r$INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    %L as attribute_id,
    cast(ird.%s as int),
    1 as changeset_id
FROM
    test_data.import_raw_data_2 ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id$r$, l_attr_id, i_field_id);
END;
$$;

CREATE OR REPLACE FUNCTION core_utils.load_decimal_attribute(
    i_field_id text, i_label text, i_key text, i_attr_group_id integer, i_required boolean, i_orderable boolean, i_searchable boolean, i_position integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id integer;
BEGIN

    INSERT INTO
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable)
VALUES (i_label, i_key, i_attr_group_id, 'Decimal', i_position, i_required, i_orderable, i_searchable) RETURNING id INTO l_attr_id;


execute format($r$INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_real,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    %L as attribute_id,
    cast(ird.%s as double precision),
    1 as changeset_id
FROM
    test_data.import_raw_data_2 ird
    JOIN
    features.feature ft ON ird.id=ft.upstream_id;$r$, l_attr_id, i_field_id);
END;
$$;


CREATE OR REPLACE FUNCTION core_utils.load_dropdown_attribute(
    i_field_id text, i_label text, i_key text, i_attr_group_id integer, i_required boolean, i_orderable boolean, i_searchable boolean, i_position integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id integer;
BEGIN

    INSERT INTO
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable)
        VALUES (i_label, i_key, i_attr_group_id, 'DropDown', i_position, i_required, i_orderable, i_searchable) RETURNING id INTO l_attr_id;

    execute format($r$INSERT INTO
        public.attributes_attributeoption (option, value, description, position, attribute_id)
    select
        r.option
        , row_number() OVER (ORDER BY r.option)
        , r.description
        , row_number() OVER (ORDER BY r.option)
        , r.attribute_id
    from (
        select
        coalesce(substr(initcap(%s), 1, 128), 'Unknown') as option,
        '' as description,
        %L::int as attribute_id
        from test_data.import_raw_data_2
        group by coalesce(substr(initcap(%s), 1, 128), 'Unknown')
        ORDER BY 1) r;$r$, i_field_id, l_attr_id, i_field_id);

    execute format($r$INSERT INTO features.feature_attribute_value(
    feature_uuid,
    attribute_id,
    val_int,
    changeset_id
) SELECT
    ft.feature_uuid as feature_uuid,
    %L as attribute_id,
    aao.value as val_int,
    1 as changeset_id
FROM
    test_data.import_raw_data_2 ird JOIN features.feature ft
        ON ird.id=ft.upstream_id
    JOIN public.attributes_attributeoption aao
        ON coalesce(substr(initcap(ird.%s), 1, 128), 'Unknown') = aao.option AND aao.attribute_id = %L;$r$, l_attr_id, i_field_id, l_attr_id);

END;
$$;





