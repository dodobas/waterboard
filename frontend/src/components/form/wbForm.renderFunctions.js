// DEFAULT WB FORM RENDER FUNCTIONS

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

/**
 * Default form navigation render function
 * @param groupedFieldsByType
 * @param initialData
 * @param formNavParent
 * @private
 */
function _createFormNavigationDefault(groupedFieldsByType, initialData, formNavParent) {
    let formNavItemsDom = {};
    let wrap = document.createElement('div');

    _.forEach(_.sortBy(groupedFieldsByType, 'position'), (item) => {
        let navItem = _createFormNavigationItemDefault(item);

        wrap.appendChild(navItem);

        formNavItemsDom[`${item.key}`] = navItem;
    });

    formNavParent.appendChild(wrap);

    console.log('.... formNavItemsDom --- ', formNavItemsDom);
    return formNavItemsDom;
}


/**
 * Default form actions / footer render function
 *
 * @param actionsConf
 * @param initialData
 * @param formActionsParent
 * @returns {*}
 * @private
 */
function _createFormActionsDefault(actionsConf, initialData, formActionsParent) {
    let templateStr = `<button name='wb-form-submit'>Submit</button>`;

    let formActions = createDomObjectFromTemplate(templateStr);

    formActionsParent.appendChild(formActions);

    return formActions;
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
function _createFormContentDefault(groupedFieldsByType, initialData, formDomObj) {

    let fieldObj;
    let formGroupsDom = {};

    let columns = 2; // 1 | 2 | 3

    //layouts
    // for every form group
    _.forEach(groupedFieldsByType, (attrGroupFields, key) => {

        // create its html content block
        let wrap = _createContentWrapWithTitleDom(attrGroupFields);


        let content = document.createElement('div');
        content.className = 'row';


        wrap.appendChild(content);

        // TODO code styling / separate
        let fields = _.sortBy(attrGroupFields.fields, 'position');//Object.keys(attrGroupFields.fields);
        let fieldCnt = fields.length;

        let itemsPerColumn = Math.ceil((fieldCnt / columns));

        let firstIx = 0;
        let lastIx = itemsPerColumn;


        for (let i = 0; i <= fieldCnt; i += 1) {

            let columnData = fields.slice(firstIx, lastIx);

            let column = document.createElement('div');
            column.className = 'col-sm-12 col-md-6';

            columnData.forEach((field) => {

                // merge field initial data with form field value
                field.value = initialData[`${field.key}`] || '';

                // TODO switch /case
                // create form field dom object
                fieldObj = createDomObjectFromTemplate(
                    WbFieldRender.WbTextInputFieldTemplate(field)
                );

                // append created form field to form dom object
                column.appendChild(fieldObj);
            });

            content.appendChild(column);

            firstIx += itemsPerColumn;
            lastIx += itemsPerColumn;

        }

        //FORM_TABS_DOM[`${key}`] = wrap;
        formGroupsDom[`${key}`] = wrap;

        formDomObj.appendChild(wrap);

    });

    return formGroupsDom;
}

const fn = {
    createFormNavigationItemDefault: _createFormNavigationItemDefault,
    createFormActionsDefault: _createFormActionsDefault,
    createFormContent: _createFormContentDefault,
    createFormNavigationDefault: _createFormNavigationDefault
};

export default fn;
