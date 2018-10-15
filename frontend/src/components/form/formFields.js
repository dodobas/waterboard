
const FIELD_TYPES = {
	"Text": {},
	"DropDown": {},
	"Decimal": {},
	"Integer": {},
};




const sample_fieldConf = {
    "key":"name",
    "label":"Name",
    "position":40,
    "required":true,
    "orderable":true,
    "searchable":false,
    "result_type":"Text",
    "attribute_group":"location_description",
    validations: {
        isInt: true,
        minLength: 0,
        maxLength: 5,
        required: true
    }
};

/**
 * Build dom field attribute string
 *
 * const attrs = [{attrName: 'wb-attribute', attrValue: 'wb-attribute-value'}, {attrName: 'attr2', attrValue: 'val2'}]
 * result: data-wb-attribute="wb-attribute-value" data-attr2="val2"
 *
 * @param attrs array of key value pairs
 * @returns {string}
 * @private
 */
const _buildAttributeString = (attrs) => ((attrs || []).length > 0) ? (attrs.map(({attrName, attrValue}, ix)=> ` data-${attrName}="${attrValue}"`)).join('') : '';

export const textInputFieldTemplate = (props) => {

    const {
        key,
        label,
        required,
        attribute_group,
        type='text',
        labelClassName='control-label',
        inputClassName='form-control',
        inputAttributes=[]
    } = props;

    let fieldAttrs = _buildAttributeString(inputAttributes);

    return `
       <div class="form-group  ">
          <label for="${key}" class="${labelClassName}">
            ${label}
          </label>
          <div class="">
            <input ${required === true ? 'required' : ''}
                  data-group-parent="${attribute_group}"
                  type="${type}"
                  name="${key}"
                  class="${inputClassName}"
                  ${fieldAttrs}
              >
          </div>
       </div>
    `.trim();
};

const FIELD_TYPE_TO_RENDER_MAPPING = {
	"Text": textInputFieldTemplate,
	"DropDown": textInputFieldTemplate,
	"Decimal": textInputFieldTemplate,
	"Integer": textInputFieldTemplate,
};


export const buildFormFieldTemplate = (fieldType, fieldProps) =>
    (FIELD_TYPE_TO_RENDER_MAPPING[`${fieldType}`] instanceof Function) ?
        FIELD_TYPE_TO_RENDER_MAPPING[`${fieldType}`](fieldProps) : null;

export const createDomObjectFromTemplate = (htmlString) => {
    // TODO should we add checks ?? !htmlString
    let dummyDom = document.createElement('div');

    dummyDom.innerHTML = htmlString;

    return dummyDom.firstChild ? dummyDom.firstChild : null;
};


export const addEventsToDomObject = (domObject, eventList) => {};


export const renderField = () => {};


/**


 */
