/*global barChartHorizontal pieChart*/

import WbMap from '../../map/';
import BeneficiariesChart from '../../charts/beneficiaries';
import SchemeTypeChart from '../../charts/schemeType';
import HorizontalBarChart from '../../charts/horizontalBarChart';
import PieChart from '../../charts/pieChart';

import Pagination from '../../pagination/';
import DashboardFilter from '../../filter/dashboard.filter';
import Api from '../../../api/api';
import Modals from '../../modal';
import TILELAYER_DEFINITIONS from "../../../config/map.layers";

import {createDashBoardMarker} from '../../map/mapUtils';
import {getChartBlockTemplate} from "../../templates/wb.templates";
import {createDomObjectFromTemplate} from "../../../templates.utils";

export default class DashboardController {

    constructor(opts) {
        // chart modules / class instances
        this.charts = {};

        // leaflet map wrapper module
        this.map = {};

        // filter handler class
        this.filter = {};

        let {chartConfigs, dashboarData} = opts;
        // modules / class instance configuration
        this.chartConfigs = chartConfigs;

        this.removeNullsInChartsArr = ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"];

        this.mapConfig = {
            init: true,
            tileLayerDef: TILELAYER_DEFINITIONS,
            mapOnMoveEndFn: _.debounce(this.filterDashboardData, 250),
            mapId: 'featureMapWrap',
            leafletConf: {
                zoom: 6,
                editable: true
            },
            activeLayerName: 'MapBox',
            markerRenderFn: createDashBoardMarker,
            mapSearch: {
                enabled: true,
                parentId: 'geo-search-wrap'
            }
        };

        // pagination
        this.pagination = {};

        // data used by all dashboard elements - map, charts
        this.dashboarData = dashboarData;

        // FILTER INSTANCE
        this.filter = this.initFilter(chartConfigs);


        // MAP MODULE , render feature markers, TODO fix naming
        this.map = WbMap.wbMap(this.mapConfig);

        this.refreshMapData();

        this.renderDashboardCharts(chartConfigs, this.dashboarData);
        this.initEvents(chartConfigs);
    }

    handlePaginationClick = (chartKey, page) => {

        let chartData = this.dashboarData[chartKey].slice(
            page.firstIndex,
            page.lastIndex
        );

        this.charts[chartKey].data(chartData);
    };

    /**
     * Init pagination for a chart (hasPagination is set to true)
     * append pagination dom block to parent id
     * add pagination click callback
     * add instance to his.pagination['chart_name']
     *
     *  {
     *     "parent": "tabiyaPagination", ili parent DomObj
     *     "itemsCnt": 0,
     *     "itemsPerPage": 7,
     *     "chartKey": "tabiya",
     *     "callback": () => {}
     *   }
     * @param opts
     */
    initPagination = (opts) => {
        const conf = Object.assign({}, opts);

        conf.pageOnChange = this.handlePaginationClick;

        this.pagination[conf.chartKey] = Pagination(conf);

        return this.pagination[conf.chartKey].getPage();
    };


    /**
     * Init Main Filter handler (isFilter set to true in chart configs)
     *
     * Filters are identified by filterKey (db column name) and are mapped through
     * filterId to charts and components
     *
     *   filterDataKeys - array of filter / data mapping
     *   filterId        - chart key, key used on client side
     *   filterKey      - db column name, key used on backend
     *   filterDataKeys - [{"filterId": "tabiya", "filterKey": "tabiya"},...]
     * returns filter instance
     */
    initFilter = (chartConfigs) => {
        const filterDataKeys = _.reduce(chartConfigs, function (acc, conf) {
            let {isFilter, chartKey, name} = conf;

            if (isFilter === true) {
                acc[acc.length] = {
                    filterId: chartKey,
                    filterKey: name
                };
            }
            return acc;

        }, []);

        return new DashboardFilter(filterDataKeys);
    };

// _filters = {coords: [], filters: {}}
    refreshMapData = () => {
        const data = {
            zoom: this.map.leafletMap().getZoom(),
            _filters: this.getChartFilterArg()
        };

        Api.axGetMapData({
            data: JSON.stringify(data)
        });
    };


