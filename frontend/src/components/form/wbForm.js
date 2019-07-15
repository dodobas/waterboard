import {
    enableFormFields, getFormFieldValues,

} from "./form.utils";

import renderFn from "./wbForm.renderFunctions";
import {validateDataAgainstRules} from "../validators";
import {selectizeFormDropDown, enableSelectizedFormFields} from "../selectize";

import {Modal} from "../modal";

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
 * Form consists of 4 elements:
 *   - actions row (header)
 *   - form
 *   - footer row
 *   - confirmation modal
 *
 * Every element has its own render functions and events (TODO review modal usage)
 *
 * Options:
 *
 * data - initial form values {key: value}
 * * fieldGroups - form groups
 * fields - field configuration
 * dataUniqueIdentifierKey - which property name in "data" identifies unique id
 *
 *
 * activeTab - key of data
 * formObj - dom object
 * formNavigationObj - navigation dom object parent
 * formActionsObj -form actions parent container (buttons)
 *
 * activeTab - Currently active form content tab key identifier
 * formTabsDom - holder of created form content tabs, Every tab is identified by its group name
 * fieldsToBeSelectizedSelector
 *
 * navigationRenderFn - navigation render function
 * formContentRenderFn
 * formActionsRenderFn - form actions render function
 *
 * beforeSubmitValidationFn - if isFormValidationDisabled is not true validate form using this function on submit
 * formParseOnSubmitFn - function to be used to parse (get values) from form object
 *
 * handleOnSubmitFn
 * handleFormFieldKeyUpFn
 *
 * formOnKeUpFn - handle form field on keyup, used for lat/lng and map binding
 *
 * actionsConfig
 * customEvents
 * handleOnDeleteFn
 * isDeleteEnabled (bool) - if true the delete button will be visible in the actions row
 * isFormEnabled - is form enabled / disabled flag
 */
export default class WbForm {
    constructor(props) {

        const {
            parentId,
            navigationId,
            actionsId,

            data,
            dataUniqueIdentifierKey = 'feature_uuid',
            fieldGroups,
            fields,
            fieldsToBeSelectizedSelector,

            formActionsRenderFn = renderFn.createFormActionsDefault,
            navigationRenderFn = renderFn.createFormNavigationDefault,
            formContentRenderFn = renderFn.createFormContent,

            formParseOnSubmitFn = getFormFieldValues,
            beforeSubmitValidationFn = validateDataAgainstRules,
            handleOnSubmitFn,
            handleFormFieldKeyUpFn,
            handleOnDeleteFn,


            actionsConfig,
            customEvents,

            isDeleteEnabled = false,
            isFormEnabled,
            activeTab,
        } = props;

        this.dataUniqueIdentifierKey = dataUniqueIdentifierKey;

        this.data = data;
        this.fieldGroups = fieldGroups;
        this.fields = fields;

        this.fieldsToBeSelectizedSelector = fieldsToBeSelectizedSelector;

        this.actionsConfig = actionsConfig;

        // STATE

        this.activeTab = activeTab ? activeTab : _.sortBy(this.fieldGroups, 'position')[0]['key'];

        this.isFormValidationDisabled = false;
        this.isFormEnabled = isFormEnabled;
        this.isFormValid = false;

        this.errors = {
            fieldKey: [
                {
                    message: ''
                }
            ]
        };

        // DOM OBJECTS / PARENTS

        this.formObj = document.getElementById(parentId);

        this.formNavigationObj = document.getElementById(navigationId);

        this.formActionsObj = document.getElementById(actionsId);

        this.formTabsDom = {};

        this.formNavItemsDom = {};


        // RENDER FUNCTIONS

        this.formContentRenderFn = formContentRenderFn;
        this.navigationRenderFn = navigationRenderFn;
        this.formActionsRenderFn = formActionsRenderFn;

        // DATA HANDLING FUNCTIONS

        this.beforeSubmitValidationFn = beforeSubmitValidationFn;

        this.formParseOnSubmitFn = formParseOnSubmitFn;

        this.formOnKeUpFn = handleFormFieldKeyUpFn;

        this.formOnSubmitFn = handleOnSubmitFn;

        this.customEvents = customEvents;


        // DELETE - confirm modal and delete callback

        this.modalConfirm = null;
        this.isDeleteEnabled = isDeleteEnabled;
        this.handleOnDeleteFn = handleOnDeleteFn;

        let deleteConfirmationText = `<p>Are you sure?</p>`;

        if (this.isDeleteEnabled === true) {

            this.modalConfirm = new Modal({
                parentId: 'wb-confirmation-modal',
                contentClass: 'wb-modal-confirm',
                content: deleteConfirmationText,
                customEvents: [
                    {
                        selector: '#wb-confirm-delete-btn',
                        type: 'click',
                        callback: this._delete
                    }
                ],
                addEventsOnInit: true,
                removeContentOnClose: false
            });


        }
    }

