var WB = (function (module) {

    module.tableReports = module.tableReports || {};
console.log("-------------", module);

    module.tableReports.init = function (domId, data, columns) {
        console.log('works');
        return $(domId).DataTable( {
            data: data,
            columns: columns
        });
    };

    return module;

}(WB || {}));



