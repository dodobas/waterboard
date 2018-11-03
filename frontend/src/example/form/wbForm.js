import {setFormFieldValues, disableFormFields} from "../../components/form/utils";

import renderFn from "./wbFormRenderFunctions";


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
 * data - initial form values
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
            navigationItemRenderFn,
            formActionsRenderFn
        } = props;

        this.data = data;
        this.config = config;

        console.log(props);

        // DOM OBJECTS / PARENTS

        this.formObj = document.getElementById(parentId);

        this.formNavParent = document.getElementById(navigationId);

        this.formActionsParent = document.getElementById(actionsId);

        // STATE

        this.activeTab = activeTab;

        this.formTabsDom = {};

        // RENDER FUNCTIONS

        this.navigationItemRenderFn = navigationItemRenderFn || renderFn.createFormNavigationItemDefault;

        this.formActionsRenderFn = formActionsRenderFn ||  renderFn.createFormActionsDefault;

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
    toggleActiveTab = (isActiveTabVisible) => {
        this.formTabsDom[`${this.activeTab}`].style.display = isActiveTabVisible === true ? 'block' : 'none';
    };

    /**
     * Set current active group key (used in navigation on item click)
     * @param tabKey
     * @returns {{group_name?: HTMLElement}}
     * @private
     */
    setActiveKey = (tabKey) => {
        this.activeTab = tabKey ? `${tabKey}` : '';
    };

    /**
     * Hide currently active tab, set new active tab string and show new active tab
     * @param tabKey
     * @private
     */
    setActiveTab = (tabKey) => {
        if (tabKey && this.formTabsDom[`${tabKey}`]) {
            this.toggleActiveTab(false);
            this.setActiveKey(tabKey);
            this.toggleActiveTab(true);
        }
    };

    /**
     * Create form navigation button group for form groups
     * Adds event listener to parent dom object
     * Clickable child must have the "name" property <button name="location_description".../>
     * Click will set active tab name to clicked button name
     * @param attributeGroups
     */
    createFormNavigation = ({attributeGroups}) => {
        let renderFn = this.navigationItemRenderFn;
        // groupKey je identifier na group definition
        _.forEach(attributeGroups, (attrGroup, groupKey) => {
            this.formNavParent.appendChild(
                renderFn(attrGroup)
            );
        });
    };

    createFormActions = () => {

        let submitBtn = this.formActionsRenderFn();

        this.formActionsParent.appendChild(submitBtn);
    };

    render = () => {
        this.createFormNavigation({attributeGroups});

        this.formTabsDom = renderFn.createFormContent(this.config, this.data, this.formObj);

        this.setActiveTab(`${this.activeTab}`);

        this.createFormActions();

        this.addEvents();

    };

    addEvents = () => {

        // navigation click event  -- delegate
        this.formNavParent.addEventListener('click', (e) => {
            if (e.target.name) {
                this.setActiveTab(`${e.target.name}`)
            }
        });


        // form on change event
        this.formObj.addEventListener('change', (e) => {
            console.log('ev', e);
            console.log('ev', e.target);

            if (e.target.name === 'name') {
                console.log('custom event');
            }
        });


        this.formActionsParent.addEventListener('click', (e) => {
            e.preventDefault();

            console.log('submit');
        });
    };


    emptyFormDom = () => {
        this.formNavParent.innerHTML = '';
        this.formObj.innerHTML = '';
        this.formActionsParent.innerHTML = '';
    };


    prefillForm = () => {
        setFormFieldValues(this.data, this.formObj);
    };

    validateField = () => {

    };
    validateForm = () => {

    };
    disableForm = () => {
        disableFormFields(this.formObj, true);
    };
    enableForm = () => {
        disableFormFields(this.formObj, false);
    };
    submitForm = () => {};
    parseForm = () => {};

    // revert to initial state
    resetForm = () => {
        this.formObj.reset();
    };
}
