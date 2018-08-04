/**
 * Reduce form to key (field name) - value pairs from field names
 *
 * @param fieldNames   - array of field names to pick from form
 * @param form         - form dom object
 * @returns {*}
 */
export const getFormFieldValues = (fieldNames, form) => {
    const fields = form.elements;

    return _.reduce(fieldNames, function (acc, name) {
            if (fields[name]) {
                acc[name] = fields[name].value;
            }
            return acc;
        }, {}
    )
};


/**
 * "Parse" form to get all form fields (will include all valid HTML fields - form.elements)
 * - returns object with key/val field pairs
 * - field name represents the key, val is the dom obj
 *
 * @param form         - form dom object
 * @returns {object}
 */
export const getFormFields = (form) => {
    return _.reduce(form.elements, function (acc, field, i) {
            if (field.name) {
                acc[field.name] = field;
            }
            return acc;
        }, {}
    )
};

/**
 * Set form field value from a key/val pair
 * - key represents the field name, val the value
 * - the field name must exist in this.formFields
 *
 * @param fieldData    - array of key (field name )/ value pairs
 * @param form         - form dom object
 */
export const setFormFieldValues = (fieldData, form) => {
    const fields = form.elements;

    _.forEach(fieldData, (fieldName) => {
        if (fields[fieldName]) {
            fields[fieldName].value = fieldData[fieldName];
        }
    });
};
