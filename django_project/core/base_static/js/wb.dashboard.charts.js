function DashboardController(opts) {
    // chart modules / class instances
    this.charts = {};

    // leaflet map wrapper module
    this.map = {};

    // jquery datatable wrapper class
    this.table = {};

    // filter handler class
    this.filter = {};

    // modules / class instance configuration
    this.chartConfigs = opts.chartConfigs;
    this.tableConfig = opts.tableConfig;

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
    this.initFilter(opts.chartConfigs);


    // init map module, render feature markers
    this.map = WBLib.WbMap.wbMap(this.mapConfig);

    this.refreshMapData();
    this.renderTable();
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
     * Init dashboard data table
     * is searchable - server side
     * on
     *
     */
    renderTable: function () {

        var TABLE_REPORT_COLUMNS = [{
            data: '_last_update',
            title: 'Last Update',
            searchable: false,
            render: WBLib.utils.timestampColumnRenderer,
            orderable: true
        }, {
            data: '_webuser',
            title: 'User',
            searchable: false,
            orderable: true
        }, {
            data: 'zone',
            title: 'Zone',
            searchable: true,
            orderable: true
        }, {
            data: 'woreda',
            title: 'Woreda',
            searchable: true,
            orderable: true
        }, {
            data: 'tabiya',
            title: 'Tabiya',
            searchable: true,
            orderable: true
        }, {
            data: 'kushet',
            title: 'Kushet',
            searchable: true,
            orderable: true
        }, {
            data: 'name',
            title: 'Name',
            searchable: true,
            orderable: true
        }, {
            data: 'unique_id',
            title: 'Unique ID',
            searchable: true,
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
        }];

        var self = this;
        var options = {
            dataTable: {
                fixedHeader: true,
                columns: TABLE_REPORT_COLUMNS,
                order: [[0, 'desc']],
                lengthMenu: TABLE_ROWS_PER_PAGE,
                rowClickCb: WBLib.utils.tableRowClickHandlerFn,
                serverSide: true,
                // this is only throttling and not debouncing, for debouncing we need to fully control search input events
                searchDelay: 400,
                ajax: {
                    url: '/dashboard-tabledata/',
                    type: 'POST',
                    data: function (filters) {
                        var preparedFilters = self.getChartFilterArg();

                        filters['_filters'] = JSON.stringify(preparedFilters);

                        return filters;
                    }
                }
            }
        };

        this.table = WB.tableReports.init('reports-table', options);
    },

    /**
     * Init Main Filter handler
     * Enabled chart filters have isFilter set to true in chart configs
     *
     * Filters are identified by filterKey (db column name) and are mapped through
     * dataKey to charts and components
     *
     *   filterDataKeys - array of filter / data mapping
     *   dataKey        - chart key, key used on client side
     *   filterKey      - db column name, key used on backend
     *   filterDataKeys - [{"dataKey": "tabiya", "filterKey": "tabiya"},...]
     * @param chartConfigs
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

        this.filter = new WBLib.DashboardFilter(filterDataKeys);
    },


    refreshMapData: function () {
        var self = this;

        var preparedFilters = this.getChartFilterArg();

        WBLib.api.axGetMapData({
            data: JSON.stringify({
                zoom: self.map.leafletMap().getZoom(),
                _filters: preparedFilters
            })
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
    updateDashboards: function (data) {
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


        _.forEach(this.filter.getEmptyFilters(), function ({dataKey}) {

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

        // update beneficiaries chart
        this.charts.beneficiaries.data(this.dashboarData.tabiya);

        // reload table data
        this.table.reportTable.ajax.reload();

        // refresh markers
        this.refreshMapData();
    },

    /**
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

            // add data to configurations
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
                    self.charts[chartKey].data(chartData.tabiya);

                    return self.charts[chartKey];

                default:
                    return false;
            }

        });
    },
    /*
    *
    * {
                        data: d,
                        name: _NAME,
                        filterValue: d[filterValueField],
                        chartType: _CHART_TYPE,
                        chartId: _ID,
                        isActive: isActive > -1,
                        reset: reset === true
                    }
    * */

    resetAllDashboardFilters: function () {
        var self = this;

        // toggle clear button (filters should be empty, should not be visible)
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
            WB.loadingModal.hide();
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
     * Dashboard Filter Api Call
     * Use prepared filters as endpoint argument
     *
     * @param props
     */
    filterDashboardData: function (props) {
        var preparedFilters = this.handleChartFilterFiltering(props);

        return WBLib.api.axFilterDashboardData({
            data: JSON.stringify(preparedFilters)
        });

    }

};


function mapOnMoveEndHandler(e) {
    WB.controller.filterDashboardData({
        reset: false
    });
}
