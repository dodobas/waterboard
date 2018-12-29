import {Modal} from '../modal';
import {getFormTemplate} from '../templates/wb.templates';
import WbRenderTextInputField from "../form/ui/WbTextFieldTemplate";
import {createDomObjectFromTemplate} from "../form/formFieldsTemplateHandler";


/**
 * Create and append form content per form group - create "tab" per group
 * @param groupedFieldsByType
 * @param initialData
 * @param formDomObj
 */
function _createFeatureChangesetModalContent(groupedFieldsByType, initialData) {

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

            // merge field initial data with form field value
            field.value = initialData[`${field.key}`] || '';

            // create form field dom object
            // all form fields are inputs of type text

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
/**
 * Jquery datatable wrapper
 *
 * @param domId
 * @param options
 * @returns {TableReport}
 * @constructor
 */
export default class TableReport {
    constructor(domId, options) {
        this.dataTableOpts = options.dataTable;

        this.modalOpts = options.modalOpts;

        this.tableDomObj = null;

        this.reportTable = null;

        this.selectedRow = {};

        this.modal = new Modal({});

        this.init(domId);
    }

    /** TODO handle callbacks
     * Open and set content to modal
     *
     * data - html string
     * @param data
     */
    showModalForm = (data) => {

        const {featureData, attributeGroups} = data;

        let cont = _createFeatureChangesetModalContent(attributeGroups, featureData);

        // TODO options will bee removed probably
        // const {title, modalOnOpenCb} = this.modalOpts;

        this.modal._setContent(cont);
        this.modal._show();

    };
    /**
     * Set dom, init datatable and add events
     * @param domId
     */
    init = (domId) => {
        this.tableDomObj = document.getElementById(domId);
        this.reportTable = $(this.tableDomObj).DataTable(this.dataTableOpts);
        this.addTableEvents();
    };

    redraw = (newData) => {
        newData = newData || [];
        this.reportTable.clear();
        this.reportTable.rows.add(newData);
        this.reportTable.draw();
    };

    addTableEvents = () => {
        let self = this;

        const {rowClickCb} = this.dataTableOpts;
        // enable table row click event, delegated
        if (rowClickCb instanceof Function) {
            this.tableDomObj.tBodies[0].addEventListener('click', function (e) {

                if (e.target && e.target.matches("td")) {
                    self.selectedRow = self.reportTable.row(e.target.parentNode).data();

                    rowClickCb(self.selectedRow, self);
                }

            })
        }

    }

}
