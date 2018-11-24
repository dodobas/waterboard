// DASHBOARD PAGE CONFIGURATIONS

var DEFAULT_CHART_HEIGHT = 235;

var MAP_CONFIGS = {
    mapOnMoveEndHandler: _.debounce(mapOnMoveEndHandler, 250),
    mapId: 'featureMapWrap',
    tileLayerDef: TILELAYER_DEFINITIONS
};

/**
 * Chart class configurations
 *
 * @type {{tabiyaChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, fencingCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, fundedByCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, waterCommiteeCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, amountOfDepositedRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, showTitle: boolean, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, staticWaterLevelRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, yieldRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, clickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, functioningDataCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, chartType: string, svgClass: string}}}
 */

// chart config keys must be same as keys in returned data from the db (filter query)
var CHART_CONFIGS = {
    tabiya: {// bar
        chartKey: 'tabiya', // chart identifier
        name: 'tabiya', // db fieldname
        filterValueField: 'group', // key of filter value in data - if not set will default to set labelField
        valueField: 'cnt', // key of data value in data
        labelField: 'group', // key of data label in data
        data: [],
        parentId: 'tabiyaBarChart', // where the chart will be rendered
        height: DEFAULT_CHART_HEIGHT ,
        title: 'Tabia',
        showTitle: false,
        chartType: 'horizontalBar', // helper flag for dynamic render
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: tabiyaTooltip,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7,
            parentId: 'tabiyaPagination'

        },
        barsCnt: 7 // number of bars to show
    },
       woreda: {
        chartKey: 'woreda',
        name: 'woreda',
        filterValueField: 'group',
        data: [],
        title: 'Woreda',
        showTitle: true,
        parentId: 'woredaChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        chartType: 'horizontalBar',
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: tabiyaTooltip,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7,
            parentId: 'woredaPagination'

        },
        barsCnt: 7, // number of bars to show
        sortKey: 'group_id' // woredaPagination
    },
    fencing: {// bar
        chartKey: 'fencing',
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
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: fencingTooltipRenderer,
        isFilter: true,
        barsCnt: 3
    },
    fundedBy: {// bar
        chartKey: 'fundedBy',
        name: 'funded_by',
        filterValueField: 'group',
        data: [],
        parentId: 'fundedByChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        title: 'Funded By',
        showTitle: false,
        chartType: 'horizontalBar',
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: fundedByTooltipRenderer,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7,
            parentId: 'fundedByPagination'
        },
        barsCnt: 7
    },
    waterCommitee: { // bar
        chartKey: 'waterCommitee',
        name: 'water_committee_exists',
        filterValueField: 'water_committee_exists',
        data: [],
        parentId: 'waterCommiteeBarChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'water_committee_exists',
        title: 'Water Committee',
        showTitle: true,
        chartType: 'horizontalBar',
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: waterCommiteeTooltipRenderer,
        isFilter: true,
        barsCnt: 3
    },
    amountOfDeposited: { //range
        chartKey: 'amountOfDeposited',
        name: 'amount_of_deposited_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'amountOfDepositedRangeChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label',
        title: 'Amount of Deposited (Birr)',
        chartType: 'horizontalBar',
        showTitle: true,
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: rangeChartTooltipRenderer,
        isFilter: true,
        barsCnt: 5,
        sortKey: 'group_id'
    },
    staticWaterLevel: { // range
        chartKey: 'staticWaterLevel',
        name: 'static_water_level_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'staticWaterLevelChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', //'group',
        title: 'Static Water Level (m)',
        showTitle: true,
        chartType: 'horizontalBar',
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: rangeChartTooltipRenderer,
        isFilter: true,
        barsCnt: 5,
        sortKey: 'group_id'
    },
    yield: { // range
        chartKey: 'yield',
        name: 'yield_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'yieldChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', // 'group',
        title: 'Yield (l/sec)',
        showTitle: true,
        chartType: 'horizontalBar',
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: rangeChartTooltipRenderer,
        isFilter: true,
        barsCnt: 5,
        sortKey: 'group_id'
    },
    functioning: { // pie
        chartKey: 'functioning',
        name: 'functioning',
        filterValueField: 'group',
        data: [],
        title: 'Functioning',
        showTitle: true,
        parentId: 'functioningPieChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group',
        chartType: 'pie',
        svgClass: 'wb-pie-chart',
        clickHandler: DashboardController.handleChartEvents,
        isFilter: true,
        sliceColors: {
            Yes: '#8dab9e',
            No: 'red',
            Unknown:'#6d6d6d'
        }
    },

    beneficiaries: {
        chartKey: 'beneficiaries',
        name: 'beneficiaries',
        data: [],
        parentId: 'beneficiariesChart',
        chartType: 'beneficiariesInfo',
        isFilter: false
    },
    schemeType: {
        chartKey: 'schemeType',
        name: 'schemetype',
        data: [],
        parentId: 'schemeTypeChart',
        chartType: 'schemeTypeInfo',
        isFilter: false
    }
};
