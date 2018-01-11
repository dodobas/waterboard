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
