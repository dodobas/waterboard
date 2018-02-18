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

function resizeCharts (charts) {
    let chart;

    charts.forEach((chartName) => {

        chart = WB.storage.getItem(`${chartName}${CHART_CONFIG_SUFFIX}`);

        if (chart.resize && chart.resize instanceof Function) {
            chart.resize();
        } else {
            console.log(`Chart Resize Method not implemented - ${chart._CHART_TYPE}`);
        }


    });
}

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
 * General Chart Click handler
 *
 * Fetches new data based on map coord and active filters
 *
 * TODO other filters
 *
 */

// TODO will change - handle all clicks
const handleChartEvents = (props) => {
    const {origEvent, name, chartType, chartId , reset, data = {}} = props;

    // name - chart name -> field name; data .wa
    console.log(props);
    let tabia, fencing_exists;

    if (reset === true) {
        tabia = WB.storage.setItem('tabiya');
        fencing_exists = WB.storage.setItem('fencing_exists');
    } else {
        if (name === 'tabiya') {
            if (data.group) {
                tabia = WB.storage.setItem('tabiya', data.group);
            } else {
                return false;
            }

        }  else if (name === 'fencing_exists') {
            if (data.fencing) {
                fencing_exists = WB.storage.setItem('fencing_exists', data.fencing);
            }
        } else {
           // console.log('other filter', props);
        }
    }

    return false;
    return axGetTabyiaData({
        data: {
            tabiya: tabia,
            fencing_exists: fencing_exists,
            coord: getCoordFromMapBounds(WB.storage.getItem('leafletMap'))
        },
        successCb: function (data) { // TODO - add some diffing
            const chartData = JSON.parse(data.dashboard_chart_data);

            updateCharts(chartData, CHART_KEYS);
            updateMap(chartData.mapData);
        }
    })};

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
const CHART_CONFIGS = {
    tabiaChart: {
        name: 'tabiya',
        filterValueField: 'group', // if not set will default to set labelField
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
        name: 'fencing_exists',
        filterValueField: 'fencing',
        data: [],
        parentId: 'fencingBarChartByFencing',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'fencing',
        title: 'Fencing',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Fencing: ${d.group}</li>
                    </ul>`
    },
    fundedByCntChart: {
        name: 'funded_by',
        filterValueField: 'group',
        data: [],
        parentId: 'fundedByChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Funded By',
        showTitle: true,
        chartType: 'horizontalBar',
       barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Funders: ${d.group}</li>
                    </ul>`
    },
    waterCommiteeCntChart: { // Water Commitee
        name: 'water_committe_exist',
        filterValueField: 'group_id',
        data: [],
        parentId: 'waterCommiteeBarChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'water_committe_exist',
        title: 'Water Commitee',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Water Commitee: ${d.water_committe_exist}</li>
                    </ul>`
    },
    amountOfDepositedRangeChart: {
        name: 'amount_of_deposited',
        filterValueField: 'group_id',
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
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    staticWaterLevelRangeChart: {
        name: 'static_water_level',
        filterValueField: 'water_committe_exist',
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
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    yieldRangeChart: {
        name: 'yield',
        filterValueField: 'group_id',
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
        barClickHandler: handleChartEvents,
        tooltipRenderer: (d) => `<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    <li>Range: ${d.group}</li>
                    </ul>`
    },
    functioningDataCntChart: {
        name: 'functioning',
        filterValueField: 'group_id',
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
