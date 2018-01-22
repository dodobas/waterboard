function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function TableReport(domId, options) {

    this.options = options;

    this.dataTableOpts = options.dataTable;
    this.modalOpts = options.modalOpts;

    this.tableDomObj = null;

    this.reportTable = null;

    this.selectedRow = {};

    this.init(domId);
    return this;
}

TableReport.prototype = {

    getFormAsDomObject: function (data) {
        // current modal form is read only
        var self = this;

        var form = $(`<div class="bs-component">
            <div class="panel panel-primary">
                <div id="messages_wrapper"></div>
                <div class="panel-heading panel-heading-without-padding">
                    <h4>
                        <i class="mdi-content-add-box"></i>
                        Add Water Feature Assessment
                    </h4>
                </div>
                <div class="panel-body" >
                ${data}
                </div>
            </div>
        </div>
        `);

        var rowData = self.getSelectedRow();

//         form.find('#update_button').on('click', function (e) {
//             e.preventDefault();
//             axUpdateAsessement(
//                 rowData._feature_uuid,
//                 self.parseForm(form),
//                 (data) => {
//                     console.log('CB func', data);
//                 },
//                 (request, error) => {
//                     console.log('Err CB func', request.responseText);
// //                     showModalForm
//                     self.showModalForm(request.responseText)
//
//                     // form.html(request.responseText);
//                 },
//             );
//
//         });
        return form;
    },
    /** TODO handle callbacks
     * Open and set content to modal
     *
     * data- html string
     * @param data
     */
    showModalForm: function (data) {
        var self = this;
        var content = self.getFormAsDomObject(data);

        WB.modal._setContent(content);
        WB.modal._show();

        if (this.modalOpts.modalOnOpenCb && this.modalOpts.modalOnOpenCb instanceof Function) {
            this.modalOpts.modalOnOpenCb({
                modalObj: content
            });
        }
    },
    initAccordion: function ({selector, opts}) {
        var accordion = $(selector);
        accordion.accordion(opts);

        return accordion;
    },
    init: function (domId) {
        this.setTableDomObj(domId);
        this.setDataTable();
        this.addTableEvents();
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
