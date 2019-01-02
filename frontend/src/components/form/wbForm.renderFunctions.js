// DEFAULT WB FORM RENDER FUNCTIONS

import * as formFields from '../../domTemplateUtils';

import WbRenderTextInputField from "./ui/WbTextFieldInput";

let {createDomObjectFromTemplate} = formFields;

function _createFormNavigationItemDefault({key, label}) {
    return createDomObjectFromTemplate(
        `<li role="presentation"><a href="#" name="${key}">${label}</a></li>`
    );
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
    let wrap = document.createElement('ul');

    _.forEach(_.sortBy(groupedFieldsByType, 'position'), (item) => {
        let navItem = _createFormNavigationItemDefault(item);

        wrap.appendChild(navItem);

        formNavItemsDom[`${item.key}`] = navItem;
    });

    formNavParent.appendChild(wrap);

    return formNavItemsDom;
}


/**
 * Default form actions / footer render function
 * TODO use a component that accepts html strings / objects
 * @param actionsConf
 * @param initialData
 * @param formActionsParent
 * @returns {*}
 * @private
 */
function _createFormActionsDefault(actionsConf, initialData, formActionsParent, showDeleteBtn = false) {

    //showDeleteBtn
    const deleteBtnTemplate = (showDeleteBtn === true) ? `<button type="button" name='wb-feature-delete' class="btn btn-danger wb-btn-delete">
            <i class="fa fa-trash"></i> Delete
        </button>` : '';

    let templateStr = `<div>
        <button type="button" name='wb-form-submit' class="btn wb-btn-submit">
            <i class="fa fa-save"></i> Save
        </button>
        
        ${deleteBtnTemplate}
    </div>`;

    let formActions = createDomObjectFromTemplate(templateStr);

    formActionsParent.appendChild(formActions);

    return formActions;
}


/**
 * Create group content wrap dom object (tab) with group title
 * Display is set to none by default
 * <h2>${contentData.label}</h2>
 * @param contentData
 * @returns {HTMLDivElement}
 */
function _createContentWrapWithTitleDom(contentData) {
    let templateStr = `<div id="${contentData.key}" class="wb-form-content-tab"></div>`;

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

                // create form field dom object
                // all form fields are inputs of type text
                fieldObj = WbRenderTextInputField(field);

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
    createFormActionsDefault: _createFormActionsDefault,
    createFormContent: _createFormContentDefault,
    createFormNavigationDefault: _createFormNavigationDefault
};

export default fn;
