import * as api from '../../api/api';

// using jQuery - $ from globals - window document scope

// selectize options render function
const _optionRenderFunction = ({option}) => `<div><span class="place">${option}</span></div>`;

// create attribute options fetch function for user select input change
const _createOptionLoadFn = (name) => (query, callback) => {

    // this is commented because we want to preload data in selectize (when preloading there is no query)
    // if (!query) {
    //     return callback();
    // }

    return api.axFilterAttributeOption(query, name, callback);
};


/**
 * Initialize selectize on formField
 * Attach filter attribute options callback on user input
 * Renders options in field (from callback)
 *
 * TODO if needed add default conf and user conf as argument
 * @param formField
 */
function selectizeFormDropDown (formField) {

    const name = formField.name;

    if (!name) {
        console.log('No Name found on input field');
        return;
    }

    const _optionLoad = _createOptionLoadFn(name);

    formField.disabled = false;

    return $(formField).selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        multiSelect: false,
        valueField: 'option',
        labelField: 'option',
        searchField: ['option'],
        maxItems: 1,
        create: false,
        preload: true,
        render: {
            option: _optionRenderFunction
        },
        load: _optionLoad,
        onChange: (id) => !id === true
    });

}

/**
 * Selectize all parents child fields identified by selector
 *
 * @param parent
 * @param selector
 */
const selectizeWbFormDropDowns = (parent, selector = '[data-wb-selectize="field-for-selectize"]' ) => {
    _.forEach(parent.querySelectorAll(selector), (field) => selectizeFormDropDown(field));
};


/**
 * Toggle parents child selectized fields enabled / disabled state
 * @param parent
 * @param isFieldEnabled
 * @param fieldSelector
 */
//function toggleSelectizeEnabled(
function shouldSelectizedFormFieldsBeEnabled(
    parent, isFieldEnabled, fieldSelector = '[data-wb-selectize="field-for-selectize"]') {

    let selectized;

    // selectize js method to be called
    let methodName = isFieldEnabled === true ? 'enable' : 'disable';

    _.forEach(parent.querySelectorAll(fieldSelector), (field) => {
         selectized = $(field)[0].selectize;

        if (selectized && selectized[methodName] instanceof Function) {
            selectized[methodName]();
        }
    });
}

// selectizeUtils
const utils = {
    selectizeFormDropDown,
    shouldSelectizedFormFieldsBeEnabled,
    selectizeWbFormDropDowns
};

export default utils;
