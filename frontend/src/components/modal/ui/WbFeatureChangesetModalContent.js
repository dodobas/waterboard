import {createDomObjectFromTemplate} from "../../../domTemplateUtils";


/** TODO - move
 * History table modal content for feature changeset
 * @param groupedFieldsByType
 * @param initialData
 * @param formDomObj
 */
export default function createFeatureChangesetModalContent(groupedFieldsByType, initialData) {

    let formDomObj =  document.createElement('div');
    let fieldObj;
    //layouts
    // for every form group
    _.forEach(groupedFieldsByType, (attrGroupFields, key) => {

        let content = document.createElement('div');
        content.className = 'row';

        content.innerHTML=`<div class="col-sm-12">
            <h1>${attrGroupFields.label}</h1>
        </div>`;

        let fields = _.sortBy(attrGroupFields.fields, 'position');

        let column = document.createElement('div');
        column.className = 'col-sm-12 col-md-6';

        fields.forEach((field) => {
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
