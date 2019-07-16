import {createDomObjectFromTemplate} from "../../templates.utils";


/** TODO - move
 * History table modal content for feature changeset
 * import * as Mustache from "mustache";
 * @param groups
 * @param initialData
 * @param formDomObj
 */
export default function createFeatureChangesetModalContent(groups, fields, initialData) {

    let formDomObj =  document.createElement('div');

    let fieldObj;

    _.forEach(groups, (group, key) => {

        let content =  createDomObjectFromTemplate(`<div class="changeset-group-block">
            <h3>${group.label}</h3>
        </div>`);

        let items = _.filter(fields, (field) => field.attribute_group === `${group.key}`);
        let sorted = _.sortBy(items, 'position');

        let column = document.createElement('ul');

        sorted.forEach((field) => {
            field.value = initialData[`${field.key}`] || '';

            fieldObj = createDomObjectFromTemplate(`<li>
                <div class="group-attr">${field.label}</div>
                <div class="group-val"> ${field.value || '&nbsp'}</div>
            </li>`);

            column.appendChild(fieldObj);
        });

        content.appendChild(column);


        formDomObj.appendChild(content);

    });

    return formDomObj;
}
