import {CHART_CONFIGS, DASHBOARD_DATA_TABLE_CONF} from './dashboard.configs';

export default function initDashboards (data) {

    // TODO create a render markup function
    const controller = new DashboardController({
        chartConfigs: CHART_CONFIGS,
        tableConfig: DASHBOARD_DATA_TABLE_CONF,
        //      mapConfig: {},
        dashboarData: data || {}
    });

    // fetch initial data
    controller.filterDashboardData({});

    return controller;
};
