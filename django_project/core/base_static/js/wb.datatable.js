/**
 * Jquery datatable wrapper
 *
 * @param domId
 * @param options
 * @returns {TableReport}
 * @constructor
 */
function TableReport(domId, options) {

    this.dataTableOpts = options.dataTable;

    this.modalOpts = options.modalOpts;

    this.tableDomObj = null;

    this.reportTable = null;

    this.selectedRow = {};

    this.init(domId);
    return this;
}

TableReport.prototype = {

    /** TODO handle callbacks
     * Open and set content to modal
     *
     * data - html string
     * @param data
     */
    showModalForm: function (data) {
        var content = getFormAsDomObject(data, this.modalOpts.title);

        WB.modal._setContent(content);
        WB.modal._show();

        if (this.modalOpts.modalOnOpenCb && this.modalOpts.modalOnOpenCb instanceof Function) {
            this.modalOpts.modalOnOpenCb({
                modalObj: content
            });
        }
    },
    /**
     * Set dom, init datatable and add events
     * @param domId
     */
    init: function (domId) {
        this.tableDomObj = document.getElementById(domId);
        this.reportTable = $(this.tableDomObj).DataTable(this.dataTableOpts);
        this.addTableEvents();
    },
    redraw: function (newData) {
        newData = newData || [];
        this.reportTable.clear();
        this.reportTable.rows.add(newData);
        this.reportTable.draw();
    },
    addTableEvents: function () {
        var self = this;

        // enable table row click event
        if (this.dataTableOpts.rowClickCb && this.dataTableOpts.rowClickCb instanceof Function) {
            $(this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

                self.selectedRow = self.reportTable.row(this).data();

                self.dataTableOpts.rowClickCb(self.selectedRow, self);
            });
        }

    }
};

var WB = (function (module) {

    module.tableReports = module.tableReports || {};

    module.tableReports.init = function (domId, dataTableOptions) {
        return new TableReport(domId, dataTableOptions);
    };

    return module;

}(WB || {}));
