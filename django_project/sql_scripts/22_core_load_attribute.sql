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
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable, is_active, show_options)
VALUES (i_label, i_key, i_attr_group_id, 'Text', i_position, i_required, i_orderable, i_searchable, True, False) RETURNING id INTO l_attr_id;

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
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable, is_active, show_options)
VALUES (i_label, i_key, i_attr_group_id, 'Integer', i_position, i_required, i_orderable, i_searchable, True, False) RETURNING id INTO l_attr_id;

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
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable, is_active, show_options)
VALUES (i_label, i_key, i_attr_group_id, 'Decimal', i_position, i_required, i_orderable, i_searchable, True, False) RETURNING id INTO l_attr_id;

END;
$$;


CREATE OR REPLACE FUNCTION core_utils.load_dropdown_attribute(
    i_field_id text, i_label text, i_key text, i_attr_group_id integer, i_required boolean, i_orderable boolean, i_searchable boolean, i_position integer, i_upper boolean default False
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id integer;
BEGIN

    INSERT INTO
    public.attributes_attribute (label, key, attribute_group_id, result_type, position, required, orderable, searchable, is_active, show_options)
        VALUES (i_label, i_key, i_attr_group_id, 'DropDown', i_position, i_required, i_orderable, i_searchable, True, False) RETURNING id INTO l_attr_id;

    execute format($r$INSERT INTO
        public.attributes_attributeoption (option, value, description, position, attribute_id)
    select
        r.option
        , row_number() OVER (ORDER BY r.option)
        , r.description
        , row_number() OVER (ORDER BY r.option) * 10
        , r.attribute_id
    from (
        select
        coalesce(substr(initcap(%s), 1, 128), 'Unknown') as option,
        '' as description,
        %L::int as attribute_id
        from test_data.import_raw_data_2
        group by coalesce(substr(initcap(%s), 1, 128), 'Unknown')
        ORDER BY 1) r;$r$, i_field_id, l_attr_id, i_field_id);

    if i_upper = True THEN
        update attributes_attributeoption Set option = upper(option) WHERE attribute_id = l_attr_id;
    end if;

END;
$$;


CREATE OR REPLACE FUNCTION core_utils.update_show_options() RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    l_attr_id INTEGER;
BEGIN
    FOR l_attr_id IN (SELECT id FROM attributes_attribute WHERE attributes_attribute.result_type = 'DropDown') LOOP
        IF ((SELECT COUNT(*) FROM attributes_attribute AS aa INNER JOIN attributes_attributeoption AS ao on aa.id = ao.attribute_id WHERE aa.id = l_attr_id) BETWEEN 1 AND 10) THEN
            UPDATE attributes_attribute SET show_options = true WHERE id = l_attr_id;
        END IF;
    END LOOP;
END;
$$;
