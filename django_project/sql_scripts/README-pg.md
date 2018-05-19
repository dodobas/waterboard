Existing Rules and DDL
---

        public.attributes_attribute
        
        ON delete
        ON insert


Short descriptions and Function Call examples
---

#### Create Feature

        select core_utils.create_feature(33, --changeset
         ST_SetSRID(ST_Point('38.3', '14.3'), 4326),  -- lat lng
            '{
              "name_of_data_collector": 1,
              "fund_raise": 1,
              "unique_id": "",
              "general_condition": 1,
              "date_of_data_collection": "",
              "reason_of_non_functioning": "",
              "picture_of_scehem": "",
              "constructed_by": 1,
              "power_source": 1,
              "bank_book": 1,
              "pump_type": 1,
              "fencing_exists": 1,
              "scheme_type": 1,
              "intervention_required": 1,
              "zone": 1,
              "bylaw_sirit": 1,
              "name": "sample_test_not_all_fields",
              "funded_by": 1,
              "functioning": 1,
              "kushet": 1,
              "result": 1,
              "water_committe_exist": 1,
              "woreda": 1,
              "guard": 1,
              "tabiya": 1
            }' -- attributes
        );
        
        -- returns  ae8a9f8a-ad4a-4211-93c9-a620f580286e
        
#### Upsert active_data based on existing feature

        select
            *
        from
            core_utils.upsert_active_data_row('2406da44-29a7-4e21-a7e5-7d4a731156da');
