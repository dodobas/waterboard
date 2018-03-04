
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
 * Returns object with fieldname to chart identifier mapping from chart config
 * @param chartConf
 * @returns {*}
 */
function getFieldToChartMapping (chartConf) {
    return Object.keys(chartConf).reduce((acc, val, i) => {
        acc[chartConf[val].name] = val;
    return acc
    }, {});
}

/**
 * Get chart keys for specified chart type
 * @param chartConf
 * @param chartType
 * @returns {*}
 */
function getChartKeysByChartType (chartConf, chartType) {
    return Object.keys(chartConf).reduce((acc, val, i) => {
        if (chartConf[val].chartType === chartType) {
            acc[acc.length] = val;
        }
        return acc;
    }, []);
}


/**
 * Get chart filter keys (filter field names) from chart confit
 * @param chartConf
 * @param chartType
 * @returns {*}
 */
function getFilterableChartKeys (chartConf) {
    return Object.keys(chartConf).reduce((acc, val, i) => {
        if (chartConf[val].isFilter === true) {
            acc[acc.length] = chartConf[val].name;
        }
        return acc;
    }, []);
}
/**
 * Filter charts not in filters
 * @param mapMoved
 * @returns {Array}
 */
function filterUpdatableCharts (mapMoved) {
    const toUpdate = getFieldToChartMapping(CHART_CONFIGS);

    let activeFilterKeys = WB.DashboardFilter.getCleanFilterKeys();

    return Object.keys(toUpdate).reduce((chartNamesArr, fieldName, i) => {
         if (activeFilterKeys.indexOf(fieldName) === -1 ) {
            chartNamesArr[chartNamesArr.length] = toUpdate[fieldName];
        }
        return chartNamesArr;
    }, []);
}

function updateDashboards (data, mapMoved) { // TODO - add some diffing
    const chartData = WB.storage.setItem('dashboarData', JSON.parse(data.dashboard_chart_data));

    let chartsToUpdate = filterUpdatableCharts(mapMoved);

    // updateCharts(chartData, chartsToUpdate);
    execForAllCharts(chartsToUpdate, 'updateChart', (chartData || []));
    updateMap(chartData.mapData);

    (WB.storage.getItem('dashboardTable')).redraw(chartData.tableData);
}

const handleChartFilterFiltering = (props) => {
     const {name, filterValue, reset, alreadyClicked} = props;

        console.log('--->', name, filterValue);
    if (reset === true) {
        // remove .active class from clicked bars
        const barChartKeys = getChartKeysByChartType(CHART_CONFIGS, 'horizontalBar');

        execForAllCharts(barChartKeys, 'resetActive');
        WB.DashboardFilter.initFilters();
    } else {
        alreadyClicked === true ? WB.DashboardFilter.removeFromFilter(name, filterValue) : WB.DashboardFilter.addToFilter(name, filterValue);
    }

    return {
        filters: WB.DashboardFilter.getCleanFilters(),
        coord: getCoordFromMapBounds(WB.storage.getItem('leafletMap'))
    };
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

    const preparedFilters = handleChartFilterFiltering(props, mapMoved);

    return axFilterTabyiaData({
        data: JSON.stringify(preparedFilters),
        successCb: (data) => updateDashboards(data, mapMoved),
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


function renderDashboardCharts (chartKeys, chartData) {
    let chart;
console.log(chartKeys, chartData);
    chartKeys.forEach((chartKey) => {

        chart = CHART_CONFIGS[chartKey];

        if(chart) {

            chart.data = chartData[`${chartKey}`] || [];

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
        } else {
            console.log(`No Chart Configuration found - ${chartKey}`);
        }


    }  );
}


/**
 * Helper Function - execute common chart methods (update, resize...)
 * @param chartDataKeys
 */
function execChartMethod (chartName, methodName, methodArg) {
    let chartInstance = WB.storage.getItem(`${chartName}`);

    if(chartInstance && chartInstance[methodName] instanceof Function) {
        if (methodArg) {
            chartInstance[methodName](methodArg);
        } else {
            chartInstance[methodName]();
        }

    } else {
        console.log(`Chart - ${chartName} has no ${methodName} defined or does not exist.`);
    }
}


// execForAllCharts(chartNames, 'resetActive')
// execForAllCharts(chartNames, 'resize')
// execForAllCharts(chartNames, 'updateChart', methodArg)
function execForAllCharts(chartNames, methodName, methodArg = null) {
    chartNames.forEach((chartName) => execChartMethod(chartName, methodName, methodArg && methodArg[chartName]));
}

// CHART TOOLTIP RENDER FUNCTIONS

const tabiaTooltip = (d) => `<ul>
        <li>Count: ${d.cnt}</li>
        <li>Group: ${d.group}</li>
        <li>Beneficiaries: ${d.beneficiaries}</li>
        </ul>`;

const fencingTooltipRenderer = (d) => `<ul>
  <li>Count: ${d.cnt}</li><li>Fencing: ${d.group}</li>
</ul>`;

const fundedByTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Funders: ${d.group}</li>
                    </ul>`;

const waterCommiteeTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Water Commitee: ${d.water_committe_exist}</li>
                    </ul>`;

const amountOfDepositedTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`;

const staticWaterLevelTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`;

const yieldTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`;

const functioningTooltipRenderer = (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Group: ${d.group_id}</li>
                    </ul>`;

const mapOnMoveEndHandler = WB.utils.debounce(function(e) {
    handleChartEvents({
            origEvent: e,
            reset: false
        });
    }, 250);
