// FORM FIELD HTML STRING / OBJECT BUILD UTILS and TEMPLATE handler

/**
 * Reduce array of key value pairs into html attribute string
 * @param attrs
 * @returns {*}
 * @private
 */
function _stringifyAttributes (attrs) {
    return attrs.reduce((acc, val, ix) => {
        acc += ` data-${val.attrName}="${val.attrValue}"`;
        return acc;
    }, '');

}

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
export function buildAttributeString (attrs) {
    return ((attrs || []).length > 0) ? _stringifyAttributes(attrs) : '';
}



export const createDomObjectFromTemplate = (htmlString) => {
    // TODO should we add checks ?? !htmlString
    let dummyDom = document.createElement('div');

    dummyDom.innerHTML = `${htmlString}`;

    return dummyDom.firstChild;
};
