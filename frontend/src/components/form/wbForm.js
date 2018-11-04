import {setFormFieldValues, _shouldFormFieldsBeEnabled} from "./formFieldsDataHandler";

import renderFn from "./wbForm.renderFunctions";
import {validateValues} from "./validators";
import selectizeUtils from "../selectize";



function _defaultValidateFormFn(formData, config) {

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



/**
 * Parse form value and attributes based on initial data keys Object.keys(this.data)
 * Returns parsed fields as json object: name, value and inputAttributes (defined in field config)
 * TODO parse inputAttributes dynamic
 * {"altitude": {
 *     "name": "altitude",
 *     "value": "1803",
 *     "dataGroupParent": "location_description"
 *   }
 * }
 */
function _defaultFormParseOnSubmitFn (dataKeysToBeParsed, formObj) {
    let parsed = {};


    _.forEach(dataKeysToBeParsed, (dataKey) => {

        let field = formObj.elements[`${dataKey}`];

        let name = field.getAttribute("name");

        if (name && field.dataset.dataGroupParent) {
            parsed[name] = {
                name: name,
                value: field.value,
                dataGroupParent: field.dataset.dataGroupParent
            }
        }
    });

    console.log('parseForm', parsed);
    return parsed;
}


function ToggleButton (props) {

    const {
        isDisable=false,
        title='Enable or Disable Attribute Form Edit',
        className='btn btn-primary btn-xs',
        id='toggle-update-form'
    } = props;

    const state = {
        enabled: {},
        disabled: {}
    };

    const templateStr = `<button title="${title}" class="${className}" id="${id}">
                Enable edit
              </button>`;
}

// groupedFieldsByType = {location_description: [{}], scheme_description: []}
/*
    attribute_group: "location_description"
    key: "name"
    label: "Name"
    orderable: true
    position: 40
    required: true
    result_type: "Text"
    searchable: false
    value: "knek"
*/

/**
 * data - initial form values {key: value}
 * config - form groups and field configuration
 * formObj - dom object
 * formNavParent - navigation dom object parent
 * formActionsParent -form actions parent container (buttons)
 *
 * activeTab - Currently active form content tab key identifier
 * formTabsDom - holder of created form content tabs, Every tab is identified by its group name
 *
 * navigationItemRenderFn - navigation items render function
 * formActionsRenderFn - form actions render function
 * formSubmitValidationFn - if isFormValidationDisabled is not true validate form using this function on submit
 * formParseOnSubmitFn - function to be used to parse (get values) from form object
 */
export default class WbForm {
    constructor(props) {

        const {
            parentId,
            navigationId,
            actionsId,
            data,
            config,
            activeTab,
            fieldsToBeSelectizedSelector,

            navigationItemRenderFn,
            formActionsRenderFn,
            formParseOnSubmitFn,
            formSubmitValidationFn = null,
            handleOnSubmit
        } = props;

        this.data = data;
        this.config = config;


        this.isFormValidationDisabled = false;

        this.isFormEnabled = true;
        this.isFormValid = false;
        this.formErrors = {};


        this.fieldsToBeSelectizedSelector = fieldsToBeSelectizedSelector;

        // DOM OBJECTS / PARENTS

        this.formObj = document.getElementById(parentId);

        this.formNavParent = document.getElementById(navigationId);

        this.formActionsParent = document.getElementById(actionsId);

        // STATE

        this.activeTab = activeTab;

        this.formTabsDom = {};

        // USER DEFINED FUNCTIONS - render, parse, validate

        this.navigationItemRenderFn = navigationItemRenderFn || renderFn.createFormNavigationItemDefault;

        this.formActionsRenderFn = formActionsRenderFn ||  renderFn.createFormActionsDefault;

        this.formSubmitValidationFn = formSubmitValidationFn || _defaultValidateFormFn;

        this.formParseOnSubmitFn = formParseOnSubmitFn || _defaultFormParseOnSubmitFn;

        this.handleOnSubmitFn = handleOnSubmit;

        this.errors = {
            fieldKey: [
                {
                    message: ''
                }
            ]
        }
    }

    /**
     * Show / hide current active tab using activeTab as identifier
     * @returns {{group_name?: HTMLElement}}
     * @private
     */
    showActiveTab = (isActiveTabVisible) => {
        this.formTabsDom[`${this.activeTab}`].style.display = isActiveTabVisible === true ? 'block' : 'none';
    };

    /**
     * Hide currently active tab,
     * Set current active group key (used in navigation on item click)
     * show new active tab
     * @param tabKey
     * @private
     */
    setActiveTab = (tabKey) => {
        if (tabKey && this.formTabsDom[`${tabKey}`]) {
            this.showActiveTab(false);

            this.activeTab = tabKey ? `${tabKey}` : '';

            this.showActiveTab(true);
        }
    };

    /**
     * Create form navigation button group for form groups
     * Adds event listener to parent dom object
     * Clickable child must have the "name" property <button name="location_description".../>
     * Click will set active tab name to clicked button name
     * @param attributeGroups
     */
    createFormNavigationContent = ({attributeGroups}) => {
        let renderFn = this.navigationItemRenderFn;
        // groupKey je identifier na group definition
        _.forEach(attributeGroups, (attrGroup, groupKey) => {
            this.formNavParent.appendChild(
                renderFn(attrGroup)
            );
        });
    };

    /**
     * Create and append inner content of form actions wrap
     *
     * The actions container has an delegated click event set in this.addEvents();
     * TODO add dynamic event mapping
     */
    createFormActionsContent = () => {
        let submitBtn = this.formActionsRenderFn();

        this.formActionsParent.appendChild(submitBtn);
    };

    render = () => {
        this.createFormNavigationContent({attributeGroups: this.config});

        this.formTabsDom = renderFn.createFormContent(this.config, this.data, this.formObj);

        this.createFormActionsContent();

        this.addEvents();

        // selectize form fields
        if (this.fieldsToBeSelectizedSelector) {
            selectizeUtils.selectizeWbFormDropDowns(
                this.formObj,
                this.fieldsToBeSelectizedSelector
            );
        }


        this.setActiveTab(`${this.activeTab}`);

    };

    /**
     * All events are / should be set to its parents - formNavParent, formObj, formActionsParent
     *
     * Event switching should be handled inside the delegated events
     */
    addEvents = () => {

        // Handle navigation container click events
        this.formNavParent.addEventListener('click', (e) => {
            if (e.target.name) {
                this.setActiveTab(`${e.target.name}`)
            }
        });


// form on change event
/*
        this.formObj.addEventListener('change', (e) => {
            let fieldName = e.target.name;

            if (fieldName === 'name') {
                console.log('custom event');
            }
        });
*/


        /**
         * Click event on actions footer container
         * Currently capturing only the submit click event
         * Handle all events on this container this way - change, keyup etc
         */
        this.formActionsParent.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.name === 'wb-form-submit') {
                this.submitForm();
            }
        });



    };


    prefillForm = () => {
        setFormFieldValues(this.data, this.formObj);
    };

    /**
     * Validate form fields using their validation rules defined in this.config
     * @param formData
     */
    handleFormValidation = (formData) => {

        let errors = this.formSubmitValidationFn(formData, this.config);

        if (Object.keys(errors).length > 0) {
            this.errors = errors;
            this.isFormValid = false;
        } else {
            this.errors = {};
            this.isFormValid = true;
        }

    };


    /**
     * Form submit functions - handles parsing, validation and submit
     *
     * dataKeysToBeParsed - keys to be used to filter fields in form to be parsed
     * formData - parsed form data
     */
    submitForm = () => {
        let dataKeysToBeParsed = Object.keys(this.data);

        // parse form data
        let formData = this.formParseOnSubmitFn(dataKeysToBeParsed, this.formObj);

        // form validation
        if (this.isFormValidationDisabled !== true) {
            this.handleFormValidation(formData);
        }

        console.log('formData', formData);
        console.log('errors',this.errors);
        console.log('isFormValid',this.isFormValid);

        // TODO add ajax call and mapping
        // TODO  disable submit on error
        if(this.handleOnSubmitFn && this.handleOnSubmitFn instanceof Function) {
            this.handleOnSubmitFn(formData);
        }
    };


    /**
     * Empty / remove all children from parenst - formNavParent, formObj, formActionsParent
     */
    emptyFormDom = () => {
        // todo
        while(this.formNavParent.firstChild && this.formNavParent.removeChild(this.formNavParent.firstChild));

        while(this.formObj.firstChild && this.formObj.removeChild(this.formObj.firstChild));

        while(this.formActionsParent.firstChild && this.formActionsParent.removeChild(this.formActionsParent.firstChild));
    };


    /**
     * Toggle form enabled / disabled state
     * Dropdowns in form are selectized and handled throught the selectize interface
     *
     * @param isFormEnabled
     */
    enableForm = (isFormEnabled = true) => {
        this.isFormEnabled = isFormEnabled;

        _shouldFormFieldsBeEnabled(this.formObj, isFormEnabled);

        selectizeUtils.shouldSelectizedFormFieldsBeEnabled(this.formObj, isFormEnabled);

        // "disable" footer action buttons
        this.formActionsParent.style.display = (isFormEnabled === true) ? 'block' : 'none';

    };

    /**
     * Revert form changes to initial (when form was rendered)
     */
    resetForm = () => {
        this.formObj.reset();
    };
}
