/*global $*/
import api from '../../api/api';


// selectize options render function
const _optionRenderFunction = ({option}) => `<div>
  <span>${option}</span>
</div>`;

// create attribute options fetch function for user select input change
const _createOptionLoadFn = (name) => (query, callback) => {
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
export function selectizeFormDropDown (formField, options = {}) {

    let { onSelectCallBack, isMultiSelectEnabled = false, onUnSelectCallBack, onClearCallback} = options;
    const name = formField.name;

    if (!name) {
        console.log('No Name found on input field');
        return;
    }

    const _optionLoad = _createOptionLoadFn(name);

    formField.disabled = false;
//
    const conf = {
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        multiSelect: isMultiSelectEnabled,
        valueField: 'option',
        labelField: 'option',
        searchField: ['option'],
        maxItems: 1,
        create: false,
        preload: false,
        render: {
            option: _optionRenderFunction
        },
        load: _optionLoad,
        onChange: (id) => !id === true,
        onFocus: function (e){
            // onSearchChange method triggers the load method
            this.onSearchChange(this.getValue());
        }
    };

    // SET max items if multiselect is enabled
    if (isMultiSelectEnabled === true) {
        conf.maxItems = 10;
    }
    // add on item select callbacl
    if (onSelectCallBack) {
        conf.onItemAdd = function(value){
            onSelectCallBack(name, value);
        }
    }

    // add on item un select callback
    if (onUnSelectCallBack) {
        conf.onItemRemove = function(value){
            onUnSelectCallBack(name, value);
        }
    }

    let $selectized = $(formField).selectize(conf);

    // add on clear callback
    if (onClearCallback) {
        $selectized[0].selectize.on('clear', function () {
            console.log('CLEAR CB');
            onClearCallback(name, this);
        });
    }



    return $selectized;

}


/**
 * Toggle parents child selectized fields enabled / disabled state
 * @param parent - dom object
 * @param isFieldEnabled
 * @param fieldSelector
 */
export function enableSelectizedFormFields(
    isFieldEnabled, parent, fieldSelector = '[data-wb-selectize="field-for-selectize"]') {

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
