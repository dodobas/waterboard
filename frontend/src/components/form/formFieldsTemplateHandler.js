// FORM FIELD HTML STRING / OBJECT BUILD UTILS and TEMPLATE handler

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



export const createDomObjectFromTemplate = (htmlString) => {
    // TODO should we add checks ?? !htmlString
    let dummyDom = document.createElement('div');

    dummyDom.innerHTML = `${htmlString}`;

    return dummyDom.firstChild;
};
