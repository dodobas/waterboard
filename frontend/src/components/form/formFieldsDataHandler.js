// FORM OBJECT DATA HANDLER FUNCTIONS

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
 * Set form field value from a key/val pair
 * - key represents the field name, val the value
 * - the field name must exist in form.elements
 *
 * @param fieldData    - array of key (field name )/ value pairs
 * @param form         - form dom object
 */
export const setFormFieldValues = (fieldData, form) => {
    const fields = form.elements;

    _.forEach(fieldData, (fieldValue, fieldName) => {
        if (fields[fieldName]) {
            fields[fieldName].value = fieldValue;
        }
    });
};

/** TODO function name ...
 * Enable or disable all form elements (fields) in form
 * @param form         - dom object
 * @param formEnabled  - bool
 * @private
 */
export const _shouldFormFieldsBeEnabled = (form, formEnabled = false) => {
    _.forEach(form.elements, (field) => {
        field.disabled = formEnabled === false;
    });
};
