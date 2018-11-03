/**
 * Every property name represents a form field
 *
 * @type {{sum: {int: boolean, maxLength: number}, location: {required: boolean}, woreda: {required: boolean, maxLength: number}}}
 */
const SAMPLE_VALIDATION_RULES = {
    sum: {
        int: true,
        maxLength: 20,
    },
    location: {
        required: true
    },
    woreda: {
        required: true,
        maxLength: 255
    },
/*
    field_name: {
        validator_rule: validator_value
    }
*/
};


export default SAMPLE_VALIDATION_RULES;
