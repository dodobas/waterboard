// TODO namespace and stuff..

// ['tabiya', 'fencing_exists', 'functioning', 'funded_by', 'water_committe_exist','static_water_level', 'amount_of_deposited', 'yield'
const DEFAULT_CHART_HEIGHT = 200;

const MAP_CONFIGS = {
    mapOnMoveEndHandler: WB.utils.debounce(mapOnMoveEndHandler, 250),
    mapId: 'featureMapWrap',
    tileLayerDef: DEFAULT_TILELAYER_DEF
};

/**
 * Chart class configurations
 *
 * @type {{tabiaChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, fencingCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, fundedByCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, waterCommiteeCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, amountOfDepositedRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, showTitle: boolean, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, staticWaterLevelRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, yieldRangeChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, title: string, showTitle: boolean, chartType: string, groups: {5: {label: string}, 4: {label: string}, 3: {label: string}, 2: {label: string}, 1: {label: string}}, barClickHandler: DashboardController.handleChartEvents, tooltipRenderer: (function(*): string)}, functioningDataCntChart: {name: string, filterValueField: string, data: Array, parentId: string, height: number, valueField: string, labelField: string, chartType: string, svgClass: string}}}
 */

// chart config keys must be same as keys in returned data from the db (filter query)
const CHART_CONFIGS = {
    tabia: {// bar
        name: 'tabiya', // db fieldname
        filterValueField: 'group', // key of filter value in data - if not set will default to set labelField
        valueField: 'cnt', // key of data value in data
        labelField: 'group', // key of data label in data
        data: [],
        parentId: 'tabiaBarChart', // where the chart will be rendered
        height: DEFAULT_CHART_HEIGHT ,
        title: 'Tabia',
        showTitle: false,
        chartType: 'horizontalBar', // helper flag for dynamic render
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: tabiaTooltip,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            nextBtnId: 'tabia-next',
            prevBtnId: 'tabia-previous',

        }
    },
    fencing: {// bar
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
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: fencingTooltipRenderer,
        isFilter: true
    },
    fundedBy: {// bar
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
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: fundedByTooltipRenderer,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            nextBtnId: 'fundedBy-next',
            prevBtnId: 'fundedBy-previous',

        }
    },
    waterCommitee: { // bar
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
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: waterCommiteeTooltipRenderer,
        isFilter: true
    },
    amountOfDeposited: { //range
        name: 'amount_of_deposited_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'amountOfDepositedRangeChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label',
        title: 'Amount of Deposited',
        chartType: 'horizontalBar',
        showTitle: true,
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: amountOfDepositedTooltipRenderer,
        isFilter: true
    },
    staticWaterLevel: { // range
        name: 'static_water_level_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'staticWaterLevelChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', //'group',
        title: 'Static Water Level',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: staticWaterLevelTooltipRenderer,
        isFilter: true
    },
    yield: { // range
        name: 'yield_group_id',
        filterValueField: 'group_id',
        data: [],
        parentId: 'yieldChart',
        height: DEFAULT_CHART_HEIGHT,
        valueField: 'cnt',
        labelField: 'group_def.label', // 'group',
        title: 'Yield',
        showTitle: true,
        chartType: 'horizontalBar',
        barClickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: yieldTooltipRenderer,
        isFilter: true
    },
    functioning: { // pie
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
        clickHandler: DashboardController.handleChartEvents,
        tooltipRenderer: functioningTooltipRenderer,
        isFilter: true
    }
};


// DATA TABLE

const TABLE_DATA_CONFIG = {
    dataTable: {
        data: [],
        searching: false,
        scrollX: true,
        fixedHeader: true,
        columns: [{
            data: '_last_update',
            title: 'Last Update',
            searchable: false,
            render: timestampColumnRenderer,
            orderable: true
        }, {
            data: '_webuser',
            title: 'User',
            searchable: false,
            orderable: true
        }, {
            data: 'feature_name',
            title: 'Name',
            searchable: false,
            orderable: true
        }, {
            data: 'tabiya',
            title: 'Tabiya',
            searchable: false,
            orderable: true
        }, {
            data: 'yield',
            title: 'YLD',
            searchable: false,
            orderable: true
        }, {
            data: 'static_water_level',
            title: 'SWL',
            searchable: false,
            orderable: true
        }],
        order: [],
        lengthMenu: TABLE_ROWS_PER_PAGE,
        rowClickCb: tableRowClickHandlerFn

    }
};
