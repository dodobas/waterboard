function _sortData(data, reverse, sortKey) {
    var sorted = data.slice(0).sort(function (a, b) {
        return a[sortKey] - b[sortKey];
    });

    if (reverse === true) {
        return sorted.reverse();
    }
    return sorted;
}

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
    this.tableConfig =  opts.tableConfig;
    this.mapConfig =  opts.mapConfig;

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
    handlePagination: function (chartKey, page) {
        var chartData = this.dashboarData[chartKey].slice(page.firstIndex, page.lastIndex);

        this.charts[chartKey].data(chartData);
    },

    /**
     * init pagination for a chart
     * append pagination dom block to parent id
     * @param opts
     */
    initPagination: function (opts) {
        var self = this;
        var chartKey = opts.chartKey;

         this.pagination[chartKey] = pagination({
            parentId: opts.chart.paginationConf.parentId,
            itemsCnt: opts.chart.data.length,
            itemsPerPage: opts.itemsPerPage,
            chartKey:  opts.chartKey,
            callback:  function (chartKey, page) {
                self.handlePagination(chartKey, page);
            }
        });

         this.pagination[chartKey].renderDom();

    },
    // init and set data table
    renderTable: function () {

        this.tableConfig.dataTable.data = this.dashboarData.tableData;

        this.table = WB.tableReports.init('reports-table', {
            dataTable: this.tableConfig.dataTable
        });
    },

    /**
     * Init and set filter class
     *
     * Enabled chart filters have isFilter set to true in chart configs
     */
    initFilter: function () {
        var filterKeys = _.map(_.filter(this.chartConfigs, {isFilter: true}), 'name');

        this.filter = new DashboardFilter({
            multiSelect: true,
            filterKeys: filterKeys
        })
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

        axGetMapData({
            data: {
                zoom: self.map.leafletMap().getZoom(),
                _filters: JSON.stringify(preparedFilters)
            },
            successCb: function (data) {
                self.map
                    .markerData(data)
                    .handleMarkerLayer(true, true)
                    .renderMarkers({
                        iconIdentifierKey: 'functioning'
                    });
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


    // execForAllCharts(chartNames, 'resetActive')
    // execForAllCharts(chartNames, 'resize')
    // execForAllCharts(chartNames, 'updateChart', methodArg)
    execForAllCharts: function (chartNames, methodName, methodArg) {
        var self = this;
        chartNames.forEach(function (chartName) {
            self.execChartMethod(chartName, methodName, methodArg && methodArg[chartName]);
        });
    },

    /**
     * Get chart keys that are not used as filter currently (no values in filter)
     * omit active filter keys
     * @returns {Array}
     */
    getNonFilteredChartKeys: function () {

        const activeFilterKeys = this.filter.getCleanFilterKeys();

        return  _.map(_.filter(this.chartConfigs, function (i) {
            return activeFilterKeys.indexOf(i.name) === -1;
        }), 'chartKey');
    },

    updatePagination: function (chartKey, chartData) {
        if (!chartData[chartKey]) {
            return chartData;
        }

        var page = this.pagination[chartKey].setOptions(
            (chartData[chartKey] || []).length, 7, 1
        );

        chartData[chartKey] = chartData[chartKey].slice(page.firstIndex, page.lastIndex);

        return chartData;
    },

    /**
     * Update Dashboard charts
     * Charts that are active filter will not be updated
     * @param data
     */
    updateDashboards: function (data) {
        var chartData = JSON.parse(data.dashboard_chart_data);

        this.dashboarData = _.assign({}, this.dashboarData, chartData);

        // TODO update to be more "dynamic"
        this.updatePagination('tabia', chartData);
        this.updatePagination('fundedBy', chartData);

        // TODO handle better
        // set no data if there are no entries per group (yes, no, unknown ...)
        ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"].forEach(function (chartKey) {
            if (_.every(chartData[chartKey], { 'cnt': null})) {
               chartData[chartKey] = [];
            }
        });

        this.execForAllCharts(this.getNonFilteredChartKeys(), 'data', (chartData || []));

        this.charts.beneficiaries.data(chartData.tabia);

        this.table.reportTable.ajax.reload();

        this.refreshMapData();
    },

    renderDashboardCharts: function (chartKeys, chartData) {
        var self = this;
        var chart;

        chartKeys.forEach(function (chartKey) {

            chart = self.chartConfigs[chartKey];

            if (chart) {

                chart.data = chartData[chartKey] || [];

                switch (chart.chartType) {
                    case 'horizontalBar':

                        if (chart.hasPagination === true) {

                            self.initPagination({
                                itemsCnt: (chartData[chartKey] || []).length,
                                itemsPerPage: self.itemsPerPage,
                                chartKey: chartKey,
                                chart: chart
                            });

                            var page = self.pagination[chartKey].getPage();
                            chart.data = chart.data.slice(0, page.lastIndex);
                        }

                        // setup horizontal bar chart config
                        var prepared = barChartHorizontal(chart)
                            .title(chart.title)
                            .data(chart.data);

                        // init horizontal bar chart
                        prepared(chart.parentId);

                        self.charts[chartKey] = prepared;

                        return self.charts[chartKey];
                    case 'pie':


                        // setup pie chart
                        var pie = pieChart(chart)
                            .title(chart.title)
                            .data(chart.data);

                        // init  pie chart
                        pie(chart.parentId);

                        self.charts[chartKey] = pie;


                        return self.charts[chartKey];

                    case 'beneficiariesInfo':
                        // setup chart
                        self.charts[chartKey] = beneficiariesChart().data(chartData.tabia);

                        // init chart
                        self.charts[chartKey](document.getElementById(chart.parentId));

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
        var name = opts.name;
        var filterValue = opts.filterValue;
        var reset = opts.reset;
        var resetSingle = opts.resetSingle;
        var isActive = opts.isActive;

        if (reset === true) {

            // execute reset for provided chart
            if (resetSingle) {
                this.filter.resetFilter(name);
            } else {

                // get all horizontal bar chart keys
                var horizontalBarKeys = _.map(_.filter(this.chartConfigs, {
                    chartType: 'horizontalBar'
                }), 'chartKey');

                // execute resetActive for all horizontal bar charts
                this.execForAllCharts(horizontalBarKeys, 'resetActive');

                // empty map search field selection
                this.map.clearSearchField();

                // clear all defined filters
                this.filter.initFilters();
            }

        } else {
            isActive === true ? this.filter.removeFromFilter(name, filterValue) : this.filter.addToFilter(name, filterValue);
        }

        return this.getChartFilterArg();
    },

    getChartFilterArg: function () {
        return {
            filters: this.filter.getCleanFilters(),
            coord: this.map.getMapBounds()
        };
    },

    /**
     * Init dashboards events:
     * - charts on resize
     * - reset all btn click
     */
    initEvents: function () {
        var self = this;

        // on resize event for all charts
        const chartResize = WB.utils.debounce(function (e) {
            self.execForAllCharts(Object.keys(self.chartConfigs), 'resize');
        }, 150);

        WB.utils.addEvent(window, 'resize', chartResize);

        // Chart Reset click event
        WB.utils.addEvent(document.getElementById('wb-reset-all-filter'), 'click', function (e) {
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

    var preparedFilters = WB.controller.handleChartFilterFiltering(props);

    return axFilterTabyiaData({
        data: JSON.stringify(preparedFilters),
        successCb: function (data) {
            WB.controller.updateDashboards(data);
        },
        errorCb: function (request, error) {
            console.log(request, error);
        }
    });

};


// CHART TOOLTIP RENDER FUNCTIONS

function tabiaTooltip(d) {
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
