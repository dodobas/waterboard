import * as api from '../../api';

const _optionRenderFunction = (result) => `<div><span class="place">${result.option}</span></div>`;

// fetch options on select input change
const _createOptionLoadFn = (name) => (query, callback) => (!query) ? callback() : api.axFilterAttributeOption(query, name, callback);


/**
 * Initialize selectize on formField
 * Attach filter attribute options callback on user input
 * Renders options in field (from callback)
 * @param formField
 */
function selectizeFormDropDown (formField) {

    const name = formField.name;

    if (!name) {
        console.log('No Name found on input feald');
        return;
    }

    const _optionLoad = _createOptionLoadFn(name);

    formField.disabled = false;

    var _searchField = $(formField).selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        multiSelect: false,
        valueField: 'option',
        labelField: 'option',
        searchField: ['option'],
        maxItems: 1,
        create: false,
        render: {
            option: _optionRenderFunction
        },
        load: _optionLoad,
        onChange: (id) => !id === true
    });

}

/**
 * Selectize all fields in parent identified by selector
 * @param parent
 * @param selector
 */
const selectizeWbFormDropDowns = (parent, selector = '[wb-selectize="field-for-selectize"]' ) =>
    _.forEach(parent.querySelectorAll(selector), (field) => {
        selectizeFormDropDown(field)
    });


// todo - refactor
function toggleSelectizeEnabled(
    parent, enableField, fieldSelector = '[wb-selectize="field-for-selectize"]') {

    let selectized;
    let methodName = enableField === true ? 'enable' : 'disable';

    _.forEach( parent.querySelectorAll(fieldSelector), (field) => {
         selectized = $(field)[0].selectize;
        if (selectized && selectized[methodName] instanceof Function) {
            selectized[methodName]();
        }
    });
}


export default {
    selectizeFormDropDown,
    selectizeWbFormDropDowns,
    toggleSelectizeEnabled
}
