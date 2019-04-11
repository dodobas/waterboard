import * as Mustache from "mustache";

export function renderButtonGroup(options) {

    const {
        parentId = 'wb-table-events-toolbar',
        clickCb,
        templateStr,
        templateData
    } = options;


     let tableToolbarParent = document.getElementById(parentId);

    tableToolbarParent.innerHTML = Mustache.render(templateStr, {data: templateData});

    if (clickCb && clickCb instanceof Function) {
        // clickCb
        tableToolbarParent.addEventListener('click', clickCb);
    }

    return tableToolbarParent;
}

// export default class ButtonGroup {
//         constructor (options) {
//
//         }
// }
