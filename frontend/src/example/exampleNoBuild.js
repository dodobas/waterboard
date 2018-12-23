import {getFormFieldValues} from "../components/form/formFieldsDataHandler";
import WbForm from "../components/form/wbForm";
import api from "../api/api";
import {attributesFormLatLngInputOnChange} from "../components/form/wbForm.utils";

const {formFields, sampleFormData, wbFormUtils} = WBLib.form;
//
// // FORM HELPER METHODS
//
 let {createDomObjectFromTemplate, textInputFieldTemplate} = formFields;
const {
    attribute_attributes, // group field conf
    attribute_groups, // group conf
    feature_data // field data
} = sampleFormData;
// groupedFieldsByType = {location_description: [{}], scheme_description: []}
/*
attribute_group: "location_description"
key: "name"
label: "Name"
orderable: true
position: 40
required: true
result_type: "Text"
searchable: false
value: "knek"
*/


let attributeGroups = wbFormUtils.prepareAttributesAttributeData(
    attribute_attributes,
    attribute_groups
);


let k = new WBLib.form.WbForm({
    data: feature_data,
    config: attributeGroups,
    activeTab: 'location_description',
    parentId: 'example-form',
    navigationId: 'form-nav',
    actionsId: 'form-actions'
});
k.render();


new WbForm({
        data: featureData,
        config: attributeGroups,
        activeTab: 'location_description',
        parentId: 'wb-update-feature-form',
        navigationId: 'form-nav',
        actionsId: 'form-actions',
        fieldsToBeSelectizedSelector: '[data-wb-selectize="field-for-selectize"]',
        isFormEnabled: false,
        handleKeyUpFn: (e, formObj) => {
            // form latitude / longitude on change handler - map marker coords
            let fieldName = e.target.name;

            if (['longitude', 'latitude'].includes(`${fieldName}`)) {

                const {latitude, longitude} = getFormFieldValues(
                    ['latitude', 'longitude'], formObj
                );
                attributesFormLatLngInputOnChange({latitude, longitude});
            }
        },
        handleOnSubmitFn: (formData) => {
            api.axUpdateFeature({
                data: formData,
                feature_uuid: feature_uuid
            })
        }
    });
