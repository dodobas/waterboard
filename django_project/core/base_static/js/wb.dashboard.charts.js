
function DashboardController(opts) {
    // chart modules / class instances
    this.charts = {};

    // leaflet map wrapper module
    this.map = {};

    // filter handler class
    this.filter = {};

    // modules / class instance configuration
    this.chartConfigs = opts.chartConfigs;

    this.mapConfig = {
        init: true,
        tileLayerDef: TILELAYER_DEFINITIONS,
        mapOnMoveEndFn: _.debounce(mapOnMoveEndHandler, 250),
        mapId: 'featureMapWrap',
        leafletConf: {
            zoom: 6,
            editable: true
        },
        activeLayerName: 'MapBox',
        markerRenderFn: WBLib.WbMap.createDashBoardMarker,
        mapSearch: {
            enabled: true,
            parentId: 'geo-search-wrap'
        }
    };

    // pagination
    this.pagination = {};

    // data used by all dashboard elements - map, charts
    this.dashboarData = opts.dashboarData;

    // Init functions
    this.filter = this.initFilter(opts.chartConfigs);


    // init map module, render feature markers
    this.map = WBLib.WbMap.wbMap(this.mapConfig);

    this.refreshMapData();

    this.renderDashboardCharts(opts.chartConfigs, this.dashboarData);
    this.initEvents(opts.chartConfigs);

}

