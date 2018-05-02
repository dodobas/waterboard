// TODO move all init functions from html files
// init function per page

var WB = (function (module) {

    if (!module.init) {
        module.init = {};

    }

    // todo rename to dashboardcController
    module.controller = {};


    // Main Dashboard Page Controller
    module.init.initDashboards = function (data) {

        // init module and set options
        module.notif = module.SimpleNotification()
            .options({
                message: null,
                type: 'success',
                fadeOut: {
                    delay: Math.floor(Math.random() * 500) + 2500,
                    enabled: true
                }
            });

        // init notification
        module.notif();

        // TODO create a render markup function
        module.controller = new DashboardController({
            chartConfigs: CHART_CONFIGS,
            tableConfig: TABLE_DATA_CONFIG,
            mapConfig: MAP_CONFIGS,
            dashboarData: data || {}
        });


    };



     // Main Table reports page
    module.init.initTableReport = function (reportTableDataAttributes) {
        var dynamicColumns = reportTableDataAttributes.map(function (attribute) {
            return {
              data: attribute.key,
              title: '<div>' + attribute.label + '</div>',
              searchable: attribute.searchable,
              orderable: attribute.orderable
            };
          });

      var TABLE_REPORT_COLUMNS = [{
        data: '_last_update',
        title: 'Last Update',
        searchable: false,
        render: timestampColumnRenderer,
        orderable: true
      }, {
        data: '_webuser',
        title: 'User',
        searchable: false,
        orderable: true
      }].concat(dynamicColumns);

      var options = {
        dataTable: {
          "dom": 'l<"wb-export-toolbar">frtip',
          scrollX: true,
          fixedHeader: true,
          columns: TABLE_REPORT_COLUMNS,
          order: [[0, 'desc']],
          lengthMenu: TABLE_ROWS_PER_PAGE,
          rowClickCb: tableRowClickHandlerFn,
          serverSide: true,
          // this is only throttling and not debouncing, for debouncing we need to fully control search input events
          searchDelay: 400,
          ajax: {
            url: '/table-data',
            type: 'POST'
          }
        }
      };

      module.tableReports.init('reports-table', options);
    };


    return module;

})(WB || {});
