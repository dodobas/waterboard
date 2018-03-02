const FIELD_NAME_TO_CHART = {
    yield: 'yieldRange',
    fencing_exists: 'fencingCnt',
    funded_by: 'fundedByCnt',
    water_committe_exist: 'waterCommiteeCnt',
    static_water_level: 'staticWaterLevelRange',
    amount_of_deposited: 'amountOfDepositedRange',
    functioning: 'functioningDataCnt',
    tabiya: 'tabia'
};


/**
 * Update markers on map
 *
 * @param mapData
 */
function updateMap (mapData) {
    WB.storage.setItem('featureMarkers', createMarkersOnLayer({
        markersData: mapData,
        clearLayer: true,
        iconIdentifierKey: 'functioning',
        layerGroup: WB.storage.getItem('featureMarkers')
    }));
}

/**
 * Filter charts not in filters
 * @param mapMoved
 * @returns {Array}
 */
function filterUpdatableCharts (mapMoved) {
    const toUpdate = Object.assign({}, FIELD_NAME_TO_CHART);

    // update tabia only on map dragend
    if (mapMoved !== true) {
        delete toUpdate['tabiya'];
    }

    let activeFilterKeys = WB.DashboardFilter.getCleanFilterKeys();

    return Object.keys(toUpdate).reduce((chartNamesArr, fieldName, i) => {
         if (activeFilterKeys.indexOf(fieldName) === -1 ) {
            chartNamesArr[chartNamesArr.length] = toUpdate[fieldName];
        }
        return chartNamesArr;
    }, []);
}

function handleChartEventsSuccessCB (data, mapMoved) { // TODO - add some diffing
    const chartData = WB.storage.setItem('dashboarData', JSON.parse(data.dashboard_chart_data));

    let chartsToUpdate = filterUpdatableCharts(mapMoved);

    updateCharts(chartData, chartsToUpdate);
    updateMap(chartData.mapData);

    (WB.storage.getItem('dashboardTable')).redraw(chartData.tableData);
}



/**
 * General Chart Click handler
 *
 * Fetches new data based on map coord and active filters
 *
 * TODO other filters
 *
 */
const handleChartEvents = (props, mapMoved = false) => {
    const {name, filterValue, reset, alreadyClicked} = props;

    if (reset === true) {
        resetAllActiveBars(BAR_CHARTS);
        WB.DashboardFilter.initFilters();
    } else {
        alreadyClicked === true ? WB.DashboardFilter.removeFromFilter(name, filterValue) : WB.DashboardFilter.addToFilter(name, filterValue);
    }

    const filters = {
        filters: WB.DashboardFilter.getCleanFilters(),
        coord: getCoordFromMapBounds(WB.storage.getItem('leafletMap'))
    };

     return axFilterTabyiaData({
        data: JSON.stringify(filters),
        successCb: (data) => handleChartEventsSuccessCB(data, mapMoved),
        errorCb: function (request, error) {
            console.log(request, error);
        }
    });

};


/**
 * on click will return amongst other props:
 * name: -> chart identifier, also same as db field
 * data: -> data used to render chart
 *
 * -> data holds value for filter
 * -> the key for the valu prop is set on init -> filterValueField
 * -> the label and db column name can be different
 * @type {{tabiaChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, fencingCntChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, fundedByCntChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, waterCommiteeCntChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, amountOfDepositedRangeChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, showTitle: boolean, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, staticWaterLevelRangeChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, yieldRangeChart: {name: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: (function(*=)), tooltipRenderer: (function(*): string)}, functioningDataCntChart: {name: string, data: Array, parentId: string, height: number, valueField: string, chartType: string, svgClass: string, labelField: string}}}
 */


function renderDashboardCharts (charts, chartData) {
    let chart, chartKey = '';

    charts.forEach((chartName) => {

        chartKey = `${chartName}${CHART_CONFIG_SUFFIX}`;

        chart = CHART_CONFIGS[chartKey];

        if(chart) {

            chart.data = chartData[`${chartName}`] || [];

            switch (chart.chartType) {
                case 'horizontalBar':
                    return WB.storage.setItem(
                        `${chartKey}`, barChartHorizontal(chart)
                    );
                case 'donut':
                    return WB.storage.setItem(
                        `${chartKey}`, donutChart(chart)
                    );
                case 'pie':
                    return WB.storage.setItem(
                        `${chartKey}`, pieChart(chart)
                    );
                default:
                    return false;
            }
        }


    }  );
}


/**
 * Helper Function execute common chart methods (update, resize...)
 * @param chartDataKeys
 */

function execChartMethod (chartName, methodName, methodArg) {
    let chartInstance = WB.storage.getItem(`${chartName}${CHART_CONFIG_SUFFIX}`);

    if(chartInstance && chartInstance[methodName] instanceof Function) {
        if (methodArg) {
            chartInstance[methodName](methodArg);
        } else {
            chartInstance[methodName]();
        }

    } else {
        console.log(`Chart - ${chartInstance._CHART_TYPE} has no ${methodName} defined`);
    }
}

/**
 * Reset all active bars in all bar charts
 * @param charts
 */
const resetAllActiveBars = (charts) => charts.forEach((chartName) => execChartMethod(chartName, 'resetActive'));

/**
 * Resize all charts  in charts
 * @param charts
 */
const resizeCharts = (charts) => charts.forEach((chartName) => execChartMethod(chartName, 'resize'));


/**
 * Update all Charts based on chart keys
 *
 * Charts are stored as: chart_data_key + 'Chart'
 *
 * @param chartData
 * @param keys
 */
const updateCharts = (chartData, keys = CHART_KEYS) => keys.forEach(
    (chartName) => execChartMethod(chartName, 'updateChart', (chartData[`${chartName}`] || []))
);
