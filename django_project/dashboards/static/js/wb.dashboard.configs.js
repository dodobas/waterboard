// TODO namespace and stuff..

// ['tabiya', 'fencing_exists', 'functioning', 'funded_by', 'water_committe_exist','static_water_level', 'amount_of_deposited', 'yield'
const DEFAULT_CHART_HEIGHT = 400;
const CHART_CONFIG_SUFFIX = 'Chart';

const OTHER_KEYS = ['mapData'];

// 'tabiya', 'fencing_exists', 'functioning', 'funded_by', 'water_committe_exist','static_water_level', 'amount_of_deposited', 'yield'
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
    // 'functioning'
    'functioningDataCnt'
];

const CHART_KEYS = [
    ...BAR_CHARTS, ...PIE_KEYS
];

const chartDataKeys = [...OTHER_KEYS, ...CHART_KEYS];


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
    mapOnMoveEndHandler: mapOnMoveEndHandler
};

/**
 * Chart class configurations
 *
 * @type {{tabiaChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, fencingCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, fundedByCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, waterCommiteeCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, amountOfDepositedRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, showTitle: boolean, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, staticWaterLevelRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, yieldRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: handleChartEvents, tooltipRenderer: (function(*): string)}, functioningDataCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, chartType: string, svgClass: string}}}
 */
// const FIELD_NAME_TO_CHART = {
//     yield: 'yieldRange',
//     fencing_exists: 'fencingCnt',
//     funded_by: 'fundedByCnt',
//     water_committe_exist: 'waterCommiteeCnt',
//     static_water_level: 'staticWaterLevelRange',
//     amount_of_deposited: 'amountOfDepositedRange',
//     functioning: 'functioningDataCnt',
//     tabiya: 'tabia'
// };


const CHART_CONFIGS = {
    tabiya: {
        name: 'tabiya', // db fieldname
        filterValueField: 'group', // key of filter value in data - if not set will default to set labelField
        valueField: 'cnt', // key of data value in data
        labelField: 'group', // key of data label in data
        data: [],
        parentId: 'tabiaBarChart', // where the chart will be rendered
        height: DEFAULT_CHART_HEIGHT * 2,
        title: 'Tabia',
        showTitle: false,
        chartType: 'horizontalBar', // helper flag for dynamic render
        barClickHandler: handleChartEvents,
        tooltipRenderer: tabiaTooltip
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
        tooltipRenderer: fencingTooltipRenderer
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
        tooltipRenderer: fundedByTooltipRenderer
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
        tooltipRenderer: waterCommiteeTooltipRenderer
    },
    amountOfDepositedRangeChart: {
        name: 'amount_of_deposited',
        filterValueField: 'group_id',
        data: [],
        parentId: 'amountOfDepositedRangeChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label',
        title: 'Amount of Deposited',
        chartType: 'horizontalBar',
        showTitle: true,
        barClickHandler: handleChartEvents,
        tooltipRenderer: amountOfDepositedTooltipRenderer
    },
    staticWaterLevelRangeChart: {
        name: 'static_water_level',
        filterValueField: 'group_id',
        data: [],
        parentId: 'staticWaterLevelChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', //'group',
        title: 'Static Water Level',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: handleChartEvents,
        tooltipRenderer: staticWaterLevelTooltipRenderer
    },
    yieldRangeChart: {
        name: 'yield',
        filterValueField: 'group_id',
        data: [],
        parentId: 'yieldChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', // 'group',
        title: 'Yield',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: handleChartEvents,
        tooltipRenderer: yieldTooltipRenderer
    },
    functioningDataCntChart: {
        name: 'functioning',
        filterValueField: 'group_id',
        data: [],
        title: 'Functioning',
        showTitle: true,
        parentId: 'functioningPieChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        chartType: 'pie',
        svgClass: 'pie',
        clickHandler: handleChartEvents,
        tooltipRenderer: functioningTooltipRenderer
    }
};
