const {formFields, sampleFormData} = WBLib.form;

// FORM HELPER METHODS

let {createDomObjectFromTemplate, textInputFieldTemplate} = formFields;

// FORM FIELD CONFIGURATIONS AND DATA

const {
    attribute_attributes, // group field conf
    attribute_groups, // group conf
    feature_data // field data
} = sampleFormData;


/**
 * Holder of created form content tabs
 * Every tab is identified by its group name
 * @type {{[group_name]: HTMLElement}}
 */
const FORM_TABS_DOM = {};

/**
 * Currently active form content tab key identifier
 * @type {string}
 */
let activeTab = 'location_description';

/**
 * Show current active tab using activeTab as identifier
 * @returns {{group_name?: HTMLElement}}
 * @private
 */
function _showActiveTab() {
    FORM_TABS_DOM[`${activeTab}`].style.display = 'block';
    return FORM_TABS_DOM;
}

/**
 * Hide current active tab using activeTab as identifier
 * @returns {{group_name?: HTMLElement}}
 * @private
 */
function _hideActiveTab() {
    FORM_TABS_DOM[`${activeTab}`].style.display = 'none';
    return FORM_TABS_DOM;
}

/**
 * Set current active group key (used in navigation on item click)
 * @param tabKey
 * @returns {{group_name?: HTMLElement}}
 * @private
 */
function _setActiveKey(tabKey) {
    activeTab = tabKey ? `${tabKey}` : '';
    return FORM_TABS_DOM;
}

/**
 * Hide currently active tab, set new active tab string and show new active tab
 * @param tabKey
 * @private
 */
function _setActiveTab(tabKey) {
    if (tabKey && FORM_TABS_DOM[`${tabKey}`]) {
        _hideActiveTab();
        _setActiveKey(tabKey);
        _showActiveTab();
    }
}

/**
 * Create navigation item dom object from template string
 * if createItemTemplateFn is provided result of this function will be used as template
 * @param groupConfig
 * @param createItemTemplateFn template string creator function
 * @returns {dom object}
 */
function createFormNavigationItem (groupConfig, createItemTemplateFn) {
    let {key, label} = groupConfig;

    let templStr = (createItemTemplateFn && createItemTemplateFn instanceof Function) ?
        createItemTemplateFn(groupConfig) : `<button name="${key}">${label}</button>`;

    return createDomObjectFromTemplate(templStr);
}

/**
 * Create form navigation button group for form groups
 * Adds event listener to parent dom object
 * Clickable child must have the "name" property <button name="location_description".../>
 * Click will set active tab name to clicked button name
 * @param fieldsConfig
 * @param groupConfig
 * @param navigationItemRenderFn
 * @param parentId
 */
function createFormNavigation(
    fieldsConfig,
    groupConfig,
    navigationItemRenderFn = createFormNavigationItem,
    parentId = 'form-nav'
) {

    let formNavParent = document.getElementById(parentId);

    formNavParent.addEventListener('click', function (e) {
        if (e.target.name) {
            _setActiveTab(`${e.target.name}`)
        }
    });

    // groupKey je identifier na group definition
    _.forEach(fieldsConfig, (attrGroupFields, groupKey) => {
        formNavParent.appendChild(
            navigationItemRenderFn(groupConfig[groupKey])
        );
    });
}


/**
 * Create group content wrap dom object (tab) with group title
 * Display is set to none by default
 * @param contentData
 * @returns {HTMLDivElement}
 */
function createContentWrapWithTitleDom(contentData) {
    let wrap = document.createElement('div');
    wrap.id = `${contentData.key}`;
    wrap.style.display = 'none';
    wrap.innerHTML += `<h2>${contentData.label}</h2>`;

    return wrap;
}

function defaultFieldCreateFn(fieldData) {
    return createDomObjectFromTemplate(
        textInputFieldTemplate(fieldData)
    );
}

/**
 * Create and append form content per form group - create tab per group
 * @param groupedFields
 * @param initialData
 * @param formDomObj
 */
function createFormContent(groupedFields, initialData, formDomObj) {

    let fieldObj;

    _.forEach(groupedFields, (attrGroupFields, key) => {

        let wrap = createContentWrapWithTitleDom(attribute_groups[`${key}`]);

        _.forEach(attrGroupFields, (field) => {

            field.value = initialData[`${field.key}`] || '';

            if (field.result_type === 'DropDown') {
                field.inputAttributes = [{
                    attrName: 'wb-selectize',
                    attrValue: 'field-for-selectize'
                }];
            }

            fieldObj = defaultFieldCreateFn(field);
            wrap.appendChild(fieldObj);
        });
        FORM_TABS_DOM[`${key}`] = wrap;

        formDomObj.appendChild(wrap);

    });
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


let groupedFieldsByType = _.groupBy(attribute_attributes, 'attribute_group');

console.log('groupedFieldsByType', groupedFieldsByType);


let formObj = document.getElementById('example-form');

createFormNavigation(groupedFieldsByType, attribute_groups);

createFormContent(groupedFieldsByType, feature_data, formObj);

_setActiveTab(`${activeTab}`);

// WBLib.form.selectizeUtils.selectizeWbFormDropDowns(formObj, '[data-wb-selectize="field-for-selectize"]')
/*
export {
    createFormNavigation: _createFormNavigation,
    createFormContent: _createFormContent
}




*/
