import * as Mustache from "mustache";
import {createDomObjectFromTemplate} from "../../templates.utils";

export function renderButtonGroup(options) {

    const {
        // parentId = 'wb-table-events-toolbar',
        parentSelector = 'wb-table-events-toolbar',
        clickCb,
        templateStr,
        templateData
    } = options;


     let _parent = document.querySelector(parentSelector);
     // let tableToolbarParent = document.getElementById(parentId);

    // _parent.innerHTML = Mustache.render(templateStr, {data: templateData});
    let _domString = Mustache.render(templateStr, {data: templateData});


    _parent.appendChild(
        createDomObjectFromTemplate(_domString)
    );

    if (clickCb && clickCb instanceof Function) {
        // clickCb
        _parent.addEventListener('click', clickCb);
    }

    return _parent;
}
