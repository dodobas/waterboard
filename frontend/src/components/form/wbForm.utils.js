// WB FORM UTILS - EVENT HANDLING, DATA TRANSFORMATION

import {getFormFieldValues} from "./formFieldsDataHandler";

/**
 * WB specific form on keyup handling - binds form fields  to map
 * On Form Latitude or Longitude input field change update map marker position
 *
 * @param e         - dom event
 * @param formObj   - form dom object
 */
export function defaultFormFieldOnKeyUp (e, formObj) {
    let fieldNames = ['longitude', 'latitude'];

    // form latitude / longitude on change handler - map marker coords
    let fieldName = e.target.name;

    if (fieldNames.includes(`${fieldName}`)) {

        const {latitude, longitude} = getFormFieldValues(fieldNames, formObj);

        WB.MapInstance.setMarkerPosition({latitude, longitude});
    }
}



/**
 * Feature form prepare function
 * Prepares fetched WB form data and configuration
 * @param responseData
 *   feature_data
 *     - field values, key / value pairs, { attr_name:: attr_value}
 *
 *   attribute_groups
 *     - { group_name: {key: "group_name", label: "label", position: 0}
 *
 *   attribute_attributes
 *     - field difinition collection
 *     { attr_name: {key: "attr_name", label: "label", attribute_group: group_name,position: 0, meta: {}, validation}
 * TODO wip
 *
 *
 *
 *
 * @private
 */
export function prepareFormResponseData(responseData) {
    console.log('responseData', responseData);
     const conf = {};

        let {feature_data, attribute_groups, attribute_attributes} = responseData;

        conf.attributeGroups = prepareAttributesAttributeData(
            attribute_attributes,
            attribute_groups
        );

        conf.featureData = feature_data;

        conf.attributeAttributes = attribute_attributes;

        return conf;
}




/**
 * Prepare raw attributes attribute form field configuration
 * Currently add inputAttributes property used by form render function
 * inputAttributes - array of key value pairs which are used to create form field attributes
 *
 * used custom attributes:
 *   data-group-parent - helper flad to map input field to parent group
 *   wb-selectize      - flag to identify form fields to be selectized
 * @param attributeAttributes
 * @returns {{}}
 * @private
 */
export function prepareAttributesAttributeData(attributeAttributes, attributeGroups) {

    let groups = _.reduce(attributeGroups,(acc, val, i) => {
        acc[i] = val;
        acc[i].fields = {};
        return acc;
    }, {});

    let attributes = Object.assign({}, attributeAttributes);

    let keys = Object.keys(attributes);
    let cnt = keys.length;
    let i = 0, attr, attrKey;
/*

    let c = _.reduce(attributeAttributes, (acc, fieldDef, fieldKey) => {
        acc[`${fieldDef.key}`] =  Object.assign({}, fieldDef);


        return acc;
    }, {});
   */
    for (i; i < cnt; i += 1) {
        attrKey = keys[i];

        attr = attributes[`${attrKey}`];


        attr.inputAttributes = [{
            attrName: 'data-group-parent',
            attrValue: `${attr.attribute_group}`
        }];

        if (attr.meta.result_type === 'DropDown') {
            attr.inputAttributes.push({
                attrName: 'wb-selectize',
                attrValue: 'field-for-selectize'
            });
        }

        // groups[`${attr.attribute_group}`].fields[`${attrKey}`] = Object.assign({}, attr);
        groups[`${attr.attribute_group}`].fields[`${attrKey}`] = Object.assign({}, attr);

    }

    return groups;
}




/**
 * Parse form values and attributes based on initial data keys Object.keys(this.data)
 * Returns parsed fields as json object: name, value
 * TODO parse inputAttributes dynamic
 * {"altitude": {
 *     "name": "altitude",
 *     "value": "1803"
 *   }
 * }
 */
/**
 * Get form field values as collection { 'field_key': {name: 'field_key', value: 'field_value'}}
 *
 * @param dataKeysToBeParsed (array)- ["name", "zone", "depth", "yield", "kushet", "result", "tabiya"]
 * @param formObj - form dom object
 *
 * returns collection {'field_key': {name: 'field_key', value: 'field_value'}}
 *  * {"altitude": {
 *     "name": "altitude",
 *     "value": "1803"
 *   }
 * }
 */
export function defaultFormParseOnSubmitFn(dataKeysToBeParsed, formObj) {
    let parsed = {};

    _.forEach(dataKeysToBeParsed, (fieldName) => {

        let field = formObj.elements[`${fieldName}`];

        if (field) {
            let name = field.getAttribute("name");

            if (name) {
                parsed[name] = {
                    name: name,
                    value: field.value
                }
            }
        }


    });

    return parsed;
}
