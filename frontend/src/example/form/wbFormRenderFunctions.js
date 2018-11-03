import * as formFields from '../../components/form/formFields';

let {createDomObjectFromTemplate, textInputFieldTemplate} = formFields;


/**
 * Create navigation item dom object from template string
 * if createItemTemplateFn is provided result of this function will be used as template
 * @param groupConfig
 * @param createItemTemplateFn template string creator function
 * @returns {dom object}
 */
function _createFormNavigationItemDefault(groupConfig, createItemTemplateFn) {
    let {key, label} = groupConfig;

    let templStr = (createItemTemplateFn && createItemTemplateFn instanceof Function) ?
        createItemTemplateFn(groupConfig) : `<button name="${key}">${label}</button>`;

    return createDomObjectFromTemplate(templStr);
}

function _createFormActionsDefault() {
       // create buttons (submit), add event
    let submitBtn = document.createElement('button');
    submitBtn.innerHTML = 'Submit';

   // this.formActionsParent.appendChild(submitBtn);
   //
   //  submitBtn.addEventListener('click', (e) => {
   //      e.preventDefault();
   //
   //      console.log('submit');
   //  });

    return submitBtn;
}

/**
 * Create group content wrap dom object (tab) with group title
 * Display is set to none by default
 * @param contentData
 * @returns {HTMLDivElement}
 */
function _createContentWrapWithTitleDom(contentData) {
    let wrap = document.createElement('div');
    wrap.id = `${contentData.key}`;
    wrap.style.display = 'none';
    wrap.innerHTML += `<h2>${contentData.label}</h2>`;


    return wrap;
}

function _defaultFieldCreateFn(fieldData) {
    return createDomObjectFromTemplate(
        textInputFieldTemplate(fieldData)
    );
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

            // switch /case
            // create form field dom object
            fieldObj = _defaultFieldCreateFn(field);

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
 //   defaultFieldCreateFn: _defaultFieldCreateFn,
    createFormContent: _createFormContent
};

export default fn;
