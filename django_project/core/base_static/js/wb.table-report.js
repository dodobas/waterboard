function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function initAccordion ({selector, opts}) {
    var accordion = $(selector);
    accordion.accordion(opts);

    return accordion;
}

function getFormAsDomObject (data) {

    return $(`<div class="bs-component">
        <div class="panel panel-primary">
            <div id="messages_wrapper"></div>
            <div class="panel-heading panel-heading-without-padding">
                <h4>
                    Add Water Feature Assessment
                </h4>
            </div>
            <div class="panel-body" >
            ${data}
            </div>
        </div>
    </div>
    `);
}

function TableReport(domId, options) {

    this.options = options;

    this.dataTableOpts = options.dataTable;
    this.modalOpts = options.modalOpts;

    console.log(options);
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
     * data- html string
     * @param data
     */
    showModalForm: function (data) {
        var self = this;
        var content = getFormAsDomObject(data);

        WB.modal._setContent(content);
        WB.modal._show();

        console.log(self, this);

        if (this.modalOpts.modalOnOpenCb && this.modalOpts.modalOnOpenCb instanceof Function) {
            this.modalOpts.modalOnOpenCb({
                modalObj: content
            });
        }
    },
    init: function (domId) {
        this.setTableDomObj(domId);
        this.setDataTable();
        this.addTableEvents();
    },
    redraw: function (newData = []) {
         this.reportTable.clear();
        this.reportTable.rows.add(newData);
        this.reportTable.draw();
    },
    setTableDomObj: function (domId) {
        this.tableDomObj = document.getElementById(domId);
    },
    setDataTable: function () {
        this.reportTable = $(this.tableDomObj).DataTable(this.dataTableOpts);
    },
    setSelectedRow: function (rowDomObj) {
        this.selectedRow = this.getSelectedRow(rowDomObj);

        return this.selectedRow;
    },
    getSelectedRow: function (rowDomObj) {
        return this.reportTable.row(rowDomObj).data();
    },
    addTableEvents: function () {
        var self = this;

        // enable table row click event
        if (this.dataTableOpts.rowClickCb && this.dataTableOpts.rowClickCb instanceof Function) {
            $(this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

                var rowData = self.setSelectedRow(this);
                self.dataTableOpts.rowClickCb(rowData, self);
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
