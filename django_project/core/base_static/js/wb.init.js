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


    return module;

})(WB || {});
