
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
    getFormAsDomObject: function (data) {
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

        form.find('#update_button').on('click', function (e) {
            e.preventDefault();
            axUpdateAsessement(
                rowData._feature_uuid,
                self.parseForm(form),
                (data) => {
                    console.log('CB func', data);
                },
                (request, error) => {
                    console.log('Err CB func', request.responseText);
//                     showModalForm
                    self.showModalForm(request.responseText)

                    // form.html(request.responseText);
                },
            );

        });
        return form;
    },
    parseForm: function (content) {

        var allGroups = content[0].querySelectorAll('[data-group-name]');

        var values = {};

        var groupsCnt = allGroups.length;

        var groupName;
        for (var i = 0; i < groupsCnt; i += 1) {

            groupName = allGroups[i].dataset.groupName;

            var inputs = allGroups[i].querySelectorAll('input, select');

            for (var j = 0; j < inputs.length; j += 1) {
                values[groupName + '/' + inputs[j].name] = inputs[j].value;
            }

        }

        // parse hidden inputs
        var hidden_inputs = document.getElementById('feature_hidden_data').querySelectorAll('input');

        for (var h = 0; h < hidden_inputs.length; h += 1) {
            values[hidden_inputs[h].name + ''] = hidden_inputs[h].value;
        }

        return values;
    },
    showModalForm: function (data) {
        var content = this.getFormAsDomObject(data);
        this.initAccordion(content);

        WB.modal._setContent(content);
        WB.modal._show();
    },
    initAccordion: function (parentDom) {
        $(parentDom).find('#data-accordion').accordion({
            heightStyle: "content",
            header: this.accordionSelector
        });
    },
    addTableEvents: function () {
        var self = this;

        $(this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

            var rowData = self.setSelectedRow(this);

            $.ajax({
                url: url_update_feature(rowData._feature_uuid),
                success: function (data) {
                    self.showModalForm(data)
                },
                error: function (request, error) {
                    console.log(error);
                }
            })

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
