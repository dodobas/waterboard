const VALIDATIONS_TEXT = {
    VALUE_TOO_SHORT: (val) => `Value to short. Min ${val}`,
    VALUE_TOO_LONG: (val) => `Value to long. Max: ${val}`,
    IS_NOT_DECIMAL: 'Not a decimal number.',
    IS_NOT_INT: 'Not a number.',
    IS_EMPTY: 'Field cannot be empty.',
    INVALID_CHARACTERS: 'Invalid characters.'
};

/**
 * Value Validator functions
 *
 * @type {{min_length(*=, *=): (*|boolean), int(*=): (boolean|*), decimal(*=): (boolean|*), max_length(*=, *=): (*|boolean), required(*=): (*|boolean)}}
 */
const RULES = {
    min_length(value, ruleVal) {
        if (value && value.length < ruleVal) {
            return {
                errorText: VALIDATIONS_TEXT.VALUE_TOO_SHORT(ruleVal)
            }
        }
        return false;
    },
    int(value) {
        if (!value || value === '') {
            return false;
        }
        let regex=/^[0-9]+$/;

        if (!value.match(regex)) {
            return {
                errorText: VALIDATIONS_TEXT.IS_NOT_INT
            }
        }
        return false;
    },
    decimal(value)  {
        if (!value || value === '') {
            return false;
        }
// zarez je delimiter
        // let regex=/^(\d+,?\d*)$/;
        let regex=/^(\d+.?\d*)$/;

        if (!value.match(regex)) {
            return {
                errorText: VALIDATIONS_TEXT.IS_NOT_DECIMAL
            }
        }
        return false;
        },
    max_length(value, ruleVal) {
        if (value && value.length > ruleVal) {
            return {
                errorText: VALIDATIONS_TEXT.VALUE_TOO_LONG(ruleVal)
            }
        }
        return false;
    },
    required(inputValue, ruleVal) {
        if (ruleVal === true && (_.isNil(inputValue) || inputValue === '')) {

            return {
                errorText: VALIDATIONS_TEXT.IS_EMPTY
            }
        }
        return false;
    }
};

/**
 * Validate a value against a set of rules
 * Returns collection of errors
 *
 *     validateValue('knek', {required: true, minLength: 3})
 *
 * @param value (any)
 * @param rules (any)
 * @returns {*}
 */
export const validateValue = (value, rules) => {

    return _.reduce(rules, (acc, ruleVal, ruleKey) => {

        let check = RULES[`${ruleKey}`](value, ruleVal);

        if (check) {
            acc[`${ruleKey}`] = check;
        }

        return acc;
    }, {})
};

/**
 * Validate data against validation rules
 *
 * form field and validation rules have same key
 *
 * @param data (object) {zone: 'Central', accuracy: ''}
 * @param validationRules (object) {zone: {validation: {required: false}}, accuracy: {validation: {required: false}}}
 * @returns (object) {accuracy: {required: {errorText: "Field cannot be empty."}} errors found
 */
export function validateDataAgainstRules(data, validationRules) {

    console.log('validateDataAgainstRules', data, validationRules);

    return _.reduce(data, (dataErrors, fieldValue, fieldName) => {

        let fieldRules = _.get(validationRules, `${fieldName}.validation`, {});

        let fieldErrors = validateValue(fieldValue , fieldRules);



        if (Object.keys(fieldErrors).length > 0) {
               dataErrors[fieldName] = fieldErrors;
        }

        return dataErrors;
    }, {});
}


export function DataValidator (options) {
    const {
        dataValidationRules,
        validationRuleFncs = RULES
    } = options;

    this.dataValidationRules = dataValidationRules;

    this.validationRuleFncs = validationRuleFncs;

    //RULES
}