    /**
     * Update Dashboard charts, ajax callback
     * Update only charts that are not used as filter currently
     *
     * Pagination charts:
     *   Active:
     *   - this.dashboardData should not be updated
     *   - pagination uses this.dashboardData for taking slices (todo add separate prop for pag data?)
     * @param data
     */
    updateDashboards = (data) => {
        let _chartData;

        let newDashboarData = JSON.parse(data.dashboard_chart_data);

        // HANDLE EMPTY DATA - CLEAN RANGE CHARTS TODO refactor - handle in db

        // handle nulls range charts, set no data if there are no entries per group (yes, no, unknown ...)
        this.removeNullsInChartsArr.forEach(function (chartKey) {
            if (_.every(newDashboarData[chartKey], {'cnt': null})) {
                newDashboarData[chartKey] = [];
            }
        });


        _.forEach(this.filter.getEmptyFilters(), ({filterId}) => {

            this.dashboarData[filterId] = (newDashboarData[filterId] || []).slice(0);

            // if chart has enabled pagination
            // get the pagination data indexes from new data
            // pass only paginated data to chart
            if (this.chartConfigs[filterId].hasPagination === true) {

                let {firstIndex, lastIndex} = this.pagination[filterId].setOptions({
                    itemsCnt: this.dashboarData[filterId].length,
                    currentPage: 1
                });

                _chartData = this.dashboarData[filterId].slice(firstIndex, lastIndex);
            } else {
                _chartData = this.dashboarData[filterId];
            }

            // update chart component data
            this.charts[filterId].data(_chartData);
        });

        // info chart data mapping, there are no filters, we use it as is
        this.dashboarData['datastats'] = newDashboarData.datastats;
        this.dashboarData['schemetype_stats'] = newDashboarData.schemetype_stats;

        this.charts.beneficiaries.data(this.dashboarData.datastats);
        this.charts.schemeType.data(this.dashboarData.schemetype_stats);


        // refresh markers
        this.refreshMapData();
    };
    /**
     * TODO ALL components should be rendered through this func
     * Main chart renderer
     *
     * For every chart configuration render chart and dependencies from chart conf
     * @param chartConfigs
     * @param chartData
     */
    renderDashboardCharts = (chartConfigs, chartData) => {

        const defaultClickHandler = (p) => {
            this.filterDashboardData(p);
        };

        let parent = document.getElementById('wb-charts');

        _.forEach(chartConfigs, (chartConf, chartKey) => {

            let chartHTML;
            // set default chart click handler if not set, filters dashboard data
            if (!chartConf.clickHandler) {
                chartConf.clickHandler = defaultClickHandler;
            }

            // add chart data to chart configurations
            chartConf.data = chartData[chartKey] || [];

            switch (chartConf.chartType) {

                // =====================================================
                // HORIZONTAL BAR CHART

                case 'horizontalBar':

                    //this.generateChartBlock(chartConf);

                    chartHTML = createDomObjectFromTemplate(
                        getChartBlockTemplate(chartConf)
                    );

                    // chartHTML = generateChartBlock(chartConf);

                    parent.appendChild(chartHTML);

                    if (chartConf.hasPagination === true) {

                        const page = this.initPagination({
                            parent: chartHTML,
                            itemsCnt: (chartData[chartKey] || []).length,
                            itemsPerPage: chartConf.paginationConf.itemsPerPage,
                            chartKey: chartKey
                        });

                        chartConf.data = chartConf.data.slice(0, page.lastIndex);
                    }

                    this.charts[chartKey] = HorizontalBarChart(chartConf);
                    this.charts[chartKey](chartConf.parentId);

                    return this.charts[chartKey];

                // =====================================================
                // PIE CHART

                case 'pie':
                    chartHTML = createDomObjectFromTemplate(
                        getChartBlockTemplate(chartConf)
                    );
                    // chartHTML = generateChartBlock(chartConf);

                    parent.appendChild(chartHTML);

                    this.charts[chartKey] = PieChart(chartConf).data(chartConf.data);
                    this.charts[chartKey](chartConf.parentId);

                    return this.charts[chartKey];

                // =====================================================
                // BENEFICIARIES INFO CHART

                case 'beneficiariesInfo':
                    this.charts[chartKey] = BeneficiariesChart(
                        document.getElementById(chartConf.parentId)
                    );
                    this.charts[chartKey].data(chartData.datastats);

                    return this.charts[chartKey];

                case 'schemeTypeInfo':
                    // setup chart
                    this.charts[chartKey] = SchemeTypeChart(
                        document.getElementById(chartConf.parentId)
                    );
                    this.charts[chartKey].data(chartData.schemetype_stats);

                    return this.charts[chartKey];
                default:
                    return false;
            }


        });
    };


