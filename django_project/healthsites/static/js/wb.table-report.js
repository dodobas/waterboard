/**
 * The table report module
 */
var editor;
var WB = (function (module) {

    module.tableReports = module.tableReports || {};

    let options = {};
    let columns = [];
    let reportTable;
    let rowForm;


    const submitForm = function (e) {
        e.preventDefault();

        let fieldName;
        let newData = {};

        columns.forEach((col) => {
            fieldName = col.data;

            if (rowForm[fieldName]) {
                newData[fieldName] = rowForm[fieldName].value;
            } else {
                newData[fieldName] = options.data[fieldName];
            }
        });


        console.log("[Parsed Data]\n", JSON.stringify(newData, null, 4));
        console.log("[Ajax here]\n",);

        return false;
    };

    module.tableReports.init = function (domId, dataTableOptions) {

        options = dataTableOptions;
        columns = dataTableOptions.columns;

        // TODO split later into smaller peaces and separate
        const tbl = $(domId);
        let rowData = {};

        reportTable = tbl.DataTable(dataTableOptions);

        console.log(dataTableOptions);

        rowForm = document.getElementById('form-assessment');

        $(rowForm).on('submit', submitForm);


        $(`${domId} tbody`).on('click', 'tr', function () {
            rowData = reportTable.row( this ).data();
            console.log(this);
            let fieldName;
            for (fieldName in rowData) {
                if ( rowForm[fieldName]) {
                    rowForm[fieldName].value = rowData[fieldName];
                }
            }

            for (fieldName in rowData.assessment || {}) {
                if ( rowForm[fieldName]) {
                    rowForm[fieldName].value = rowData.assessment[fieldName].value;
                }
            }

            $('#modal-assessment-form').modal();
        });

        return tbl;
    };

    return module;

}(WB || {}));
