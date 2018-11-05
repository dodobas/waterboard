import * as formFields from './formFieldsTemplateHandler';

import WbFieldRender from './ui';

let {createDomObjectFromTemplate} = formFields;

/**
 * Create navigation item dom object from template string
 * if createItemTemplateFn is provided result of this function will be used as template
 * @param groupConfig
 * @param createItemTemplateFn template string creator function
 * @returns {dom object}
 */
function _createFormNavigationItemDefault(groupConfig, createItemTemplateFn) {
    let {key, label} = groupConfig;

    let templateStr = (createItemTemplateFn && createItemTemplateFn instanceof Function) ?
        createItemTemplateFn(groupConfig) : `<button name="${key}">${label}</button>`;

    return createDomObjectFromTemplate(templateStr);
}


function _createFormActionsDefault() {
    let templateStr = `<button name='wb-form-submit'>Submit</button>`;
    return createDomObjectFromTemplate(templateStr);
}


function _createFormNavigationDefault(navigationData) {
    let wrap = document.createElement('div');

    _.forEach(_.sortBy(navigationData, 'position'), (item) => {
        wrap.appendChild(
            _createFormNavigationItemDefault(item)
        );
    });

    return wrap;
}


/**
 * Create group content wrap dom object (tab) with group title
 * Display is set to none by default
 * @param contentData
 * @returns {HTMLDivElement}
 */
function _createContentWrapWithTitleDom(contentData) {
    let templateStr = `<div id="${contentData.key}" style="display: none">
    <h2>${contentData.label}</h2>
    </div>`;

    return createDomObjectFromTemplate(templateStr);
}


/**
 * Create and append form content per form group - create "tab" per group
 * @param groupedFieldsByType
 * @param initialData
 * @param formDomObj
 */
function _createFormContent(groupedFieldsByType, initialData, formDomObj) {

    let fieldObj;
    let formGroupsDom = {};
    // for every form group
    _.forEach(groupedFieldsByType, (attrGroupFields, key) => {

        // create its html content block
        let wrap = _createContentWrapWithTitleDom(attrGroupFields);


        let content = document.createElement('div');
        wrap.appendChild(content);

        // foreach item (form field) in form group
        _.forEach(attrGroupFields.fields, (field) => {

            // merge field initial data with form field value
            field.value = initialData[`${field.key}`] || '';

            // TODO switch /case
            // create form field dom object
            fieldObj = createDomObjectFromTemplate(
                WbFieldRender.WbTextInputFieldTemplate(field)
            );

            // add events

            // append created form field to form dom object
            content.appendChild(fieldObj);
        });
        //FORM_TABS_DOM[`${key}`] = wrap;
        formGroupsDom[`${key}`] = wrap;

        formDomObj.appendChild(wrap);

    });

    return formGroupsDom;
}

const fn = {
    createFormNavigationItemDefault: _createFormNavigationItemDefault,
    createFormActionsDefault: _createFormActionsDefault,
  //  createContentWrapWithTitleDom: _createContentWrapWithTitleDom,

    createFormContent: _createFormContent,
    createFormNavigationDefault: _createFormNavigationDefault
};

export default fn;
