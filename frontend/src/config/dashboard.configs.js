// DASHBOARD PAGE CONFIGURATIONS
import {tooltips} from '../components/templates/wb.templates';
import {DEFAULT_CHART_HEIGHT} from './index'

/**
 * Chart class configurations
 *

 */

// chart config keys must be same as keys in returned data from db (filter query)
/**
 *
 * chartKey: string           - chart identifier
 * name: string               - db column field
 * filterValueField: string,  - key of filter value in data - if not set will default to set labelField
 * valueField: string,        - key path of data value in data, can be nested - prop1.prop2.prop3
 * labelField: string,        - key path of data label in data
 * data: Array,
 * parentId: string,          - dom id - where the chart will be rendered
 * height: number,
 * title: string,
 * showTitle: boolean,
 * chartType: string,         - helper flag for dynamic render
 * tooltipRenderer: func,     - render function for tootltips (triggered on mouseoover)
 * isFilter: boolean,
 * hasPagination: boolean,
 * paginationConf: {
 *    itemsPerPage: number,
 *    parentId: string
 * },
 * barsCnt: number           - if chartType: 'horizontalBar' represents number of bars to show
 * sortKey: string           - data sort key (sort using _.orderBy), defaults to valueField
 * sliceColors: {            - only for pie chart, slice background colors for groups
 *    Yes: '#8dab9e',
 *    No: 'red',
 *    group_name_in_data: color_code
 * }
 *
 */
// chartKey +'Pagination'
// waterCommitee + type + 'Chart'  horizontalBar
export const CHART_CONFIGS = {
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

        tooltipRenderer: tooltips.tabiya,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7

        },
        barsCnt: 7,
        sortKey: 'group_id'
    },
    tabiya: {// bar
        chartKey: 'tabiya', // chart identifier
        name: 'tabiya', // db fieldname
        filterValueField: 'group', // key of filter value in data - if not set will default to set labelField
        valueField: 'cnt', // key of data value in data
        labelField: 'group', // key of data label in data
        data: [],
        parentId: 'tabiyaBarChart', // where the chart will be rendered
        height: DEFAULT_CHART_HEIGHT,
        title: 'Tabyia',
        showTitle: true,
        chartType: 'horizontalBar', // helper flag for dynamic render

        tooltipRenderer: tooltips.tabiya,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7

        },
        barsCnt: 7 // number of bars to show
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
        showTitle: true,
        chartType: 'horizontalBar',

        tooltipRenderer: tooltips.fundedBy,
        isFilter: true,
        hasPagination: true,
        paginationConf: {
            itemsPerPage: 7
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

        tooltipRenderer: tooltips.waterCommitee,
        isFilter: true,
        barsCnt: 3
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

        tooltipRenderer: tooltips.fencing,
        isFilter: true,
        barsCnt: 3
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
            Unknown: '#6d6d6d'
        }
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

        tooltipRenderer: tooltips.rangeChart,
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
        labelField: 'group_def.label',
        title: 'Static Water Level (m)',
        showTitle: true,
        chartType: 'horizontalBar',

        tooltipRenderer: tooltips.rangeChart,
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
        labelField: 'group_def.label',
        title: 'Yield (l/sec)',
        showTitle: true,
        chartType: 'horizontalBar',

        tooltipRenderer: tooltips.rangeChart,
        isFilter: true,
        barsCnt: 5,
        sortKey: 'group_id'
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
