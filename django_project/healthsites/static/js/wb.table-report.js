/**
 * The table report module
 */
var editor;
var WB = (function (module) {

    module.tableReports = module.tableReports || {};

    module.tableReports.init = function (domId, data, columns) {
        console.log('works');
        const tbl = $(domId);

        const dataTbl = tbl.DataTable({
            data: data,
            columns: columns,
            "order": [[2, "desc"]],
           // select: true,
        buttons: [
            { extend: "create", editor: editor },
            { extend: "edit",   editor: editor },
            { extend: "remove", editor: editor }
        ]
        });

        $(`${domId} tbody`).on('click', 'tr', function () {
            var data = dataTbl.row( this ).data();

            console.log(data);
           /* $('#myModal').modal({
                data: data
            })*/
        });

        return tbl;
    };

    return module;

}(WB || {}));



