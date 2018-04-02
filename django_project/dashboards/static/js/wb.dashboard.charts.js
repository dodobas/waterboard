function DashboardController (opts) {

        var dashboarData = opts.dashboarData;
        var chartConfigs = opts.chartConfigs;
        var tableConfig = opts.tableConfig;
        var mapConfig = opts.mapConfig;

        // modules / class instances
        this.charts = {};

        // leaflet map wrapper module
        this.map = {};

        // jquery datatable wrapper class
        this.table = {};

        // filter handler class
        this.filter = {};

        // modules / class instance configuration
        this.chartConfigs = chartConfigs;
        this.tableConfig = tableConfig;
        this.mapConfig = mapConfig;

        this.itemsPerPage = 7;
        this.pagination = {};

        // data used by all dashboard elements - map, charts
        this.dashboarData = dashboarData;

        // toto move to init fnc
        var self = this;
        this.fieldToChart = Object.keys(this.chartConfigs).reduce(function(acc, val, i) {
            acc[chartConfigs[val].name] = val;
            return acc
        }, {});

        // Init functions
        this.initFilter();
        // this.initPagination();
        this.renderMap();
        this.refreshMapData();
        this.renderTable();
        this.renderDashboardCharts(Object.keys(this.chartConfigs), this.dashboarData);
        this.initEvents();

}
DashboardController.prototype = {
    handlePagination: function (chartKey, nextPage) {
        var page = nextPage === true ? this.pagination[chartKey].nextPage() : this.pagination[chartKey].previousPage();

        if (page.samePage === true) {
            return;
        }
        var slice = this.dashboarData[chartKey].slice(page.firstIndex, page.lastIndex);
        this.charts[chartKey].updateChart(slice);
    },

    initPagination: function (opts) {
        var self = this;

        var chartKey = opts.chartKey;

        var paginationConf = opts.chart.paginationConf;
        var data = opts.chart.data;


        this.pagination[chartKey] =  pagination({
            itemsCnt: data.length,
            itemsPerPage: this.itemsPerPage
        });

        var prevBtn = document.getElementById(paginationConf.prevBtnId);
        var nextBtn = document.getElementById(paginationConf.nextBtnId);

        WB.utils.addEvent(prevBtn, 'click', function () {
            self.handlePagination(chartKey, false);
        });

        WB.utils.addEvent(nextBtn, 'click', function () {
            self.handlePagination(chartKey, true);
        });

        return this.pagination[chartKey].getPage();

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
        this.map = ashowMap(this.mapConfig);
    },

    refreshMapData: function () {
        var self = this;

        var preparedFilters = WB.Storage.getItem('dashboardFilters') || {};

        axGetMapData({
            data: {
                zoom: self.map.leafletMap.getZoom(),
                _filters: JSON.stringify(preparedFilters)
            },
            successCb: function (data) {
                self.map.createMarkersOnLayer({
                    markersData: data || [],
                    addToMap: true,
                    iconIdentifierKey: 'functioning',
                    clearLayer: true
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
            console.log('Chart - ' + chartName + ' has no '+ methodName +' defined or does not exist.');
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
     * Update all dashboard elements - charts and map
     * @param data
     * @param mapMoved
     */
    updateDashboards: function (data, mapMoved) {
        // this.dashboarData = JSON.parse(data.dashboard_chart_data);
        var chartData = JSON.parse(data.dashboard_chart_data);

        this.dashboarData = _.assign({}, this.dashboarData, chartData);

       // var chartData = _.assign({}, chartData, this.dashboarData);

        var chartsToUpdate = this.getActiveChartFilterKeys();

        console.log('chartsToUpdate', chartsToUpdate);
        // TODO update to be more "dynamic"
        this.updatePagination('tabia', chartData);
        this.updatePagination('fundedBy', chartData);

        this.execForAllCharts(chartsToUpdate, 'updateChart', (chartData || []));

        // this.map.createMarkersOnLayer({
        //     markersData: chartData.mapData,
        //     clearLayer: true,
        //     iconIdentifierKey: 'functioning'
        // });

        // this.table.redraw(chartData.tableData);
        this.table.reportTable.ajax.reload();

        this.refreshMapData();
    },

    renderDashboardCharts: function (chartKeys, chartData) {
        var self = this;
        var chart;

        chartKeys.forEach( function (chartKey) {

            chart = self.chartConfigs[chartKey];

            if (chart) {

                chart.data = chartData[chartKey] || [];

                switch (chart.chartType) {
                    case 'horizontalBar':

                        if (chart.hasPagination === true) {
                            self.pagination[chartKey] =  pagination({
                                itemsCnt: (chartData[chartKey] || []).length,
                                itemsPerPage: self.itemsPerPage
                            });

                            var page = self.initPagination({
                                chartKey: chartKey,
                                chart: chart
                            });

                            chart.data = chart.data.slice(0, page.lastIndex);
                        }

                        self.charts[chartKey] = barChartHorizontal(chart);

                        return self.charts[chartKey];
                    case 'donut':
                        self.charts[chartKey] = donutChart(chart);
                        return self.charts[chartKey];
                    case 'pie':
                        self.charts[chartKey] = pieChart(chart);
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
        var alreadyClicked = opts.alreadyClicked;

        if (reset === true) {
            // remove .active class from clicked bars
            this.execForAllCharts(
                DashboardController.getChartKeysByChartType(this.chartConfigs, 'horizontalBar'),
                'resetActive'
            );

            this.filter.initFilters();
        } else {
            alreadyClicked === true ? this.filter.removeFromFilter(name, filterValue) : this.filter.addToFilter(name, filterValue);
        }

        return {
            filters: this.filter.getCleanFilters(),
            coord: this.map.getCoord()
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
    },

};


/**
 * Get chart filter keys (filter field names) from chart config
 * @param chartConf
 * @returns {*}
 */
DashboardController.getFilterableChartKeys = function (chartConf) {
    return Object.keys(chartConf).reduce(function(acc, val, i) {
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
DashboardController.handleChartEvents = function(props, mapMoved) {

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
DashboardController.getChartKeysByChartType = function(chartConf, chartType) {
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

function tabiaTooltip (d) { return '<ul>' +
    '<li>Count: ' + d.cnt + '</li>' +
    '<li>Group: ' + d.group + '</li>' +
    '<li>Beneficiaries: ' + d.beneficiaries + '</li>' +
'</ul>';
}

function fencingTooltipRenderer (d) {
    return '<ul>' +
    '<li>Count: ' + d.cnt + '</li><li>Fencing: ' + d.fencing + '</li>' +
'</ul>';
}

function fundedByTooltipRenderer (d) {
    return '<ul>' +
  '<li>Count: ' + d.cnt + '</li>' +
  '<li>Funders: ' + d.group + '</li>'+
'</ul>';
}

function waterCommiteeTooltipRenderer (d) {
    return '<ul>' +
    '<li>Count: ' + d.cnt + '</li>' +
    '<li>Water Commitee: ' + d.water_committe_exist + '</li>' +
'</ul>';
}

function amountOfDepositedTooltipRenderer (d) {
    return '<ul>' +
    '<li>Count: ' + d.cnt + '</li>' +
    '<li>Min: ' + d.min + '</li>' +
    '<li>Max: ' + d.max + '</li>' +
    '<li>Range: ' + d.group_def.label + '</li>' +
'</ul>';
}

function staticWaterLevelTooltipRenderer (d) {
    return '<ul>'+
    '<li>Count: ' + d.cnt + '</li>'+
    '<li>Min: ' + d.min + '</li>'+
    '<li>Max: ' + d.max + '</li>' +
    '<li>Range: ' + d.group_def.label + '</li>' +
'</ul>';
}

function yieldTooltipRenderer (d)  {
    return '<ul>' +
    '<li>Count: ' + d.cnt + '</li>'+
    '<li>Min: ' + d.min + '</li>'+
    '<li>Max: ' + d.max + '</li>'+
    '<li>Range: ' + d.group_def.label + '</li>'+
'</ul>'
}

function functioningTooltipRenderer (d) {
    return '<ul>' +
        '<li>Count: ' + d.cnt + '</li>' +
        '<li>Group: ' + d.group + '</li>' +
    '</ul>';
}

function mapOnMoveEndHandler (e) {
    DashboardController.handleChartEvents({
        origEvent: e,
        reset: false
    });
}
