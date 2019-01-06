// WB FORM UTILS - EVENT HANDLING, DATA TRANSFORMATION

import {getFormFieldValues} from "./form.utils";



// FEATURE FORM INSTANCE

/**
 * Custom form disable handler
 * Will toggle form and map marker state (enabled or disabled)
 */
export function featureFormToggleStateHandler(e) {

    let flag = WB.FeatureFormInstance.isFormEnabled !== true;

    WB.FeatureFormInstance.enableForm(flag);
    WB.MapInstance.enableDragging(flag);

    this.innerHTML = flag ? 'Enable edit' : 'Disable edit';

}


/**
 * WB specific form on keyup handling - binds form fields  to map
 * On Form Latitude or Longitude input field change update map marker position
 *
 * @param e         - dom event
 * @param formObj   - form dom object
 */
export function defaultFormFieldOnKeyUp(e, formObj) {
    let fieldNames = ['longitude', 'latitude'];

    // form latitude / longitude on change handler - map marker coords
    let fieldName = e.target.name;

    if (fieldNames.includes(`${fieldName}`)) {

        const {latitude, longitude} = getFormFieldValues(fieldNames, formObj);

        WB.MapInstance.setMarkerPosition({latitude, longitude});
    }
}


/**
 * Feature form REST response data prepare function, mainly used in api.js
 * Changes outer prop names and adds additional fields to attributes attrtibute data (fields)
 * @param responseData
 *   feature_data
 *     - field values, key / value pairs, { attr_name:: attr_value}
 *
 *   attribute_groups
 *     - { group_name: {key: "group_name", label: "label", position: 0}
 *
 *   attribute_attributes
 *     - field definition collection
 *     { attr_name: {key: "attr_name", label: "label", attribute_group: group_name,position: 0, meta: {}, validation}
 * TODO wip
 *
 */
export function prepareFormResponseData(props) {

    const {feature_data, attribute_groups, attribute_attributes} = props;

    let preparedAttributeAttributes = _.reduce(attribute_attributes, (acc, field, fieldName) => {

        field.inputAttributes = [{
            attrName: 'data-group-parent',
            attrValue: `${field.attribute_group}`
        }];

        if (field.meta.result_type === 'DropDown') {
            field.inputAttributes.push({
                attrName: 'wb-selectize',
                attrValue: 'field-for-selectize'
            });
        }

        acc[`${field.key}`] = field;

        return acc;
    }, {});

    return {
        attributeGroups: attribute_groups,
        featureData: feature_data,
        attributeAttributes: preparedAttributeAttributes
    };

}


/**
 * Prepare raw attributes attribute form field configuration
 * Add inputAttributes property used by form render function
 * inputAttributes - array of key value pairs which are used to create form field attributes
 *
 * used custom attributes:
 *   data-group-parent - helper flad to map input field to parent group
 *   wb-selectize      - flag to identify form fields to be selectized
 *
 * @param fields attributeAttributes
 * @returns {{}}
 * @private
 */
export function prepareAttributesAttributeData(fields) {


    return _.reduce(fields, (acc, field, fieldName) => {

        field.inputAttributes = [{
            attrName: 'data-group-parent',
            attrValue: `${field.attribute_group}`
        }];

        if (field.meta.result_type === 'DropDown') {
            field.inputAttributes.push({
                attrName: 'wb-selectize',
                attrValue: 'field-for-selectize'
            });
        }

        acc[`${field.key}`] = field;

        return acc;
    }, {});
}