DashboardController.prototype = {
    /**
     * Init pagination for a chart (hasPagination is set to true)
     * append pagination dom block to parent id
     * add pagination click callback
     * add instance to his.pagination['chart_name']
     *
     *  {
     *     "parentId": "tabiyaPagination",
     *     "itemsCnt": 0,
     *     "itemsPerPage": 7,
     *     "chartKey": "tabiya"
     *   }
     * @param opts
     */
    initPagination: function (opts) {
        var self = this;

        var conf = _.assign({}, opts);

        conf.callback = function (chartKey, page) {

            var chartData = self.dashboarData[chartKey].slice(
                page.firstIndex,
                page.lastIndex
            );

            self.charts[chartKey].data(chartData);
        };

        this.pagination[conf.chartKey] = WBLib.Pagination(conf);

        this.pagination[conf.chartKey].renderDom();

        return this.pagination[conf.chartKey].getPage();
    },


    /**
     * Init Main Filter handler (isFilter set to true in chart configs)
     *
     * Filters are identified by filterKey (db column name) and are mapped through
     * dataKey to charts and components
     *
     *   filterDataKeys - array of filter / data mapping
     *   dataKey        - chart key, key used on client side
     *   filterKey      - db column name, key used on backend
     *   filterDataKeys - [{"dataKey": "tabiya", "filterKey": "tabiya"},...]
     * returns filter instance
     */
    initFilter: function (chartConfigs) {
        var filterDataKeys = _.reduce(chartConfigs, function (acc, conf) {

            if (conf.isFilter === true) {
                acc[acc.length] = {
                    dataKey: conf.chartKey,
                    filterKey: conf.name
                };
            }
            return acc;

        }, []);

        return new WBLib.DashboardFilter(filterDataKeys);
    },

// _filters = {coords: [], filters: {}}
    refreshMapData: function () {
        var data = {
            zoom: this.map.leafletMap().getZoom(),
            _filters: this.getChartFilterArg()
        };

        WBLib.api.axGetMapData({
            data: JSON.stringify(data)
        });
    },

    /**
     * Update Dashboard charts, ajax callback
     * Update only charts that are not used as filter currently
     *
     * Pagination Charts:
     *   Active:
     *   - this.dashboardData should not be updated
     *   - pagination uses this.dashboardData for taking slices (todo add separate prop for pag data?)
     * @param data
     */
    updateDashboards: function (data, options) {
        var self = this;

        var newDashboarData = JSON.parse(data.dashboard_chart_data);

        // HANDLE EMPTY DATA - CLEAN RANGE CHARTS TODO refactor - handle in db

        // handle nulls range charts, set no data if there are no entries per group (yes, no, unknown ...)
        ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"].forEach(function (chartKey) {
            if (_.every(newDashboarData[chartKey], {'cnt': null})) {
                newDashboarData[chartKey] = [];
            }
        });

        var prepared;

        // TODO handle differently
        // remove tableSearch from chartFilters, tableSearch is bound to data table not charts
        var chartFilters = this.filter.getEmptyFilters();

        _.forEach(chartFilters, function ({dataKey}) {

            self.dashboarData[dataKey] = newDashboarData[dataKey] || [];

            // if chart has enable pagination
            // get the pagination data indexes from new data
            // pass only paginated data to chart
            if (self.chartConfigs[dataKey].hasPagination === true) {

                let {firstIndex, lastIndex} = self.pagination[dataKey].setOptions({
                    itemsCnt: self.dashboarData[dataKey].length,
                    currentPage: 1
                });

                prepared = self.dashboarData[dataKey].slice(firstIndex, lastIndex);
            } else {
                prepared = newDashboarData[dataKey] || [];
            }

            // update chart component data
            self.charts[dataKey].data(prepared);
        });

        // info chart data mapping, there are no filters, we use it as is
        this.dashboarData['datastats'] = newDashboarData.datastats;
        this.dashboarData['schemetype_stats'] = newDashboarData.schemetype_stats;

        this.charts.beneficiaries.data(this.dashboarData.datastats);
        this.charts.schemeType.data(this.dashboarData.schemetype_stats);


        // refresh markers
        this.refreshMapData();
    },

    /**
     * TODO ALL components should be rendered through this func
     * Main chart renderer
     *
     * For every chart configuration render chart and dependencies from chart conf
     * @param chartConfigs
     * @param chartData
     */
    renderDashboardCharts: function (chartConfigs, chartData) {
        var self = this;

        var defaultClickHandler = function (p) {
            self.filterDashboardData(p);
        };

        _.forEach(chartConfigs, function (chartConf, chartKey) {

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

                    if (chartConf.hasPagination === true) {

                        var page = self.initPagination({
                            parentId: chartConf.paginationConf.parentId,
                            itemsCnt: (chartData[chartKey] || []).length,
                            itemsPerPage: chartConf.paginationConf.itemsPerPage,
                            chartKey: chartKey
                        });

                        chartConf.data = chartConf.data.slice(0, page.lastIndex);
                    }

                    self.charts[chartKey] = barChartHorizontal(chartConf);
                    self.charts[chartKey](chartConf.parentId);

                    return self.charts[chartKey];

                // =====================================================
                // PIE CHART

                case 'pie':

                    self.charts[chartKey] = pieChart(chartConf).data(chartConf.data);
                    self.charts[chartKey](chartConf.parentId);

                    return self.charts[chartKey];

                // =====================================================
                // BENEFICIARIES INFO CHART

                case 'beneficiariesInfo':
                    self.charts[chartKey] = WBLib.BeneficiariesChart(
                        document.getElementById(chartConf.parentId)
                    );
                    self.charts[chartKey].data(chartData.datastats);

                    return self.charts[chartKey];
                case 'schemeTypeInfo':
                    // setup chart
                    self.charts[chartKey] = WBLib.SchemeTypeChart(
                        document.getElementById(chartConf.parentId)
                    );
                    self.charts[chartKey].data(chartData.schemetype_stats);

                    return self.charts[chartKey];
                default:
                    return false;
            }


        });
    },


    /**
     * Reset filters and filter component state (filter state,
     * clicked bars, clear button)
     */
    resetAllDashboardFilters: function () {
        var self = this;

        // toggle chart clear button (filters should be empty)
        _.forEach(this.chartConfigs, function (conf) {
            self.charts[conf.chartKey].resetActive && self.charts[conf.chartKey].resetActive();

            if (conf.chartType === 'horizontalBar') {
                self.charts[conf.chartKey].toggleClearBtn();
            }

        });

        // empty map search field selection
        this.map.clearSearchField();

        // clear all defined filters
        this.filter.resetFilters();
    },

    /**
     * Handles Dashboard filter state and returns dashboard api filter arguments
     *
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
     * @param opts
     * @returns {{filters: *|json, coord: *}}
     */
    handleChartFilterFiltering: function (opts) {
        const {name, filterValue, reset, isActive} = opts; // is bar chart bar active

        if (reset === true) {
            if (isActive && name) {
                this.filter.resetFilter(name);
            } else {
                this.resetAllDashboardFilters();
            }
        } else {
            // handles bar chart bar click
            if (isActive === true) {
                this.filter.removeFromFilter(name, filterValue);
            } else {
                this.filter.addToFilter(name, filterValue);
            }

        }

        return this.getChartFilterArg();
    },

    /**
     * Build Dashboard Filter Api Arguments from chart filters and map coordinates
     *
     * activeFilters - prepared active filters
     *     {"tabiya":["May-Wedi-Amberay","Mhquan"],"woreda":["Merebleke"]}
     * coord         - map bounds
     *     [31.333007812500004, 20.59165212082918, 45.24169921875001, 7.841615185204699]
     * @returns {{filters: *, coord: *}}
     */
    getChartFilterArg: function () {

        var activeFilters = _.reduce(this.filter.getActiveFilters(), function (acc, val) {
            acc[val.filterKey] = val.state;
            return acc;
        }, {});

        return {
            //zoom: this.map.leafletMap().getZoom(),
            filters: activeFilters,
            coord: this.map.getMapBounds()
        };
    },

    /**
     * Init dashboards events:
     * - charts on resize for all charts
     * - reset all btn click
     */
    initEvents: function (chartConfigs) {
        var self = this;


        // HANDLE ON RESIZE

        var chartResize = _.debounce(function (e) {
            Object.keys(chartConfigs).forEach(function (name) {
                self.charts[name].resize && self.charts[name].resize();
            });
            WBLib.Modals.LoadingModal.hide();
        }, 150);

        window.addEventListener('resize', chartResize);

        // HANDLE ON RESET ALL

        var resetChartsCb = function (e) {
            self.filterDashboardData({
                reset: true
            });
        };
        document.getElementById('wb-reset-all-filter').addEventListener('click', resetChartsCb);
    },

    /**
     * Dashboard Filter Api Call ("Main" function)
     * Use prepared filters as endpoint argument
     * options - flags / opts for update
     * @param props
     */
    filterDashboardData: function (props, options) {
        var preparedFilters = this.handleChartFilterFiltering(props);

        return WBLib.api.axFilterDashboardData({
            data: JSON.stringify(preparedFilters)
        }, options);

    }

};


function mapOnMoveEndHandler(e) {
    WB.controller.filterDashboardData({
        reset: false
    });
}
