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

        this.init(domId);
    }

    /** TODO handle callbacks
     * Open and set content to modal
     *
     * data - html string
     * @param data
     */
    showModalForm = (data) => {
        const {title, modalOnOpenCb} = this.modalOpts;
        const templ = WBLib.templates.getFormTemplate(data, title);
        const content = $(templ);

        WB.modal._setContent(content);
        WB.modal._show();

        if (modalOnOpenCb && modalOnOpenCb instanceof Function) {
            modalOnOpenCb({
                modalObj: content
            });
        }
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
        // enable table row click event
        if (rowClickCb instanceof Function) {
            $(this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

                self.selectedRow = self.reportTable.row(this).data();

                rowClickCb(self.selectedRow, self);
            });
        }

    }

}
