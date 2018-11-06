const VALIDATIONS_TEXT = {
    VALUE_TOO_SHORT: (val) => `Value to short. Min ${val}`,
    VALUE_TOO_LONG: (val) => `Value to long. Max: ${val}`,
    IS_NOT_DECIMAL: 'Not a decimal number.',
    IS_NOT_INT: 'Not a number.',
    IS_EMPTY: 'Field cannot be empty.',
    INVALID_CHARACTERS: 'Invalid characters.'
};

const RULES = {
    minLength(value, ruleVal) {
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
    maxLength(value, ruleVal) {
        if (value && value.length > ruleVal) {
            return {
                errorText: VALIDATIONS_TEXT.VALUE_TOO_LONG(ruleVal)
            }
        }
        return false;
    },
    required(inputValue) {
        if (_.isNil(inputValue) || inputValue === '') {

            return {
                errorText: VALIDATIONS_TEXT.IS_EMPTY
            }
        }
        return false;
    }
};


/**
 * validateValues('knek', {required: true, minLength: 3})
 * {
    required: true,
    minLength: 3,
    maxLength: 255
}
 * @param value
 * @param rules
 * @returns {*}
 */
export const validateValues = (value, rules) => {
    return _.reduce(rules, (acc, ruleVal, ruleKey) => {

        let check = RULES[`${ruleKey}`](value, ruleVal);

        if (check) {
            acc[`${ruleKey}`] = check;
        }

        return acc;
    }, {})
};

/**
 * Validate form data collection against validation rules in config
 * form field and validation rules have same key
 *
 * @param formData
 * @param config
 */
export function defaultValidateFormFn(formData, config) {

    let formErrors = {};

    _.forEach(formData, (item) => {

        let {dataGroupParent, name, value} = item;

        // TODO what todo when no config found, no key in configuration found
        let validationRules = _.get(config, `${dataGroupParent}.fields.${name}.validation`, {});

        let error = validateValues(value , validationRules);

        if (Object.keys(error).length > 0) {
               formErrors[name] = error;
            }
        });

    return formErrors;
}
