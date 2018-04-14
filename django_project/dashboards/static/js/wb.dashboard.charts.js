function _sortData(data, reverse, sortKey) {
    var sorted = data.slice(0).sort(function (a, b) {
        return a[sortKey] - b[sortKey];
    });

    if (reverse === true) {
        return sorted.reverse();
    }
    return sorted;
}


/**
 * Beneficiaries "chart"
 *
 * Example: Pattern used for reusable d3 charts
 *
 * @returns {chart}
 */
function beneficiariesChart() {

    var _data;
    var _updateChart;

    var _sumByKey = 'beneficiaries';
    var cnt;
    var sum, min, max;
    var avg;

    function chart(parentDom) {

        var infoDom;

        _updateChart = function () {
            infoDom.innerHTML = ['Beneficiaries: ', sum, ' | min: ', min,' | max: ', max, ' | avg: ',avg].join('');
        };
        function _createInfoBlock () {
            infoDom = document.createElement('div');
            infoDom.setAttribute('class', 'wb-beneficiaries-chart');

            if (sum) {
                _updateChart();
            }
        }

        function _addToParent () {
            while ((parentDom.childNodes || []).length) {
                parentDom.removeChild(parentDom.firstChild);
            }
            parentDom.appendChild(infoDom);
        }

         _createInfoBlock();
        _addToParent();
    }

    chart.calculateData = function (data) {
        cnt = data.length;

        sum = _.sumBy(data, 'beneficiaries');

        var minGroup = _.minBy(data, 'beneficiaries');
        var maxGroup = _.maxBy(data, 'beneficiaries');

        min = minGroup['beneficiaries'];
        max =  maxGroup['beneficiaries'];
        avg = sum / cnt;
    };

    chart.sumByKey = function (value) {
        if (!arguments.length) {
            return _sumByKey;
        }
        _sumByKey = value;

        return chart;
    };

    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = chart.calculateData(value);

        if (typeof _updateChart === 'function') {
            _updateChart();
        }

        return chart;
    };


    return chart;
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

    initPagination: function (opts) {
        var self = this;

        var chartKey = opts.chartKey;

        var paginator = pagination({
            itemsCnt: opts.chart.data.length,
            itemsPerPage: this.itemsPerPage
        });

        var paginationParent = document.getElementById(opts.chart.paginationConf.parentId);

        var pageNmbr = paginationParent.querySelector('.page-nmbr');
        var btns = paginationParent.querySelectorAll('[data-pagination-button]');

        var i = 0;

        for (i; i < btns.length; i += 1) {
            WB.utils.addEvent(btns[i], 'click', function () {
                var page = this.dataset.paginationButton === 'next' ? paginator.nextPage() : paginator.previousPage();
                if (page.samePage === true) {
                    return;
                }
                pageNmbr.innerHTML = page.currentPage + '/' + page.pageCnt;
                self.handlePagination(chartKey, page);
            });
        }

        this.pagination[chartKey] = paginator;

        var page = this.pagination[chartKey].getPage();
        pageNmbr.innerHTML = page.currentPage + '/' + page.pageCnt;

        return page;

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

        // chartInstance.data([{}])
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
                            self.pagination[chartKey] = pagination({
                                itemsCnt: (chartData[chartKey] || []).length,
                                itemsPerPage: self.itemsPerPage
                            });

                            var page = self.initPagination({
                                chartKey: chartKey,
                                chart: chart
                            });

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
        var alreadyClicked = opts.alreadyClicked;
        if (reset === true) {
            // execute resetActive() on all horizntal bar charts
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
        '<span>Tabia: ' + d.group + '</span>' +
        '<span>Beneficiaries: ' + d.beneficiaries + '</span>' +
        '</div>';
}

function fencingTooltipRenderer(d) {
    return '<div class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span><span>Fencing: ' + d.fencing + '</span>' +
        '</div>';
}

function fundedByTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '<span>Funders: ' + d.group + '</span>' +
        '</div>';
}

function waterCommiteeTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '<span>Water Commitee: ' + d.water_committe_exist + '</span>' +
        '</div>';
}

// tooltips for amount of deposited, static water level and yield
function rangeChartTooltipRenderer(d) {
    return '<div  class="tooltip-content">' +
        '<span>Count: ' + d.cnt + '</span>' +
        '<span>Min: ' + d.min + '</span>' +
        '<span>Max: ' + d.max + '</span>' +
        '<span>Range: ' + d.group_def.label + '</span>' +
        '</div>'
}

function mapOnMoveEndHandler(e) {
    DashboardController.handleChartEvents({
        origEvent: e,
        reset: false
    });
}
