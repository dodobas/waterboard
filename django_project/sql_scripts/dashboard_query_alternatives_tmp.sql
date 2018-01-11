
CREATE OR REPLACE FUNCTION core_utils.get_core_dashboard_data(
    i_attribute_ids text
)
RETURNS TABLE(feature_uuid uuid, beneficiaries int, tabiya int)  AS
/*
Returns base dashboard data based on attribute ids

IN: 	i_attribute_ids - comma separated attribute ids 1,2,3,4
CALL: 	select * from core_utils.get_core_dashboard_data('4,23')

RESULT:
	'007e157d-2d9d-49ba-975e-dae08ef9eeef';4;1
	'007e157d-2d9d-49ba-975e-dae08ef9eeef';23;11
*/

$BODY$
SELECT
    feature_uuid,
    beneficiaries,
    tabiya
FROM
    crosstab(
        'select
                feature_uuid feature_uuid,
                attribute_id as beneficiaries,
                val_int as tabiya
            from
                features.feature_attribute_value fav
            where
                fav.attribute_id  = any ((''{' || $1 || '}'')::int[])
            and
                fav.is_active = True
        order by 1,2'
     )
AS
    (feature_uuid UUID, beneficiaries INT, tabiya INT);
$BODY$
  LANGUAGE SQL STABLE;


-- *
-- * tabiya, beneficiaries
-- * current function name: core_utils.get_dashboard_group_count
-- *

select
    jsonb_agg(row)::text
(

    select
        tabiya as group,
        count(tabiya) as cnt,
        sum(beneficiaries) as beneficiaries
    FROM (
        select
            feature_uuid feature_uuid,
            attribute_id as beneficiaries,
            val_int as tabiya
        from
            features.feature_attribute_value fav
        where
            fav.attribute_id in (5, 23) and fav.is_active = True
        order by 1,2
    ) as fav
    GROUP BY fav.tabiya

) row;


-- *
-- * tabiya,, fencing_exists, count
-- * current function name: core_utils.get_dashboard_fencing_count
-- *

select
    jsonb_agg(row)::text
(

    select
        tabiya as group,
        fencing_exists as fencing,
        count(fencing_exists) cnt
    FROM (
        select
            feature_uuid feature_uuid,
            attribute_id as fencing_exists,
            val_int as tabiya
        from
            features.feature_attribute_value fav
        where
            fav.attribute_id in (4, 23) and fav.is_active = True
        order by 1,2
    ) as fav
    GROUP BY
        fav.tabiya,
        fav.fencing_exists
) row;
