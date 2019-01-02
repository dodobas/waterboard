import {Modal} from '../modal';
import createFeatureChangesetModalContent from '../modal/ui/WbFeatureChangesetModalContent';

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

    /** TODO handle callbacks, should this modal be part of table class or separated?
     * Open and set content to modal, used on feature by uuid history table
     *
     * data - html string
     * @param data
     */
    showModalForm = (data) => {

        const {featureData, attributeGroups, attributeAttributes} = data;

        let cont = createFeatureChangesetModalContent(attributeGroups, attributeAttributes, featureData);

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

    /**
     * Enable table row click event if callback provided in options
     * callback arguments: clicked row and this (Tablereport class)
     */
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
