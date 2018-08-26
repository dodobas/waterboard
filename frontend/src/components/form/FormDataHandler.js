// TODO form state handler


class FormDataHandler {
    constructor(conf, data) {

    }
}

const sampleFormData = {
  "feature_data": {
    "name": "knek",
    "zone": "pecina",
    "depth": null,
    "guard": "Unknown",
    "yield": 12.09000000,
    "kushet": "k_kushet",
    "result": "k_result",
    "tabiya": "k_tabiya",
    "woreda": "k_woreda",
    "altitude": -1.00000000,
    "latitude": 13.59680000,
    "bank_book": "Unknown",
    "funded_by": "k_knek",
    "livestock": null,
    "longitude": 37.41960000,
    "pump_type": "k_pump_type",
    "unique_id": "13377331",
    "fund_raise": "No",
    "bylaw_sirit": "Unknown",
    "functioning": "Yes",
    "scheme_type": "k_scheme_type",
    "power_source": "k_power_source",
    "beneficiaries": 110,
    "constructed_by": "k_constructed_by",
    "fencing_exists": "Yes",
    "construction_year": 2008,
    "general_condition": "Unknown",
    "picture_of_scehem": null,
    "static_water_level": null,
    "amount_of_deposited": null,
    "female_beneficiaries": null,
    "water_committe_exist": "Yes",
    "beneficiaries_outside": null,
    "intervention_required": "Unknown",
    "name_of_data_collector": null,
    "date_of_data_collection": null,
    "reason_of_non_functioning": "Unknown",
    "ave_dist_from_near_village": null,
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
      "label": "Name",
      "position": 40,
      "required": true,
      "orderable": true,
      "searchable": false,
      "result_type": "Text",
      "attribute_group": "location_description"
    },
    "zone": {
      "key": "zone",
      "label": "Zone",
      "position": 0,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "location_description"
    },
    "depth": {
      "key": "depth",
      "label": "Depth",
      "position": 40,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "scheme_description"
    },
    "guard": {
      "key": "guard",
      "label": "Guard",
      "position": 60,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "yield": {
      "key": "yield",
      "label": "Yield (l/s)",
      "position": 50,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "scheme_description"
    },
    "kushet": {
      "key": "kushet",
      "label": "Kushet",
      "position": 30,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "location_description"
    },
    "result": {
      "key": "result",
      "label": "Result",
      "position": 30,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "tabiya": {
      "key": "tabiya",
      "label": "Tabiya",
      "position": 20,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "location_description"
    },
    "woreda": {
      "key": "woreda",
      "label": "Woreda",
      "position": 10,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "location_description"
    },
    "altitude": {
      "key": "altitude",
      "label": "Altitude",
      "position": 70,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "location_description"
    },
    "latitude": {
      "key": "latitude",
      "label": "Latitude",
      "position": 50,
      "required": true,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "location_description"
    },
    "bank_book": {
      "key": "bank_book",
      "label": "Bank Book",
      "position": 40,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "funded_by": {
      "key": "funded_by",
      "label": "Funded By",
      "position": 90,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "livestock": {
      "key": "livestock",
      "label": "Livestock",
      "position": 60,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Integer",
      "attribute_group": "service_description"
    },
    "longitude": {
      "key": "longitude",
      "label": "Longitude",
      "position": 60,
      "required": true,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "location_description"
    },
    "pump_type": {
      "key": "pump_type",
      "label": "Pump Type",
      "position": 70,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "unique_id": {
      "key": "unique_id",
      "label": "Unique id",
      "position": 0,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Text",
      "attribute_group": "scheme_description"
    },
    "fund_raise": {
      "key": "fund_raise",
      "label": "Fund Raise",
      "position": 20,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "bylaw_sirit": {
      "key": "bylaw_sirit",
      "label": "Bylaw Sirit",
      "position": 10,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "functioning": {
      "key": "functioning",
      "label": "Functioning",
      "position": 0,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "service_description"
    },
    "scheme_type": {
      "key": "scheme_type",
      "label": "Scheme Type",
      "position": 10,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "power_source": {
      "key": "power_source",
      "label": "Power Source",
      "position": 80,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "beneficiaries": {
      "key": "beneficiaries",
      "label": "Beneficiaries in 1km",
      "position": 30,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Integer",
      "attribute_group": "service_description"
    },
    "constructed_by": {
      "key": "constructed_by",
      "label": "Constructed By",
      "position": 100,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "scheme_description"
    },
    "fencing_exists": {
      "key": "fencing_exists",
      "label": "Fencing Exist",
      "position": 50,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "construction_year": {
      "key": "construction_year",
      "label": "Year of Construction",
      "position": 20,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Integer",
      "attribute_group": "scheme_description"
    },
    "general_condition": {
      "key": "general_condition",
      "label": "General Condition",
      "position": 80,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "service_description"
    },
    "picture_of_scehem": {
      "key": "picture_of_scehem",
      "label": "Picture of Scehem",
      "position": 100,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Text",
      "attribute_group": "management_description"
    },
    "static_water_level": {
      "key": "static_water_level",
      "label": "Static Water Level (m)",
      "position": 60,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "scheme_description"
    },
    "amount_of_deposited": {
      "key": "amount_of_deposited",
      "label": "Amount of Fund Deposit (Birr)",
      "position": 30,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "management_description"
    },
    "female_beneficiaries": {
      "key": "female_beneficiaries",
      "label": "Female Beneficiaries in 1km",
      "position": 40,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Integer",
      "attribute_group": "service_description"
    },
    "water_committe_exist": {
      "key": "water_committe_exist",
      "label": "Water Committe Exist",
      "position": 0,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "beneficiaries_outside": {
      "key": "beneficiaries_outside",
      "label": "Beneficiaries outside 1km",
      "position": 50,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Integer",
      "attribute_group": "service_description"
    },
    "intervention_required": {
      "key": "intervention_required",
      "label": "Intervention Required",
      "position": 20,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "service_description"
    },
    "name_of_data_collector": {
      "key": "name_of_data_collector",
      "label": "Name of Data Collector",
      "position": 70,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "management_description"
    },
    "date_of_data_collection": {
      "key": "date_of_data_collection",
      "label": "Date of Data Collection",
      "position": 80,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Text",
      "attribute_group": "management_description"
    },
    "reason_of_non_functioning": {
      "key": "reason_of_non_functioning",
      "label": "Reason of Non Functioning",
      "position": 10,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "DropDown",
      "attribute_group": "service_description"
    },
    "ave_dist_from_near_village": {
      "key": "ave_dist_from_near_village",
      "label": "Average distance from nearby village (km)",
      "position": 70,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Decimal",
      "attribute_group": "service_description"
    },
    "name_and_tel_of_contact_person": {
      "key": "name_and_tel_of_contact_person",
      "label": "Name and tel of Contact Person",
      "position": 90,
      "required": false,
      "orderable": true,
      "searchable": false,
      "result_type": "Text",
      "attribute_group": "management_description"
    }
  }
};

export default sampleFormData;

export default FormDataHandler;
