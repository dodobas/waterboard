import {CHART_CONFIGS} from './dashboard.configs';

import DashboardController from './DashboardController';
export default function initDashboards (data) {

    // TODO create a render markup function
    const controller = new DashboardController({
        chartConfigs: CHART_CONFIGS,
        dashboarData: data || {}
    });

    // fetch initial data
    controller.filterDashboardData({});

    return controller;
}