    /**
     * Show / hide current active tab using activeTab as identifier
     * Toggle active navigation class on nav item
     * @returns {{group_name?: HTMLElement}}
     * @private
     */
    showActiveTab = (isActiveTabVisible) => {
        let className = 'wb-active-form-tab';
        let displayStyle = 'block';
        let currentClasses = this.formNavItemsDom[`${this.activeTab}`].classList;

        if (isActiveTabVisible === true) {
            currentClasses.add(className);
        } else {
            displayStyle = 'none';
            currentClasses.remove(className);
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
        this.formNavItemsDom = this.navigationRenderFn(this.fieldGroups, this.data, this.formNavigationObj);

        this.formTabsDom = this.formContentRenderFn(this.fieldGroups, this.fields, this.data, this.formObj);

        this.formActionsRenderFn(this.actionsConfig, this.data, this.formActionsObj, this.isDeleteEnabled);

        if (addEvents) {
            this.addEvents();
        }

        // selectize form fields identified by fieldsToBeSelectizedSelector
        if (this.fieldsToBeSelectizedSelector) {

            let fieldsToBeSelectized = this.formObj.querySelectorAll(`${this.fieldsToBeSelectizedSelector}`);

            _.forEach(fieldsToBeSelectized, (field) => {
                selectizeFormDropDown(field);
            });

        }

        this.setActiveTab(`${this.activeTab}`);

        this.enableForm(
            isFormEnabled === undefined ? this.isFormEnabled : isFormEnabled
        );
    };

    /**
     * Add base and custom events
     * Base events:
     *   navigation on click
     *   form on key up
     *   actions row on click
     *
     * Custom events (example):
     *   enable/disable button on click event
     *
     * All base events are / should be set to its parents - formNavigationObj, formObj, formActionsObj
     *
     * Event switching should be handled inside the delegated events
     */
    addEvents = () => {

        // NAVIGATION  - HEADER ON CLICK
        this.formNavigationObj.addEventListener('click', (e) => {
            if (e.target.name) {
                this.setActiveTab(`${e.target.name}`)
            }
        });


        // FORM ON KEY UP
        // used for latitude and longitude fields on change to change the map marker coords
        if (this.formOnKeUpFn instanceof Function) {

            this.formObj.addEventListener('keyup', (e) => {
                this.formOnKeUpFn(e, this.formObj);
            });

        }

        // ACTIONS - FOOTER ON CLICK

        this.formActionsObj.addEventListener('click', (e) => {
            e.preventDefault();

            // todo add a switcher
            if (e.target.name === 'wb-form-submit') {
                this.submitForm();
            }

            if (e.target.name === 'wb-feature-delete') {
                // wb-confirm-delete-btn
                this.handleDelete();
            }
        });

        // CUSOTM events

        _.forEach(this.customEvents, ({parentId, callback, type}) => {
            document.getElementById(parentId).addEventListener(type, callback);
        });
    };

    /**
     * Validate form fields using their validation rules defined in this.fieldGroups
     * @param formData
     */
    handleFormValidation = (formData) => {

        let errors = this.beforeSubmitValidationFn(formData, this.fields);

        if (Object.keys(errors).length > 0) {
            this.errors = errors;
            this.isFormValid = false;
        } else {
            this.errors = {};
            this.isFormValid = true;
        }

    };

    /**
     * Delete callback function
     * Gets unique form identifier (UUI) from initial form data using this.dataUniqueIdentifierKey
     * Will call callback function with id as arguments
     */
    _delete = () => {
        const deleteId = _.get(this.data, `${this.dataUniqueIdentifierKey}`, null);

        if (deleteId && this.handleOnDeleteFn && this.handleOnDeleteFn instanceof Function) {
            this.handleOnDeleteFn(deleteId);
        }
    };

    /**
     * Open confirmation modal prior to delete
     */
    handleDelete = () => {
        this.modalConfirm._show();
    };

    removeErrorMessages = () => {
        let _errorMsgs = this.formObj.querySelectorAll('[data-wb-form-field-error]');

        for (let i = 0; i < _errorMsgs.length; i += 1) {
            _errorMsgs[i].parentNode.classList.remove('wb-form-has-error');
            _errorMsgs[i].parentNode.removeChild(_errorMsgs[i]);

        }
    };


    showErrorMessages = () => {
        this.removeErrorMessages();

        this.showErrorsOnNavItems();

        _.forEach(this.errors, (error, key) => {
            let el = this.formObj.elements[`${key}`];

            let errMsg = document.createElement('span');

            // errMsg.className = 'wb-form-error-msg';
            errMsg.dataset.wbFormFieldError = `${key}`;

            errMsg.innerHTML = _.map(error, (e) => {
                return e.errorText;
            }).join(' ');


            el.parentNode.classList.add('wb-form-has-error');
            el.parentNode.appendChild(errMsg);
        });

    };

    /**
     * Show errors on form groups - navigation items (tabs)
     * Add wb-group-has-error class to every items parent group
     */
    showErrorsOnNavItems = () => {
        Object.keys(this.errors).forEach((errKey) => {
            let groupKey = this.fields[`${errKey}`].attribute_group;

            if (groupKey) {
                this.formNavItemsDom[`${groupKey}`].classList.add('wb-group-has-error');
            }

        });
    };

    /**
     * Remove errors from navigation items
     */
    removeErrorsOnNavItems = () => {
        Object.keys(this.formNavItemsDom).forEach((navItem) => {
            this.formNavItemsDom[navItem].classList.remove('wb-group-has-error');

        });
    };

    /**
     * Shows error messages on form items including navigation
     */
    showServerErrorMessages = () => {
        this.removeErrorMessages();
        this.removeErrorsOnNavItems();

        //WB.FeatureFormInstance.formObj.elements.name.parentNode

        console.log('[showServerErrorMessages]', this.errors);


        this.showErrorsOnNavItems();

        _.forEach(this.errors, (error, key) => {
            let el = this.formObj.elements[`${key}`];

            let errMsg = document.createElement('span');

            // errMsg.className = 'wb-form-error-msg';
            errMsg.dataset.wbFormFieldError = `${key}`;

            errMsg.innerHTML = _.map(error, (e) => {
                return e;
            }).join(' ');


            el.parentNode.classList.add('wb-form-has-error');
            el.parentNode.appendChild(errMsg);
        });

    };

    /**
     * Form submit functions - handles parsing, validation and submit
     *
     * dataKeysToBeParsed - keys to be used to filter fields in form to be parsed, using fields (attributesAttribute) keys
     * formData - parsed form data
     */
    submitForm = () => {
        // ignore any fields of type Attachment, binary data is sent using contentType: multipart/*
        const fieldNames = [];
        const attachmentNames = [];

        _.forEach(this.fields, (field, fieldName) => {
            if (field.meta.result_type === 'Attachment') {
                attachmentNames[attachmentNames.length] = fieldName;
            } else {
                fieldNames[fieldNames.length] = fieldName;
            }
        });

        // parse form data
        let formData = this.formParseOnSubmitFn(fieldNames, this.formObj);

        // form validation
        if (this.isFormValidationDisabled !== true) {
            this.handleFormValidation(formData);
        }

        if (!this.isFormValid) {

            this.showErrorMessages();

            return;
        }

        // prepare FormData
        let postData = new FormData();
        postData.append('attributes', JSON.stringify(formData));

        // loop over EVERY attachment field
        const origFormData = new FormData(this.formObj);

        for (const attachmentName of attachmentNames) {
            for (const attachment of origFormData.getAll(attachmentName)) {
                postData.append(attachmentName, attachment);
            }
        }


        if (this.formOnSubmitFn && this.formOnSubmitFn instanceof Function) {
            this.formOnSubmitFn(postData);
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
     * Update form data and fieldGroups (update feature success response)
     * Empty parents children and rerender
     * @param data
     * @param config
     */
    updateFormData = ({data, fieldGroups, fields}) => {
        this.data = data;
        this.fieldGroups = fieldGroups;
        this.fields = fields;

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

        enableFormFields(isFormEnabled, this.formObj);

        enableSelectizedFormFields(isFormEnabled, this.formObj);

        // TODO implement better disabled actions handling
        // "disable" footer action buttons
        this.formActionsObj.style.display = (isFormEnabled === true) ? 'block' : 'none';

        if (this.isFormEnabled === true) {
            this.formObj.classList.remove('form-disabled');
        } else {
            this.formObj.classList.add('form-disabled')
        }


    };

    /**
     * Revert form changes to initial (when form was rendered)
     */
    resetForm = () => {
        this.formObj.reset();
    };

}
