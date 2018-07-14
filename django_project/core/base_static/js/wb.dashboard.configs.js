// DASHBOARD PAGE CONFIGURATIONS

var DEFAULT_CHART_HEIGHT = 200;

var MAP_CONFIGS = {
    mapOnMoveEndHandler: _.debounce(mapOnMoveEndHandler, 250),
    mapId: 'featureMapWrap',
    tileLayerDef: TILELAYER_DEFINITIONS
};

/**
 * Chart class configurations
 *

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
        title: 'Tabyia',
        showTitle: false,
        chartType: 'horizontalBar', // helper flag for dynamic render

        tooltipRenderer: WBLib.templates.tooltips.tabiya,
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

        tooltipRenderer: WBLib.templates.tooltips.tabiya,
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

        tooltipRenderer: WBLib.templates.tooltips.fencing,
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

        tooltipRenderer: WBLib.templates.tooltips.fundedBy,
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

        tooltipRenderer: WBLib.templates.tooltips.waterCommitee,
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
        title: 'Amount of Deposited',
        chartType: 'horizontalBar',
        showTitle: true,

        tooltipRenderer: WBLib.templates.tooltips.rangeChart,
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
        title: 'Static Water Level',
        showTitle: true,
        chartType: 'horizontalBar',

        tooltipRenderer: WBLib.templates.tooltips.rangeChart,
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
        title: 'Yield',
        showTitle: true,
        chartType: 'horizontalBar',

        tooltipRenderer: WBLib.templates.tooltips.rangeChart,
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
    }
};


// DATA TABLE

var TABLE_DATA_CONFIG = {
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
            data: 'woreda',
            title: 'Woreda',
            searchable: false,
            orderable: true
        }, {
            data: 'tabiya',
            title: 'Tabiya',
            searchable: false,
            orderable: true
        }, {
            data: 'kushet',
            title: 'Kushet',
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
        order: [[0, 'desc']],
        lengthMenu: TABLE_ROWS_PER_PAGE,
        rowClickCb: tableRowClickHandlerFn,
        serverSide: true,
        // this is only throttling and not debouncing, for debouncing we need to fully control search input events
        searchDelay: 400,
        ajax: {
          url: '/dashboard-tabledata/',
          type: 'POST',
          data: function (filters) {
              var preparedFilters =  WB.controller.getChartFilterArg ? WB.controller.getChartFilterArg() : {};

              filters['_filters'] = JSON.stringify(preparedFilters);

              return filters;
          }
        }

    }
};
