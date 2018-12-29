import {
    setFormFieldValues,
    _shouldFormFieldsBeEnabled,

} from "./formFieldsDataHandler";

import renderFn from "./wbForm.renderFunctions";
import {defaultValidateFormFn} from "./validators";
import selectizeUtils from "../selectize";

import {defaultFormParseOnSubmitFn} from './wbForm.utils'

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
 * Form handler class
 *
 * Every render function will get its parent dom object as argument alongside config and data
 *
 *
 * data - initial form values {key: value}
 * config - form groups and field configuration
 * formObj - dom object
 * formNavigationObj - navigation dom object parent
 * formActionsObj -form actions parent container (buttons)
 *
 * activeTab - Currently active form content tab key identifier
 * formTabsDom - holder of created form content tabs, Every tab is identified by its group name
 *
 * navigationRenderFn - navigation render function
 * formContentRenderFn
 * formActionsRenderFn - form actions render function
 *
 * formSubmitValidationFn - if isFormValidationDisabled is not true validate form using this function on submit
 * formParseOnSubmitFn - function to be used to parse (get values) from form object
 *
 * handleOnSubmitFn
 * handleKeyUpFn
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

            formActionsRenderFn,
            navigationRenderFn,
            formContentRenderFn,

            formParseOnSubmitFn,
            formSubmitValidationFn,
            handleOnSubmitFn,
            handleKeyUpFn,
            actionsConfig,
            customEvents,

            isFormEnabled
        } = props;

        this.data = data;
        this.config = config;
        this.actionsConfig = actionsConfig;


        this.isFormValidationDisabled = false;

        this.isFormEnabled = isFormEnabled;
        this.isFormValid = false;
        this.formErrors = {};

        this.fieldsToBeSelectizedSelector = fieldsToBeSelectizedSelector;

        // DOM OBJECTS / PARENTS

        this.formObj = document.getElementById(parentId);

        this.formNavigationObj = document.getElementById(navigationId);

        this.formActionsObj = document.getElementById(actionsId);

        this.formTabsDom = {};

        this.formNavItemsDom = {};


        // STATE

        this.activeTab = activeTab;

        // RENDER FUNCTIONS

        this.formContentRenderFn = formContentRenderFn || renderFn.createFormContent;
        this.navigationRenderFn = navigationRenderFn || renderFn.createFormNavigationDefault;
        this.formActionsRenderFn = formActionsRenderFn || renderFn.createFormActionsDefault;

        // DATA HANDLING FUNCTIONS

        this.formSubmitValidationFn = formSubmitValidationFn || defaultValidateFormFn;

        this.formParseOnSubmitFn = formParseOnSubmitFn || defaultFormParseOnSubmitFn;

        this.handleKeyUp = handleKeyUpFn;

        this.handleOnSubmitFn = handleOnSubmitFn;

        this.customEvents = customEvents;

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
     * Toogle active navaigation class on nav item
     * @returns {{group_name?: HTMLElement}}
     * @private
     */
    showActiveTab = (isActiveTabVisible) => {
        let className = 'wb-active-form-tab';
        let displayStyle = 'block';

        if (isActiveTabVisible === true) {
            this.formNavItemsDom[`${this.activeTab}`].classList.add(className);
        } else {
            displayStyle = 'none';
            this.formNavItemsDom[`${this.activeTab}`].classList.remove(className);
        }


        this.formTabsDom[`${this.activeTab}`].style.display = `${displayStyle}`;
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
     *
     * @param addEvents -  should events be added
     * @param isFormEnabled     - form state overwrite
     */
    render = ({addEvents = true, isFormEnabled}) => {
        this.formNavItemsDom = this.navigationRenderFn(this.config, this.data, this.formNavigationObj);

        this.formTabsDom = this.formContentRenderFn(this.config, this.data, this.formObj);

        this.formActionsRenderFn(this.actionsConfig, this.data, this.formActionsObj);

        addEvents && this.addEvents();

        // selectize form fields
        if (this.fieldsToBeSelectizedSelector) {
            selectizeUtils.selectizeWbFormDropDowns(
                this.formObj,
                this.fieldsToBeSelectizedSelector
            );
        }

        this.setActiveTab(`${this.activeTab}`);

        let enableForm = isFormEnabled === undefined ? this.isFormEnabled : isFormEnabled;
        this.enableForm(enableForm);
    };

    /**
     * All events are / should be set to its parents - formNavigationObj, formObj, formActionsObj
     *
     * Event switching should be handled inside the delegated events
     */
    addEvents = () => {

        // NAVIGATION ON CLICK
        this.formNavigationObj.addEventListener('click', (e) => {
            if (e.target.name) {
                this.setActiveTab(`${e.target.name}`)
            }
        });


        // FORM KEY UP
        // used for latitude and longitude fields on change to change the map marker coords
        if (this.handleKeyUp instanceof Function) {

            this.formObj.addEventListener('keyup', (e) => {
                this.handleKeyUp(e, this.formObj);
            });

        }

        // ACTIONS FOOTER ON CLICK

        this.formActionsObj.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.name === 'wb-form-submit') {
                this.submitForm();
            }
        });


        // CUSOTM events
        let events = this.customEvents;
        let eventCnt = (events || []).length;
        let i = 0;
        for(i; i<eventCnt; i+=1) {

            let {parentId, callback, type} = events[i];

            let eventParent = document.getElementById(parentId);

            eventParent.addEventListener(type, callback);
        }
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
        console.log('errors', this.errors);
        console.log('isFormValid', this.isFormValid);

        if (!this.isFormValid) {
            console.log('INVALID FORM', this.errors);
           return;
        }

        // get form data as key value pairs
        let prep = _.reduce(formData, (acc, val, ix) => {
            acc[`${val.name}`] = val.value;
            return acc;
        }, {});

        // TODO  disable submit on error
        if (this.handleOnSubmitFn && this.handleOnSubmitFn instanceof Function) {
            this.handleOnSubmitFn(prep);
        }
    };


    /**
     * Empty / remove all children from parenst - formNavigationObj, formObj, formActionsObj
     * Events on Parents are intact
     */
    emptyFormDom = () => {
        // todo
        while (this.formNavigationObj.firstChild && this.formNavigationObj.removeChild(this.formNavigationObj.firstChild)) ;

        while (this.formObj.firstChild && this.formObj.removeChild(this.formObj.firstChild)) ;

        while (this.formActionsObj.firstChild && this.formActionsObj.removeChild(this.formActionsObj.firstChild)) ;
    };


    /**
     * Update form data and config (update feature success response)
     * Empty parents children and rerender
     * @param data
     * @param config
     */
    updateFormData = ({data, config}) => {
        this.data = data;
        this.config = config;

        this.emptyFormDom();

        this.render({addEvents: false, isFormEnabled: false});

    };

    /**
     * Toggle form enabled / disabled state
     * Dropdowns in form are selectized and handled throught the selectize interface
     *
     * @param isFormEnabled
     */
    enableForm = (isFormEnabled = true) => {
        this.isFormEnabled = isFormEnabled === true;

        _shouldFormFieldsBeEnabled(this.formObj, isFormEnabled);

        selectizeUtils.shouldSelectizedFormFieldsBeEnabled(this.formObj, isFormEnabled);

        // TODO implement better disabled actions handling
        // "disable" footer action buttons
        this.formActionsObj.style.display = (isFormEnabled === true) ? 'block' : 'none';

    };

    /**
     * Revert form changes to initial (when form was rendered)
     */
    resetForm = () => {
        this.formObj.reset();
    };

}