    /**
     * Reset filters and filter component (charts) state
     * - filter state, clicked bars, clicked pie slices, clear buttons in bar charts
     * - map search field
     */
    resetAllDashboardFilters = () => {

        // toggle chart clear button (filters should be empty)
        _.forEach(this.chartConfigs, ({chartKey, chartType}) => {

            this.charts[chartKey].resetActive && this.charts[chartKey].resetActive();

            // if (chartType === 'horizontalBar') {
            //     this.charts[chartKey].toggleClearBtn();
            // }

        });

        // empty map search field selection
        this.map.clearSearchField();

        // clear all defined filters
        this.filter.resetFilters();
    };

    /**
     * Handles Dashboard filter state and returns dashboard api filter arguments
     *
     * Every bar and pie chart is a filter and can have one or more selections (1 or more bars or slices selected)
     * Called also on map moveend but does not set any filters
     *
     * A bar and pie chart can:
     *   - add selected bar to filter (first click - becomes orange)
     *   - remove selected bar from filter (second click - blue again)
     *   - remove all selected bars (only bar chart)
     *
     * The Reset all button will empty all selected filters
     *
     * can reset all filters
     *
     * can reset single filter identified by filter name (Woreda)
     *    {reset:true,  filterName: "Woreda"}
     *
     * can remove single filter value from filter (Ahferom from Woreda)
     *    {reset:false, isActive: false, filterName: "Woreda", filterValue: "Ahferom"}
     *
     * can add single filter value to filter (Hawzen to Woreda)
     *    {reset:false, isActive: true, filterName: "Woreda", filterValue: "Ahferom"}
     *
     * Returns prepared filter json used for api endpoints
     *
     * @param opts ({
     *     name,
     *     filterValue,
     *     reset,
     *     isActive,
     *     resetAll  - only set from clear all button
     * })
     * @returns {{filters: *|json, coord: *}}
     */
    handleChartFilterFiltering = (opts) => {
        const {name, filterValue, reset, isActive, resetAll} = opts; // is bar chart bar active

        if (resetAll === true) {
            // reset all filters
            this.resetAllDashboardFilters();
        } else {

            if (name) {
                // bar or pie chart have bars/slices selected, remove them
                if (reset === true && isActive) {
                    this.filter.resetFilter(name);
                } else {
                    // toggle bar or slice state
                    if (isActive === true) {
                        this.filter.removeFromFilter(name, filterValue);
                    } else {
                        this.filter.addToFilter(name, filterValue);
                    }

                }

            }


        }


        return this.getChartFilterArg();
    };

    /**
     * Build Dashboard Filter Api Arguments from chart filters and map coordinates
     *
     * activeFilters - prepared active filters
     *     {"tabiya":["May-Wedi-Amberay","Mhquan"],"woreda":["Merebleke"]}
     * coord         - map bounds
     *     [31.333007812500004, 20.59165212082918, 45.24169921875001, 7.841615185204699]
     * @returns {{filters: *, coord: *}}
     */
    getChartFilterArg = () => {

        const activeFilters = _.reduce(this.filter.getActiveFilters(), function (acc, val) {
            acc[val.filterKey] = val.state;
            return acc;
        }, {});

        return {
            //zoom: this.map.leafletMap().getZoom(),
            filters: activeFilters,
            coord: this.map.getMapBounds()
        };
    };

    /**
     * Init dashboards events:
     * - charts on resize for all charts
     * - reset all btn click
     */
    initEvents = (chartConfigs) => {
        // HANDLE ON RESIZE

        const chartResize = _.debounce((e) => {
            Object.keys(chartConfigs).forEach((name) => {
                this.charts[name].resize && this.charts[name].resize();
            });
            Modals.LoadingModal.hide();
        }, 150);

        window.addEventListener('resize', chartResize);

        // HANDLE ON RESET ALL BUTTON CLICK

        document.getElementById('wb-reset-all-filter').addEventListener('click', (e) => {
            this.filterDashboardData({
                reset: true,
                resetAll: true
            });
        });
    };

    /**
     * Dashboard Filter Api Call ("Main" function)
     * gets prepared filters and calls endpoint
     * options - flags / opts for update
     * @param props
     */
    filterDashboardData = (props, options) => {
        const preparedFilters = this.handleChartFilterFiltering(props);

        return Api.axFilterDashboardData({
            data: JSON.stringify(preparedFilters)
        }, options);

    };

}
