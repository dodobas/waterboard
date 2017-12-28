/**
 * The table report module
 */
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

        var rowForm = document.getElementById('add_even_form');

        $(rowForm).on('submit', submitForm);


        $(`${domId} tbody`).on('click', 'tr', function () {
            rowData = reportTable.row(this).data();
            // TODO get id and get data from the backend
            console.log(this);

            console.log(rowData.id);


            let fieldName;

            $.ajax({
                url: "/healthsites/update-assessment/" + rowData.id,

                success: function (data) {
                    var form = $('#modal-assessment-form-inner');

                    form.html(data);

                    var formObj = form[0].querySelector('#add_even_form');
                    $('#update_button').on('click', function (e) {
                        e.preventDefault();

                        var groups = (form.find('h3'));

                        var general = groups[0];

                        var generalFields = $(general).next();

                        var inputs = generalFields.find('input');

                        var inputsCnt = inputs.length;

                        var values = {};

                        var i = 0;
                        var name, val;
                        for (i; i < inputsCnt; i += 1) {
                            name = inputs[i].name + '';
                            val = inputs[i].value;

                            values[name] = val;
                        }

                        i = 1;
                        var j = 0;
                        var groupsCnt = groups.length;

                        var name, group, groupName;
                        for (i; i < groupsCnt; i += 1) {
                            group = $(groups[i]).next();

                            groupName = groups[i].innerText;

                            inputs = group.find('input');

                            inputsCnt = inputs.length;


                            j = 0;

                            for (j; j < inputsCnt; j += 1) {
                                name = inputs[j].name + '';
                                val = inputs[j].value;

                                values[groupName + '/' + name] = val;
                            }

                        }
                        console.log(values);

                        // AX call


                        $.ajax({
                            url: "/healthsites/update-assessment/" + rowData.id,
                            method: 'POST',
                            data: values,
                            // beforeSend: function (xhr, settings) {
                            //     if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !this.crossDomain) {
                            //         xhr.setRequestHeader("X-CSRFToken", csrftoken);
                            //     }
                            // },
                            success: function (data) {
                                console.log(data);

                            },
                            error: function (request, error) {
                                console.log(error);
                                form.html(request.responseText);
                            }
                        })


                    });

                    $('#modal-assessment-form').modal();
                    console.log(data);
                },
                error: function (request, error) {
                    console.log(error);
                }
            })
            /*   for (fieldName in rowData) {
                   if ( rowForm[fieldName]) {
                       rowForm[fieldName].value = rowData[fieldName];
                   }
               }

               for (fieldName in rowData.assessment || {}) {
                   if ( rowForm[fieldName]) {
                       rowForm[fieldName].value = rowData.assessment[fieldName].value;
                   }
               }*/


        });

        return tbl;
    };

    return module;

}(WB || {}));
