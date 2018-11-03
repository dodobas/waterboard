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

// http://127.0.0.1:8008/api/feature/cc163a61-e6c9-4c9b-9b6b-fa89bfeb254f/


// fetch(`http://127.0.0.1:8008/api/feature/cc163a61-e6c9-4c9b-9b6b-fa89bfeb254f/`)
//     .then((resp) => {
//     console.log(resp);
// }).catch((e) => {
//     console.log(e);
// })

let k = new WBLib.form.WbForm({
    data: feature_data,
    config: attributeGroups,
    activeTab: 'location_description',
    parentId: 'example-form',
    navigationId: 'form-nav',
    actionsId: 'form-actions'
});
k.render();
// k.setActiveTab('management_description')

// WBLib.form.selectizeUtils.selectizeWbFormDropDowns(formObj, '[data-wb-selectize="field-for-selectize"]')
/*
export {
    createFormNavigation: _createFormNavigation,
    createFormContent: _createFormContent
}

Form field definition

value: ""
key: "livestock"         -- name, id
label: "Livestock"

attribute_group: "service_description"

result_type: "Integer"  -- render function indentifier (data type)

orderable: true
position: 60
required: false
searchable: false


error
validation

*/
