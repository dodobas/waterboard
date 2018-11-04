import {attributesFormLatLngInputOnChange} from './wbForm.utils';
import {getFormFieldValues} from './formFieldsDataHandler';



import selectizeUtils from '../selectize'


/**
 * Parse nested form (1 child per parent)
 *
 * For every field group:
 *   select all fields
 *   get value
 *   set result as key value pair for field
 *
 * @param form
 * @param groupSelector         - field group parent
 * @param formFieldSelector     - form field selectors to be selected from field group parent
 * @param hiddenFieldsSelector  - additional hidden field selector
 *
 * returns parsed form field values
 */
function parseAttributesForm({
    form,
    groupSelector = '[data-group-name]',
    formFieldSelector = 'input, select',
    hiddenFieldsSelector = '#_hidden_fields input'
}) {

    // parsed form
    let parsedValues = {};

    // helper function, set result value for field
    const setFieldValue = (field) => { parsedValues[field.name] = field.value;};

    // parse form group fields for every form group
    _.forEach(form.querySelectorAll(groupSelector), (group) => {
         // get all fields for form group
         _.forEach(group.querySelectorAll(formFieldSelector), setFieldValue);
    });

    // parse hidden inputs
    _.forEach(form.querySelectorAll(hiddenFieldsSelector), setFieldValue);

    return parsedValues;
}


export default class SimpleForm {
    constructor(config) {
        this.options = config || {};

        this.isEnabled = config.isEnabled === true;
        this.isBtnVisible = config.isBtnVisible === true;

        this.parent = false;
        this.formDomObj = false;
        this.updateBtn = false;
        this.parent = document.getElementById(this.options.parentId);
        this.formDomObj = document.getElementById(this.options.formId);
        this.formParentObj = this.formDomObj.parentNode;
        this.init();
    }
       // on first init formDomObj is undefined
    // formDomObj is used on form error cb
    init = (formDomObj) => {

        if (formDomObj) {
            this.formDomObj = formDomObj;
        }

        this.enableForm(this.isEnabled);


        if (this.options.submitBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.submitBtnSelector);
        }

        this.showUpdateButton(this.isBtnVisible);

        if (this.options.accordionConf) {
            this.initAccordion();
        }
        this.addEvents();

        if (this.options.selectizeFields !== false) {
            selectizeUtils.selectizeWbFormDropDowns(this.formDomObj);
        }

    }


    replaceFormMarkup = (htmlString) => {

         this.formParentObj.innerHTML = htmlString;

        this.init(this.formParentObj.firstElementChild);
    }

    showUpdateButton = (show) => {
        if (this.updateBtn) {
            this.updateBtn.style.display = show === true ? 'block' : 'none';
        }
    }

    initAccordion = () => {
        const {opts, selector} = this.options.accordionConf;

        let accordion = selector ? $(selector) : $(this.formDomObj).find(selector);
        accordion.accordion(opts);
    }

    /**
     * Set / Toggle form active state (enabled / disabled)
     *
     * if isEnabled is not set toggle current state
     * @param isEnabled
     * @returns {*|boolean}
     */
    enableForm = (isEnabled) => {
        const changeActiveStateTo = isEnabled === undefined ? !this.isEnabled : isEnabled;

        if (changeActiveStateTo === true) {
            this.formDomObj.querySelector('fieldset').removeAttribute("disabled");

            this.isEnabled = true;

        } else {
            this.formDomObj.querySelector('fieldset').setAttribute("disabled", true);
            this.isEnabled = false;
        }
        selectizeUtils.shouldSelectizedFormFieldsBeEnabled(this.formDomObj, this.isEnabled);
        return this.isEnabled;

    }

    addEvents = () => {
        if (this.updateBtn) {

            // DESABLE DEFAULT FORM SUBMIT

            this.formDomObj.addEventListener('onsubmit', function (e) {
                e.preventDefault();
                return false;
            });

            //  ADD ON SUBMIT CLICK EVENT form parent
            // the form will be replaced so form events will be lost
            this.parent.addEventListener('click', (e) => {
                if (e.target === this.updateBtn) {
                    let formData = parseAttributesForm({form: this.formDomObj});

                    if (this.options.onSubmit && this.options.onSubmit instanceof Function) {
                        this.options.onSubmit(formData, this)
                    }
                }
            });

        }

        // init form lat, lng input on change

        this.parent.querySelector('[data-group-name="location_description"]').addEventListener('input', () => {
            const  {latitude, longitude} = getFormFieldValues(
                ['latitude', 'longitude'], this.formDomObj
            );
            attributesFormLatLngInputOnChange({latitude, longitude});
        });

    }


}
