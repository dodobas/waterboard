// FORM FIELD HTML STRING / OBJECT BUILD UTILS and TEMPLATE handler

import WbFieldRender from './ui';

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
export const buildAttributeString = (attrs) => ((attrs || []).length > 0) ? (attrs.map(({attrName, attrValue}, ix)=> ` data-${attrName}="${attrValue}"`)).join('') : '';


/**
 * Render function to field type mapping
 * @type {{Text, DropDown, Decimal, Integer}}
 */
const FIELD_TYPE_TO_RENDER_MAPPING = {
	"Text": WbFieldRender.WbTextInputFieldTemplate,
	"DropDown": WbFieldRender.WbTextInputFieldTemplate,
	"Decimal": WbFieldRender.WbTextInputFieldTemplate,
	"Integer": WbFieldRender.WbTextInputFieldTemplate,
};

/**
 * Build form field html template string using mapped render function
 * @param fieldType
 * @param fieldProps
 * @returns {HTMLElement | null}
 */
// export const buildFormFieldTemplate = (fieldType, fieldProps) => {
//     let renderFn = FIELD_TYPE_TO_RENDER_MAPPING[`${fieldType}`];
//
//     return (renderFn instanceof Function) ? renderFn(fieldProps) : null;
// };




export const createDomObjectFromTemplate = (htmlString) => {
    // TODO should we add checks ?? !htmlString
    let dummyDom = document.createElement('div');

    dummyDom.innerHTML = `${htmlString}`;

    return dummyDom.firstChild;
};


class TemplateHandler {
    constructor (props) {
        this.templates = props.templates || FIELD_TYPE_TO_RENDER_MAPPING;
    }
}
