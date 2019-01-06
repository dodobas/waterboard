import {createDomObjectFromTemplate} from "../../templates.utils";


/** TODO - move
 * History table modal content for feature changeset
 * @param groups
 * @param initialData
 * @param formDomObj
 */
export default function createFeatureChangesetModalContent(groups, fields, initialData) {

    let formDomObj =  document.createElement('div');
    let fieldObj;
    //layouts
    // for every form group
    _.forEach(groups, (group, key) => {

        // let content = document.createElement('div');
        // content.className = 'row';

        let content =  createDomObjectFromTemplate(`<div class="row"><div class="col-sm-12">
            <h1>${group.label}</h1>
        </div>
        </div>`);

        let items = _.filter(fields, (field) => field.attribute_group === `${group.key}`);
        let sorted = _.sortBy(items, 'position');

        let column = document.createElement('div');
        column.className = 'col-sm-12 col-md-6';

        sorted.forEach((field) => {
            // TODO add callback with field as argument
            field.value = initialData[`${field.key}`] || '';

            fieldObj = createDomObjectFromTemplate(`<div class="row">
                <div class="col-sm-6">${field.label}</div>
                <div class="col-sm-6"> ${field.value}</div>
            </div>`);

            // append created form field to form dom object
            column.appendChild(fieldObj);
        });

        content.appendChild(column);


        formDomObj.appendChild(content);

    });

    return formDomObj;
}
