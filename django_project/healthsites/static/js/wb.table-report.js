
function url_update_feature(id) {
    return "/update-feature/" + id
}

function axUpdateAsessement (id, data, cbFunc, errCb) {
    $.ajax({
        url: url_update_feature(id),
        method: 'POST',
        data: data,
        success: function (result) {
            if (cbFunc instanceof Function) {
                cbFunc(result)
            }
        },
        error: function (request, error) {
            if (errCb instanceof Function) {
                errCb(request, error)
            }
        }
    });
}


function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function TableReport(domId, dataTableOptions) {

    this.options = dataTableOptions;

    this.accordionSelector = dataTableOptions.accordionSelector || 'div > h3';

    this.columns = dataTableOptions.columns;

    this.tableDomObj = null;

    this.reportTable = null;

    this.selectedRow = {};

    this.init(domId);

}

TableReport.prototype = {
    init: function (domId) {
        this.setTableDomObj(domId);
        this.setDataTable();
        this.addTableEvents();
    },
    setTableDomObj: function (domId) {
        this.tableDomObj = document.getElementById(domId);
    },
    setDataTable: function () {
        this.reportTable = $(this.tableDomObj).DataTable(this.options);
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

        $(this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

            var rowData = self.setSelectedRow(this);

            console.log(rowData);
            var uuid = rowData.id;


            openInNewTab('/feature-by-uuid/' + uuid);

        });

    }
};

var WB = (function (module) {

    module.tableReports = module.tableReports || {};


    module.tableReports.init = function (domId, dataTableOptions) {
        return new TableReport(domId, dataTableOptions);
    };

    return module;

}(WB || {}));
