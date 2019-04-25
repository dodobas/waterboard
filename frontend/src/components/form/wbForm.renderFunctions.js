// DEFAULT WB FORM RENDER FUNCTIONS

import * as formFields from '../../templates.utils';

import wbRenderTextInputField, {wbRenderAttachmentUploadInputField} from "../templates/form.field.text-input";

let {createDomObjectFromTemplate} = formFields;

/**
 * Default form navigation render function
 *
 * <ul class="nav nav-pills">
 *  <li role="presentation" class="wb-active-form-tab">
 *     <a href="#" name="location_description">Location description</a>
 *  </li>
 * </ul>
 *
 *
 *
 * @param groups
 * @param initialData
 * @param formNavParent
 * @private
 */
function _createFormNavigationDefault(groups, initialData, formNavParent) {
    let formNavItemsDom = {};
    let wrap = document.createElement('ul');
    wrap.className = 'nav nav-pills';

    _.forEach(_.sortBy(groups, 'position'), ({key, label}) => {

        let navItem = createDomObjectFromTemplate(
            `<li role="presentation"><a href="#" name="${key}">${label}</a></li>`
        );

        wrap.appendChild(navItem);

        formNavItemsDom[`${key}`] = navItem;
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
 * Create and append form content per form group - create "tab" per group
 * @param groupedFieldsByType
 * @param initialData
 * @param formDomObj
 */
function _createFormContentDefault(groups, fields, initialData, formDomObj) {

    let fieldObj;
    let formGroupsDom = {};

    let columns = 2; // 1 | 2 | 3

    _.forEach(groups, (group, key) => {

        let templateStr = `<div id="${group.key}" class="wb-form-content-tab"></div>`;
        // create its html content block
        let wrap = createDomObjectFromTemplate(templateStr);

        let content = document.createElement('div');
        content.className = 'row';

        wrap.appendChild(content);

        let items = _.filter(fields, (field) => field.attribute_group === `${group.key}`);

        let sorted = _.sortBy(items, 'position');
        let fieldCnt = sorted.length;

        let itemsPerColumn = Math.ceil((fieldCnt / columns));

        let firstIx = 0;
        let lastIx = itemsPerColumn;


        for (let i = 0; i <= fieldCnt; i += 1) {

            let columnData = sorted.slice(firstIx, lastIx);

            let column = document.createElement('div');
            column.className = 'col-sm-12 col-md-6';

            columnData.forEach((field) => {

                // merge field initial data with form field value
                field.value = initialData[`${field.key}`] || '';

                // create form field dom object
                // all form fields are inputs of type text
                if (field.meta.result_type === 'Attachment') {
                    fieldObj = wbRenderAttachmentUploadInputField(field);
                } else {
                    fieldObj = wbRenderTextInputField(field);
                }

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
