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
    this.mapConfig = opts.mapConfig;

    // pagination
    this.itemsPerPage = 7;
    this.pagination = {};

    // data used by all dashboard elements - map, charts
    this.dashboarData = opts.dashboarData;

    // Init functions
    this.initFilter(opts.chartConfigs);
    this.renderMap();
    this.refreshMapData();
    this.renderTable();
    this.renderDashboardCharts(opts.chartConfigs, this.dashboarData);
    this.initEvents(opts.chartConfigs);

}

DashboardController.prototype = {
    /**
     * init pagination for a chart
     * append pagination dom block to parent id
     * add pagination click callback
     *
     * {
          "parentId": "tabiyaPagination",
          "itemsCnt": 0,
          "itemsPerPage": 7,
          "chartKey": "tabiya"
        }
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

        this.pagination[conf.chartKey] = pagination(conf);

        this.pagination[conf.chartKey].renderDom();

    },
    // init and set data table
    renderTable: function () {

        var TABLE_REPORT_COLUMNS = [{
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
                rowClickCb: tableRowClickHandlerFn,
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
     * Init and set filter class
     *
     * Enabled chart filters have isFilter set to true in chart configs
     * [
     {
       "dataKey": "tabiya",
       "filterKey": "tabiya"
     },
     {
       "dataKey": "woreda",
       "filterKey": "woreda"
     }
     */
    initFilter: function (chartConfigs) {
        // set db data key identifier
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

    // init map module, render feature markers
    renderMap: function () {
        // configure
        this.map = wbMap(this.mapConfig)
            .leafletConf({
                zoom: 6,
                editable: true
            }, 'MapBox')
            .markerRenderer(createDashBoardMarker)
            .initMapSearch({
                parentId: 'geo-search-wrap'
            });

        // render
        this.map();

        // set map move end event
        this.map.mapOnMoveEnd(mapOnMoveEndHandler);
    },

    refreshMapData: function () {
        var self = this;

        var preparedFilters = this.getChartFilterArg();

        WB.api.axGetMapData({
            data: {
                zoom: self.map.leafletMap().getZoom(),
                _filters: JSON.stringify(preparedFilters)
            }
        });
    },

    /**
     * Update Dashboard charts, ajax callback
     * Filtered charts are not updated
     * @param data
     */
    updateDashboards: function (data) {
        var self = this;

        var newDashboarData = JSON.parse(data.dashboard_chart_data);

        // TODO refactor - handle in db
        // handle nulls range charts, set no data if there are no entries per group (yes, no, unknown ...)
        ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"].forEach(function (chartKey) {
            if (_.every(newDashboarData[chartKey], {'cnt': null})) {
                newDashboarData[chartKey] = [];
            }
        });

        // get all inactive filters(chart keys)
        var prepared, name;

        _.forEach(this.filter.getEmptyFilters(), function (filter) {
            name = filter.dataKey;

            self.dashboarData[name] = newDashboarData[name] || [];

            if (self.chartConfigs[name].hasPagination === true) {

                self.pagination[name].setOptions(
                    self.dashboarData[name].length, null, 1
                );
                var page = self.pagination[name].getPage();

                prepared = self.dashboarData[name].slice(
                    page.firstIndex,
                    page.lastIndex
                );
            } else {
                prepared = newDashboarData[name] || [];
            }

            // update chart component data
            self.charts[name].data(prepared);
        });

        // update beneficiaries chart
        this.charts.beneficiaries.data(this.dashboarData.tabiya);

        // reload table data
        this.table.reportTable.ajax.reload();

        this.refreshMapData();
    },

    /**
     * For every chart configuration render chart and dependencies from chart conf
     * @param chartConfigs
     * @param chartData
     */
    renderDashboardCharts: function (chartConfigs, chartData) {
        var self = this;

        var chartConf;

        var defaultClickHandler = function (p) {
            self.filterDashboardData(p);
        };


        Object.keys(chartConfigs).forEach(function (chartKey) {

            chartConf = chartConfigs[chartKey];

            // set default chart click handler if not set, filters dashboard data
            if (!chartConf.clickHandler) {
                chartConf.clickHandler = defaultClickHandler;
            }

            if (chartConf) {

                // add data to configurations
                chartConf.data = chartData[chartKey] || [];

                switch (chartConf.chartType) {

                    // HORIZONTAL BAR CHART

                    case 'horizontalBar':

                        if (chartConf.hasPagination === true) {

                            self.initPagination({
                                parentId: chartConf.paginationConf.parentId,
                                itemsCnt: (chartData[chartKey] || []).length,
                                itemsPerPage: chartConf.paginationConf.itemsPerPage,
                                chartKey: chartKey
                            });

                            var page = self.pagination[chartKey].getPage();

                            chartConf.data = chartConf.data.slice(0, page.lastIndex);
                        }

                        // configure horizontal bar chart
                        self.charts[chartKey] = barChartHorizontal(chartConf);

                        // init horizontal bar chart instance
                        return self.charts[chartKey](chartConf.parentId);

                    // PIE CHART

                    case 'pie':

                        // configure pie chart
                        self.charts[chartKey] = pieChart(chartConf)
                            .data(chartConf.data);

                        // init pie chart
                        return  self.charts[chartKey](chartConf.parentId);

                    // BENEFICIARIES INFO CHART

                    case 'beneficiariesInfo':
                        // setup chart
                        self.charts[chartKey] = beneficiariesChart().data(chartData.tabiya);

                        // init chart
                        return self.charts[chartKey](document.getElementById(chartConf.parentId));

                    default:
                        return false;
                }
            } else {
                console.log('No Chart Configuration found - ' + chartKey);
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
                        reset: reset === true,
                        resetSingle: resetSingle === true
                    }
    * */

    resetAllDashboardFilters: function () {
        var self = this;

        var chart;
        // toggle the clear button (filters should be empty, should not be visible)
        _.forEach(this.chartConfigs, function (conf) {
            chart = self.charts[conf.chartKey];

            if (conf.chartType === 'horizontalBar') {
                chart.resetActive();
                chart.toggleClearBtn();
            } else if (conf.chartType === 'functioning') {
                 chart.resetActive();
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
     *    {reset:true, resetSingle: true, filterName: "Woreda"}
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
        var filterName = opts.name;
        var filterValue = opts.filterValue;
        var reset = opts.reset;
        var resetSingle = opts.resetSingle;
        var isActive = opts.isActive; // is bar chart bar active

        console.log(JSON.stringify(opts), opts);
        if (reset === true) {
            if (resetSingle && filterName) {
                this.filter.resetFilter(filterName);
            } else {
                this.resetAllDashboardFilters();
            }
        } else {
            // handles bar chart bar click
            isActive === true ?
                this.filter.removeFromFilter(filterName, filterValue) :
                this.filter.addToFilter(filterName, filterValue);
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

        console.log('activeFilters', activeFilters);
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

        return WB.api.axFilterDashboardData({
            data: JSON.stringify(preparedFilters)
        });

    }

};


function mapOnMoveEndHandler(e) {
    WB.controller.filterDashboardData({
        reset: false
    });
}
