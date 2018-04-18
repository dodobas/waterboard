function _sortData(data, reverse, sortKey) {
    var sorted = data.slice(0).sort(function (a, b) {
        return a[sortKey] - b[sortKey];
    });

    if (reverse === true) {
        return sorted.reverse();
    }
    return sorted;
}

//
// a=beneficiariesChart({data: WB.controller.dashboarData.tabia});
// a(document.getElementById('beneficiariesChart'));
// a.data(WB.controller.dashboarData.tabia);
function DashboardController(opts) {
    // modules / class instances
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

    // toto move to init fnc
    var self = this;
    this.fieldToChart = Object.keys(this.chartConfigs).reduce(function (acc, val, i) {
        acc[self.chartConfigs[val].name] = val;
        return acc
    }, {});

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
        this.charts[chartKey].data(
            this.dashboarData[chartKey].slice(page.firstIndex, page.lastIndex)
        );
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

    // init and set filter class
    initFilter: function () {
        this.filter = new DashboardFilter({
            multiSelect: true,
            filterKeys: DashboardController.getFilterableChartKeys(this.chartConfigs)
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

        var preparedFilters = WB.Storage.getItem('dashboardFilters') || {};

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
        var chartInstance = this.charts[chartName] || {};

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
        console.log('===>', chartNames, methodName, methodArg);
        chartNames.forEach(function (chartName) {
            self.execChartMethod(chartName, methodName, methodArg && methodArg[chartName]);
        });
    },

    /**
     * Filter chart keys not in filters
     * @param mapMoved
     * @returns {Array}
     */
    getActiveChartFilterKeys: function () {
        var self = this;

        const activeFilterKeys = this.filter.getCleanFilterKeys();

        return Object.keys(this.fieldToChart).reduce(function (chartNamesArr, fieldName, i) {
            if (activeFilterKeys.indexOf(fieldName) === -1) {
                chartNamesArr[chartNamesArr.length] = self.fieldToChart[fieldName];
            }
            return chartNamesArr;
        }, []);
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
     * @param mapMoved
     */
    updateDashboards: function (data, mapMoved) {
        var chartData = JSON.parse(data.dashboard_chart_data);

        this.dashboarData = _.assign({}, this.dashboarData, chartData);

        var chartsToUpdate = this.getActiveChartFilterKeys();

        // TODO update to be more "dynamic"
        this.updatePagination('tabia', chartData);
        this.updatePagination('fundedBy', chartData);

        this.execForAllCharts(chartsToUpdate, 'data', (chartData || []));

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
                    case 'donut':
                        self.charts[chartKey] = donutChart(chart);
                        return self.charts[chartKey];
                    case 'pie':
                        self.charts[chartKey] = pieChart(chart);
                        return self.charts[chartKey];
                    case 'beneficiariesInfo':
                        self.charts[chartKey] = beneficiariesChart().data(chartData.tabia);
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

                // execute for all
                this.execForAllCharts(
                    DashboardController.getChartKeysByChartType(this.chartConfigs, 'horizontalBar'),
                    'resetActive'
                );

                this.map.clearSearchField();
                this.filter.initFilters();
            }

        } else {
            isActive === true ? this.filter.removeFromFilter(name, filterValue) : this.filter.addToFilter(name, filterValue);
        }

        return {
            filters: this.filter.getCleanFilters(),
            coord: this.map.getMapBounds()
        };
    },

    initEvents: function () {
        var self = this;

        // on resize event for all charts
        const chartResize = WB.utils.debounce(function (e) {
            self.execForAllCharts(Object.keys(self.chartConfigs), 'resize');
        }, 150);

        WB.utils.addEvent(window, 'resize', chartResize);

        // Chart Reset click event
        WB.utils.addEvent(document.getElementById('tabiya-reset-button'), 'click', function (e) {
            DashboardController.handleChartEvents({
                origEvent: e,
                reset: true
            });
        });

/*
        var btns = document.querySelectorAll('[data-chart-clear-button]');

        var i = 0;

        for (i; i < btns.length; i += 1) {
            WB.utils.addEvent(btns[i], 'click', function (e) {
                var chartName = this.dataset.chartClearButton;

                console.log('chart', chartName);

                DashboardController.handleChartEvents({
                    origEvent: e,
                    reset: true,
                    chartName: chartName
                });



            });
        }*/


    },

};


/**
 * Get chart filter keys (filter field names) from chart config
 * @param chartConf
 * @returns {*}
 */
DashboardController.getFilterableChartKeys = function (chartConf) {
    return Object.keys(chartConf).reduce(function (acc, val, i) {
        if (chartConf[val].isFilter === true) {
            acc[acc.length] = chartConf[val].name;
        }
        return acc;
    }, []);
};


/**
 * General Dashboard event / filter handler
 *
 * Fetch new data based on map coordinates and active filters
 *
 */
DashboardController.handleChartEvents = function (props, mapMoved) {

    mapMoved = mapMoved === true;

    var preparedFilters = WB.controller.handleChartFilterFiltering(props, mapMoved);

    WB.Storage.setItem('dashboardFilters', preparedFilters);

    return axFilterTabyiaData({
        data: JSON.stringify(preparedFilters),
        successCb: function (data) {
            WB.controller.updateDashboards(data, mapMoved);
        },
        errorCb: function (request, error) {
            console.log(request, error);
        }
    });

};

/**
 * Get chart keys for specified chart type
 * @param chartConf
 * @param chartType
 * @returns {*}
 */
DashboardController.getChartKeysByChartType = function (chartConf, chartType) {
    return Object.keys(chartConf).reduce(function (acc, val, i) {
        if (chartConf[val].chartType === chartType) {
            acc[acc.length] = val;
        }
        return acc;
    }, []);
};


/**
 * on click will return amongst other props:
 * name: -> chart identifier, also same as db field
 * data: -> data used to render chart
 *
 * -> data holds value for filter
 * -> the key for the valu prop is set on init -> filterValueField
 * -> the label and db column name can be different
 */




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
