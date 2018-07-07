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
    this.initFilter();
    this.renderMap();
    this.refreshMapData();
    this.renderTable();
    this.renderDashboardCharts(Object.keys(this.chartConfigs), this.dashboarData);
    this.initEvents();

}

DashboardController.prototype = {
    /**
     * init pagination for a chart
     * append pagination dom block to parent id
     * add pagination click callback
     * @param opts
     */
    initPagination: function (opts) {
        var self = this;
        var chartKey = opts.chartKey;

        this.pagination[chartKey] = pagination({
            parentId: opts.parentId,
            itemsCnt: opts.itemsCnt,
            itemsPerPage: opts.itemsPerPage,
            chartKey: opts.chartKey,
            callback: function (chartKey, page) {
                var chartData = self.dashboarData[chartKey].slice(page.firstIndex, page.lastIndex);

                self.charts[chartKey].data(chartData);
            }
        });

        this.pagination[chartKey].renderDom();

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

        var options = {
            dataTable: {
                // "dom": 'l<"wb-export-toolbar">frtip',
                // scrollX: true,
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
                        var preparedFilters =  WB.controller.getChartFilterArg ? WB.controller.getChartFilterArg() : {};
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
     */
    initFilter: function () {
        var filterKeys = _.map(_.filter(this.chartConfigs, {isFilter: true}), 'name');

        this.filter = new WBLib.DashboardFilter({
            filterKeys: filterKeys
        });
    },

    // init map module, render feature markers
    renderMap: function () {
        // configure
        this.map = wbMap(this.mapConfig)
            .layerConf(this.mapConfig.tileLayerDef)
            .leafletConf({
                zoom: 6,
                editable: true
            }, 'MapBox')
            .markerRenderer(createDashBoardMarker)
            .initMapSearch({
                parentId: 'geo-search-wrap'
            });

        // render
        this.map(this.mapConfig.mapId);

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
     * Helper Function - execute common chart methods (update, resize...)
     * @param chartDataKeys
     */
    execChartMethod: function (chartName, methodName, methodArg) {
        var chartInstance = this.charts[chartName];

        if (chartInstance && chartInstance[methodName] instanceof Function) {
            if (methodArg) {
                chartInstance[methodName](methodArg);
            } else {
                chartInstance[methodName]();
            }

        } else {
            console.log('Chart - ' + chartName + ' has no ' + methodName + ' defined or does not exist.');
        }
    },

    /**
     * For every chart specified by chartNames execute an chart method specified by methodName
     *
     * Example calls:
     *  chartNames = ["woreda", tabyia]
     *  execForAllCharts(chartNames, 'resetActive')
     *  execForAllCharts(chartNames, 'resize')
     *  execForAllCharts(chartNames, 'updateChart', methodArg)
     * using methodArg as argument
     * @param chartNames
     * @param methodName
     * @param methodArg
     */
    execForAllCharts: function (chartNames, methodName, methodArg) {
        var self = this;
        chartNames.forEach(function (chartName) {
            self.execChartMethod(chartName, methodName, methodArg && methodArg[chartName]);
        });
    },

    /**
     * Get chart keys that are not used as filter currently (no values in filter)
     * Used on chart updates
     * @returns {Array}
     */
    getNonFilteredChartKeys: function () {

        var activeFilterKeys = Object.keys(this.filter.getActiveFilters());

        return _.map(_.filter(this.chartConfigs, function (i) {
            return activeFilterKeys.indexOf(i.name) === -1;
        }), 'chartKey');
    },

    /**
     * Update chart pagination (charts that have hasPagination===true in configs)
     * @param chartData
     */
    updatePaginationDashboardCharts: function (chartData) {
        var self = this;

        var notFilteredKeys = this.getNonFilteredChartKeys();

        _.forEach(this.chartPaginationKeys, function (name) {
            if (notFilteredKeys.indexOf(name) > -1) {

            self.pagination[name].setOptions(
                (chartData[name] || []).length, null, 1
            );
           var page = self.pagination[name].getPage();

            chartData[name] = chartData[name].slice(page.firstIndex, page.lastIndex);

            }
        });

        return chartData;
    },

    /**
     * Update Dashboard charts
     * Filtered charts are not updated
     * @param data
     */
    updateDashboards: function (data) {
        var self = this;
        var newChartData = JSON.parse(data.dashboard_chart_data);

        this.oldDashboarData = _.assign({}, this.dashboarData);

        // save old data for pagination charts
        var notFilteredKeys = this.getNonFilteredChartKeys();


        // TODO refactor -> in planning

        // merge old / new pagination chart data
        _.forEach(this.chartPaginationKeys, function (name) {
            if (notFilteredKeys.indexOf(name) === -1) {
                // dont update
                var obj = {};
                obj[name] = self.oldDashboarData[name];
                newChartData =  _.assign({}, newChartData, obj);
            }
        });

        this.dashboarData =_.assign({}, this.dashboarData, newChartData);

        this.updatePaginationDashboardCharts(newChartData);

        // TODO handle better
        // handle nulls, set no data if there are no entries per group (yes, no, unknown ...)
        ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"].forEach(function (chartKey) {
            if (_.every(newChartData[chartKey], {'cnt': null})) {
                newChartData[chartKey] = [];
            }
        });

        // set new data for all non active charts
        this.execForAllCharts(notFilteredKeys, 'data', (newChartData || []));

        // update beneficiaries chart
        this.charts.beneficiaries.data(this.dashboarData.tabiya);

        // reload table data
        this.table.reportTable.ajax.reload();

        this.refreshMapData();
    },

    renderDashboardCharts: function (chartKeys, chartData) {
        var self = this;
        var chartConf;

        this.chartPaginationKeys = _.filter(this.chartConfigs, {hasPagination: true}).map(function (pag) {
            return pag.chartKey;
        });

        chartKeys.forEach(function (chartKey) {

            chartConf = self.chartConfigs[chartKey];

            if (chartConf) {

                chartConf.data = chartData[chartKey] || [];

                switch (chartConf.chartType) {

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

                        // setup horizontal bar chart config
                        var prepared = barChartHorizontal(chartConf)
                            .title(chartConf.title)
                            .data(chartConf.data);

                        // init horizontal bar chart
                        prepared(chartConf.parentId);

                        self.charts[chartKey] = prepared;

                        return self.charts[chartKey];
                    case 'pie':


                        // setup pie chart
                        var pie = pieChart(chartConf)
                            .title(chartConf.title)
                            .data(chartConf.data);

                        // init  pie chart
                        pie(chartConf.parentId);

                        self.charts[chartKey] = pie;


                        return self.charts[chartKey];

                    case 'beneficiariesInfo':
                        // setup chart
                        self.charts[chartKey] = beneficiariesChart().data(chartData.tabiya);

                        // init chart
                        self.charts[chartKey](document.getElementById(chartConf.parentId));

                        return self.charts[chartKey];
                    default:
                        return false;
                }
            } else {
                console.log('No Chart Configuration found - ' + chartKey);
            }


        });
    },

    /**
     * Handle Dashboard filter
     * @param opts
     * @returns {{filters: *|json, coord: *}}
     */
    handleChartFilterFiltering: function (opts) {
        var filterName = opts.name;
        var filterValue = opts.filterValue;
        var reset = opts.reset;
        var resetSingle = opts.resetSingle;
        var isActive = opts.isActive;

        if (reset === true) {

            // execute reset for provided chart
            if (resetSingle) {
                this.filter.resetFilter(filterName);
            } else {

                // get all horizontal bar chart keys
                var horizontalBarKeys = _.map(_.filter(this.chartConfigs, {
                    chartType: 'horizontalBar'
                }), 'chartKey');

                // execute resetActive for all horizontal bar charts
                this.execForAllCharts(horizontalBarKeys, 'resetActive');

                // toggle the clear button (filters should be empty, should not be visible)
                this.execForAllCharts(horizontalBarKeys, 'toggleClearBtn');

                // reset pie chart (functioning)
                this.charts.functioning.resetActive();

                // empty map search field selection
                this.map.clearSearchField();

                // clear all defined filters
                this.filter.resetFilters();
            }

        } else {
            isActive === true ? this.filter.removeFromFilter(filterName, filterValue) : this.filter.addToFilter(filterName, filterValue);
        }

        return this.getChartFilterArg();
    },

    getChartFilterArg: function () {
        return {
            filters: this.filter.getActiveFilters(),
            coord: this.map.getMapBounds()
        };
    },

    /**
     * Init dashboards events:
     * - charts on resize for all charts
     * - reset all btn click
     */
    initEvents: function () {
        var self = this;

        var chartResize = _.debounce(function (e) {
            self.execForAllCharts(Object.keys(self.chartConfigs), 'resize');
            WB.loadingModal.hide();
        }, 150);

        window.addEventListener('resize', chartResize);

        document.getElementById('wb-reset-all-filter').addEventListener('click', function (e) {
            DashboardController.handleChartEvents({
                origEvent: e,
                reset: true
            });
        });
    }

};

/**
 * General Dashboard event / filter handler (charts on click, map on move end)
 *
 * Fetch new data based on map coordinates and active filters
 *
 */
DashboardController.handleChartEvents = function (props) {
console.log(props);
    var preparedFilters = WB.controller.handleChartFilterFiltering(props);

    return WB.api.axFilterDashboardData({
        data: JSON.stringify(preparedFilters)
    });

};


// CHART TOOLTIP RENDER FUNCTIONS

function tabiyaTooltip(d) {
    return '<div class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '<span>Beneficiaries: ' + d.beneficiaries + '</span>' +
        '</div>';
}

function fencingTooltipRenderer(d) {
    return '<div class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '</div>';
}

function fundedByTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '</div>';
}

function waterCommiteeTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '</div>';
}

// tooltips for amount of deposited, static water level and yield
function rangeChartTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '<span>Min: ' + d.min + '</span>' +
        '<span>Max: ' + d.max + '</span>' +
        '</div>'
}

function mapOnMoveEndHandler(e) {
    DashboardController.handleChartEvents({
        origEvent: e,
        reset: false
    });
}
