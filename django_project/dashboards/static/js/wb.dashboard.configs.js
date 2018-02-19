// TODO namespace and stuff..

// ['tabiya', 'fencing_exists', 'functioning', 'funded_by', 'water_committe_exist'] // , 'static_water_level', 'amount_of_deposited', 'yield'
const DEFAULT_CHART_HEIGHT = 400;
const CHART_CONFIG_SUFFIX = 'Chart';

const OTHER_KEYS = ['mapData'];

const BAR_CHARTS = [
    'tabia',
    'yieldRange',
    'fencingCnt',
    'fundedByCnt',
    'waterCommiteeCnt',
    'staticWaterLevelRange',
    'amountOfDepositedRange'
];
const PIE_KEYS = [
    'functioningDataCnt'
];

const CHART_KEYS = [
    ...BAR_CHARTS, ...PIE_KEYS
];

const chartDataKeys = [...OTHER_KEYS, ...CHART_KEYS];

// TODO should be dynamic
// Group definitions for charts which show aggregated range data (yes, no etc)
/**
 * Group defiitions for aggregated range data (has group_id in data)
 * @type {{yieldRange: {1: {label: string}, 2: {label: string}, 3: {label: string}, 4: {label: string}, 5: {label: string}}, staticWaterLevelRange: {1: {label: string}, 2: {label: string}, 3: {label: string}, 4: {label: string}, 5: {label: string}}, amountOfDepositedRange: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}}}
 */
const RANGE_CHART_GROUPS = {
    yieldRange: {
        1: {label: 'No Data'},
        2: {label: '> 0 and < 1'},
        3: {label: '1> 0 AND yield < 3'},
        4: {label: '>= 3 and < 6'},
        5: {label: '>= 6'}
    },
    staticWaterLevelRange: {
        1: {label: 'No Data'},
        2: {label: '> 0 and < 1'},
        3: {label: '1> 0 AND yield < 3'},
        4: {label: '>= 3 and < 6'},
        5: {label: '>= 6'}
    },
    amountOfDepositedRange: {
        '5': {label: '>= 5000'},
        '4': {label: '>= 3000 and < 5000'},
        '3': {label: '>= 500 and < 3000'},
        '2': {label: '> 1  and < 500'},
        '1': {label: '=< 1'}
    }
};

const MAP_CONFIGS = {
    mapId: 'featureMapWrap',
    tileLayerDef: {
      externalLayers: {
        bingLayer: {
          label: 'Bing Layer',
          key: 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
        }
      },
      withUrl: {
        mapbox: {
          label: 'MapBox',
          mapOpts: {
            url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFrc2hhayIsImEiOiJ5cHhqeHlRIn0.Vi87VjI1cKbl1lhOn95Lpw',
            options: {
              attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
          }
        },
        googleSatLayer: {
          label: 'Google Satellite',
          mapOpts: {
            url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            options: {
              maxZoom: 20,
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }
          }

        }
      }
    },
    mapOnMoveEndHandler: (e) => handleChartEvents({
        origEvent: e,
        reset: false
    })
};

/**
 * Chart class configurations
 *
 * @type {{tabiaChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, fencingCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, fundedByCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, waterCommiteeCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, amountOfDepositedRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, showTitle: boolean, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, staticWaterLevelRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, yieldRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, functioningDataCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, chartType: string, svgClass: string}}}
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
        filterValueField: 'water_committe_exist',
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
        filterValueField: 'group_id',
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
        labelField: 'group',
        chartType: 'pie',
        svgClass: 'pie'

    },

};
