const sampleFormData = {
  "feature_data": {
    "name": "Adi-Kerni",
    "zone": "Central",
    "depth": 40.00000000,
    "guard": "Unknown",
    "yield": 7.60000000,
    "kushet": "Edaga-Kedam",
    "result": "Productive",
    "tabiya": "Adi-Zata",
    "woreda": "Ahferom",
    "altitude": 2086.00000000,
    "latitude": 14.22000000,
    "bank_book": "Unknown",
    "funded_by": "Rest",
    "livestock": null,
    "longitude": 39.08700000,
    "pump_type": "Afd",
    "unique_id": "01030200031",
    "fund_raise": "Yes",
    "bylaw_sirit": "Unknown",
    "functioning": "Yes",
    "scheme_type": "SHW",
    "power_source": "Human",
    "beneficiaries": 191,
    "constructed_by": "Rest",
    "fencing_exists": "Yes",
    "construction_year": 1995,
    "general_condition": "Good",
    "picture_of_scehem": null,
    "static_water_level": null,
    "amount_of_deposited": 1500.00000000,
    "female_beneficiaries": null,
    "water_committe_exist": "Yes",
    "beneficiaries_outside": null,
    "intervention_required": "Unknown",
    "name_of_data_collector": "Amaha",
    "date_of_data_collection": "6/17/11",
    "reason_of_non_functioning": "Unknown",
    "ave_dist_from_near_village": 0.30000000,
    "name_and_tel_of_contact_person": null
  },
  "attribute_groups": {
    "scheme_description": {
      "key": "scheme_description",
      "label": "Scheme description",
      "position": 1
    },
    "service_description": {
      "key": "service_description",
      "label": "Service description",
      "position": 2
    },
    "location_description": {
      "key": "location_description",
      "label": "Location description",
      "position": 0
    },
    "management_description": {
      "key": "management_description",
      "label": "Management description",
      "position": 3
    }
  },
  "attribute_attributes": {
    "name": {
      "key": "name",
      "meta": {
        "required": true,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Name",
      "position": 40,
      "attribute_group": "location_description"
    },
    "zone": {
      "key": "zone",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Zone",
      "position": 0,
      "attribute_group": "location_description"
    },
    "depth": {
      "key": "depth",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Depth",
      "position": 40,
      "attribute_group": "scheme_description"
    },
    "guard": {
      "key": "guard",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Guard",
      "position": 60,
      "attribute_group": "management_description"
    },
    "yield": {
      "key": "yield",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Yield (l/s)",
      "position": 50,
      "attribute_group": "scheme_description"
    },
    "kushet": {
      "key": "kushet",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Kushet",
      "position": 30,
      "attribute_group": "location_description"
    },
    "result": {
      "key": "result",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Result",
      "position": 30,
      "attribute_group": "scheme_description"
    },
    "tabiya": {
      "key": "tabiya",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Tabiya",
      "position": 20,
      "attribute_group": "location_description"
    },
    "woreda": {
      "key": "woreda",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Woreda",
      "position": 10,
      "attribute_group": "location_description"
    },
    "altitude": {
      "key": "altitude",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Altitude",
      "position": 70,
      "attribute_group": "location_description"
    },
    "latitude": {
      "key": "latitude",
      "meta": {
        "required": true,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Latitude",
      "position": 50,
      "attribute_group": "location_description"
    },
    "bank_book": {
      "key": "bank_book",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Bank Book",
      "position": 40,
      "attribute_group": "management_description"
    },
    "funded_by": {
      "key": "funded_by",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Funded By",
      "position": 90,
      "attribute_group": "scheme_description"
    },
    "livestock": {
      "key": "livestock",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Integer"
      },
      "label": "Livestock",
      "position": 60,
      "attribute_group": "service_description"
    },
    "longitude": {
      "key": "longitude",
      "meta": {
        "required": true,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Longitude",
      "position": 60,
      "attribute_group": "location_description"
    },
    "pump_type": {
      "key": "pump_type",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Pump Type",
      "position": 70,
      "attribute_group": "scheme_description"
    },
    "unique_id": {
      "key": "unique_id",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Unique id",
      "position": 0,
      "attribute_group": "scheme_description"
    },
    "fund_raise": {
      "key": "fund_raise",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Fund Raise",
      "position": 20,
      "attribute_group": "management_description"
    },
    "bylaw_sirit": {
      "key": "bylaw_sirit",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Bylaw Sirit",
      "position": 10,
      "attribute_group": "management_description"
    },
    "functioning": {
      "key": "functioning",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Functioning",
      "position": 0,
      "attribute_group": "service_description"
    },
    "scheme_type": {
      "key": "scheme_type",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Scheme Type",
      "position": 10,
      "attribute_group": "scheme_description"
    },
    "power_source": {
      "key": "power_source",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Power Source",
      "position": 80,
      "attribute_group": "scheme_description"
    },
    "beneficiaries": {
      "key": "beneficiaries",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Integer"
      },
      "label": "Beneficiaries in 1km",
      "position": 30,
      "attribute_group": "service_description"
    },
    "constructed_by": {
      "key": "constructed_by",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Constructed By",
      "position": 100,
      "attribute_group": "scheme_description"
    },
    "fencing_exists": {
      "key": "fencing_exists",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Fencing Exist",
      "position": 50,
      "attribute_group": "management_description"
    },
    "construction_year": {
      "key": "construction_year",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Integer"
      },
      "label": "Year of Construction",
      "position": 20,
      "attribute_group": "scheme_description"
    },
    "general_condition": {
      "key": "general_condition",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "General Condition",
      "position": 80,
      "attribute_group": "service_description"
    },
    "picture_of_scehem": {
      "key": "picture_of_scehem",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Picture of Scehem",
      "position": 100,
      "attribute_group": "management_description"
    },
    "static_water_level": {
      "key": "static_water_level",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Static Water Level (m)",
      "position": 60,
      "attribute_group": "scheme_description"
    },
    "amount_of_deposited": {
      "key": "amount_of_deposited",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Amount of Fund Deposit (Birr)",
      "position": 30,
      "attribute_group": "management_description"
    },
    "female_beneficiaries": {
      "key": "female_beneficiaries",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Integer"
      },
      "label": "Female Beneficiaries in 1km",
      "position": 40,
      "attribute_group": "service_description"
    },
    "water_committe_exist": {
      "key": "water_committe_exist",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Water Committe Exist",
      "position": 0,
      "attribute_group": "management_description"
    },
    "beneficiaries_outside": {
      "key": "beneficiaries_outside",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Integer"
      },
      "label": "Beneficiaries outside 1km",
      "position": 50,
      "attribute_group": "service_description"
    },
    "intervention_required": {
      "key": "intervention_required",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Intervention Required",
      "position": 20,
      "attribute_group": "service_description"
    },
    "name_of_data_collector": {
      "key": "name_of_data_collector",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Name of Data Collector",
      "position": 70,
      "attribute_group": "management_description"
    },
    "date_of_data_collection": {
      "key": "date_of_data_collection",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Date of Data Collection",
      "position": 80,
      "attribute_group": "management_description"
    },
    "reason_of_non_functioning": {
      "key": "reason_of_non_functioning",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "DropDown"
      },
      "label": "Reason of Non Functioning",
      "position": 10,
      "attribute_group": "service_description"
    },
    "ave_dist_from_near_village": {
      "key": "ave_dist_from_near_village",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Decimal"
      },
      "label": "Average distance from nearby village (km)",
      "position": 70,
      "attribute_group": "service_description"
    },
    "name_and_tel_of_contact_person": {
      "key": "name_and_tel_of_contact_person",
      "meta": {
        "required": false,
        "orderable": true,
        "searchable": false,
        "result_type": "Text"
      },
      "label": "Name and tel of Contact Person",
      "position": 90,
      "attribute_group": "management_description"
    }
  }
};
export default sampleFormData;
