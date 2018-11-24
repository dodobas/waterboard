function DashboardController(opts) {
    // chart modules / class instances
    this.charts = {};

    // leaflet map wrapper module
    this.map = {};

    // filter handler class
    this.filter = {};

    // modules / class instance configuration
    this.chartConfigs = opts.chartConfigs;
    this.mapConfig = opts.mapConfig;

    this.itemsPerPage = 7;
    this.pagination = {};

    // data used by all dashboard elements - map, charts
    this.dashboarData = opts.dashboarData;

    // Init functions
    this.initFilter();
    this.renderMap();
    this.refreshMapData();
    // this.renderTable();
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
     * Used on chart updates
     * @returns {Array}
     */
    getNonFilteredChartKeys: function () {

        const activeFilterKeys = this.filter.getCleanFilterKeys();

        return _.map(_.filter(this.chartConfigs, function (i) {
            return activeFilterKeys.indexOf(i.name) === -1;
        }), 'chartKey');
    },

    /**
     * Update Dashboard charts
     * Charts that are active filter will not be updated
     * @param data
     */
    updateDashboards: function (data) {
        var self = this;

        var chartData = JSON.parse(data.dashboard_chart_data);

        this.dashboarData = _.assign({}, this.dashboarData, chartData);

        // update pagination
        _.filter(this.chartConfigs, {hasPagination: true}).forEach(function (conf) {
            self.pagination[conf.chartKey].setOptions(
                (chartData[conf.chartKey] || []).length, null, 1
            );
           var page = self.pagination[conf.chartKey].getPage();

            chartData[conf.chartKey] = chartData[conf.chartKey].slice(page.firstIndex, page.lastIndex);
        });

        // TODO handle better
        // set no data if there are no entries per group (yes, no, unknown ...)
        ["fencing", "waterCommitee", "amountOfDeposited", "staticWaterLevel", "yield"].forEach(function (chartKey) {
            if (_.every(chartData[chartKey], {'cnt': null})) {
                chartData[chartKey] = [];
            }
        });

        this.execForAllCharts(this.getNonFilteredChartKeys(), 'data', (chartData || []));

        this.charts.beneficiaries.data(this.dashboarData.datastats);
        this.charts.schemeType.data(this.dashboarData.schemetype_stats);

        this.refreshMapData();
    },

    renderDashboardCharts: function (chartKeys, chartData) {
        var self = this;
        var chartConf;

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
                        self.charts[chartKey] = beneficiariesChart().data(chartData.datastats);

                        // init chart
                        self.charts[chartKey](document.getElementById(chartConf.parentId));

                        return self.charts[chartKey];
                    case 'schemeTypeInfo':
                        // setup chart
                        self.charts[chartKey] = schemeTypeChart().data(chartData.schemetype_stats);

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

                // reset pie chart (functioning)
                this.charts.functioning.resetActive();

                // empty map search field selection
                this.map.clearSearchField();

                // clear all defined filters
                this.filter.initFilters();
            }

        } else {
            isActive === true ? this.filter.removeFromFilter(filterName, filterValue) : this.filter.addToFilter(filterName, filterValue);
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
     * - charts on resize for all charts
     * - reset all btn click
     */
    initEvents: function () {
        var self = this;

        const chartResize = _.debounce(function (e) {
            self.execForAllCharts(Object.keys(self.chartConfigs), 'resize');
            WB.loadingModal.hide();
        }, 150);

        WB.utils.addEvent(window, 'resize', chartResize);

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
