const DEFAULT_CHART_HEIGHT = 400;
const CHART_CONFIG_SUFFIX = 'Chart';

/**
 * Update all Charts based on chart keys
 *
 * Charts are stored as: chart_data_key + 'Chart'
 *
 * @param chartData
 * @param keys
 */
function updateCharts (chartData, keys = CHART_KEYS) {

    keys.forEach((chartName) => {
        (WB.storage.getItem(`${chartName}${CHART_CONFIG_SUFFIX}`)).updateChart(chartData[chartName] || []);
    });
}

function updateMap (mapData) {
    WB.storage.setItem('featureMarkers', createMarkersOnLayer({
        markersData: mapData,
        clearLayer: true,
        iconIdentifierKey: 'functioning',
        layerGroup: WB.storage.getItem('featureMarkers')
    }));
}

/**
 * General Chart Click handler
 *
 * Fetches new data based on map coord and active filters
 *
 * TODO other filters
 *
 */

// TODO will change - handle all clicks
const handleChartEvents = ({origEvent, reset, data = {}}) => {
    let tabia;
    if (reset === true) {
        tabia = WB.storage.setItem('tabiya');
    } else if (data.group) {
        tabia = WB.storage.setItem('tabiya', data.group);
    } else {
        return false;
    }

    return axGetTabyiaData({
        data: {
            tabiya: tabia,
            coord: getCoordFromMapBounds(WB.storage.getItem('leafletMap'))
        },
        successCb: function (data) { // TODO - add some diffing
            const chartData = JSON.parse(data.dashboard_chart_data);

            updateCharts(chartData, CHART_KEYS);
            updateMap(chartData.mapData);
        }
    })};


const CHART_CONFIGS = {
    tabiaChart: {
        data: [],
        parentId: 'tabiaBarChart',
        height: DEFAULT_CHART_HEIGHT * 2,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Tabia',
        chartType: 'horizontalBar',
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Group: ${d.group}</li>
                    <li>Beneficiaries: ${d.beneficiaries}</li>
                    </ul>`
    },
    fencingCntChart: {
        data: [],
        parentId: 'fencingBarChartByFencing',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'fencing',
        title: 'Fencing',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: (e) => {console.log(e);},
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Fencing: ${d.group}</li>
                    </ul>`
    },
    fundedByCntChart: {
        data: [],
        parentId: 'fundedByChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Funded By',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: (e) => {console.log(e);},
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Funders: ${d.group}</li>
                    </ul>`
    },
    waterCommiteeCntChart: { // Water Commitee
        data: [],
        parentId: 'waterCommiteeBarChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'water_committe_exist',
        title: 'Water Commitee',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: (e) => {console.log(e);},
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Water Commitee: ${d.water_committe_exist}</li>
                    </ul>`
    },
    amountOfDepositedRangeChart: {
        data: [],
        parentId: 'amountOfDepositedRangeChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Amount of Deposited',
        chartType: 'horizontalBar',
        groups: {
            '5': {label: '>= 5000'},
            '4': {label: '>= 3000 and < 5000'},
            '3': {label: '>= 500 and < 3000'},
            '2': {label: '> 1  and < 500'},
            '1': {label: '=< 1'}
        },
        showTitle: true,
        barClickHandler: (e) => {console.log(e);},
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    staticWaterLevelRangeChart: {
        data: [],
        parentId: 'staticWaterLevelChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Static Water Level',
        showTitle: true,
        chartType: 'horizontalBar',
        groups: {
            '5': {label: '>= 100'},
            '4': {label: '>= 50 and < 100'},
            '3': {label: '>= 20 and < 50'},
            '2': {label: '> 10  and < 20'},
            '1': {label: '< 10'}
        },
        barClickHandler: (e) => {
            console.log(e);
        },
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    yieldRangeChart: {
        data: [],
        parentId: 'yieldChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Yield',
        showTitle: true,
        chartType: 'horizontalBar',
        groups: {
            '5': {label: '>= 6'},
            '4': {label: '>= 3 and < 6'},
            '3': {label: '>= 1 and < 3'},
            '2': {label: '> 0  and < 1'},
            '1': {label: 'No Data'}
        },
        barClickHandler: (e) => {console.log(e);},
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    functioningDataCntChart: {
        data: [],
        parentId: 'functioningPieChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        chartType: 'pie',
        svgClass: 'pie',
        labelField: 'group',

    },

};

function renderDashboardCharts (chartDataKeys, chartData) {
    let chart, chartKey = '';

    chartDataKeys.forEach((chartName) => {

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
// function getChart
