class DashboardController {
    constructor(props) {
        const {dashboarData, chartConfigs, tableConfig, mapConfig} = props;

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

        this.fieldToChart = Object.keys(this.chartConfigs).reduce((acc, val, i) => {
            acc[this.chartConfigs[val].name] = val;
            return acc
        }, {});

        // Init functions
        this.initFilter();
       // this.initPagination();
        this.renderMap();
        this.renderTable();
        this.renderDashboardCharts(Object.keys(this.chartConfigs), this.dashboarData);
        this.initEvents();
    }

    handlePagination(chartKey, nextPage) {
        let {firstIndex, samePage, lastIndex} = nextPage === true ? this.pagination[`${chartKey}`].nextPage() : this.pagination[`${chartKey}`].previousPage();

        if (samePage === true) {
            return;
        }
        let slice = this.dashboarData[chartKey].slice(firstIndex, lastIndex);
        this.charts[chartKey].updateChart(slice);
    }

    initPagination({chartKey, chart}) {

        const {paginationConf, data} = chart;

        this.pagination[`${chartKey}`] =  pagination({
            itemsCnt: data.length,
            itemsPerPage: this.itemsPerPage
        });

        let prevBtn = document.getElementById(`${paginationConf.prevBtnId}`);
        let nextBtn = document.getElementById(`${paginationConf.nextBtnId}`);

        WB.utils.addEvent(prevBtn, 'click', () => {
            this.handlePagination(chartKey, false);
        });

        WB.utils.addEvent(nextBtn, 'click', () => {
            this.handlePagination(chartKey, true);
        });
        //
        // $(`#${paginationConf.prevBtnId}`).on('click', () => {
        //     let {firstIndex, samePage, lastIndex} = this.pagination[`${chartKey}`].previousPage();
        //     if (samePage === true) {
        //         return;
        //     }
        //     let slice = this.dashboarData[chartKey].slice(firstIndex, lastIndex);
        //     this.charts[chartKey].updateChart(slice);
        // });
        //
        // $(`#${paginationConf.nextBtnId}`).on('click', () => {
        //     let {firstIndex, samePage, lastIndex} = this.pagination[`${chartKey}`].nextPage();
        //
        //     if (samePage === true) {
        //         return;
        //     }
        //     let slice = this.dashboarData[chartKey].slice(firstIndex, lastIndex);
        //
        //     this.charts[chartKey].updateChart(slice);
        // });


        return this.pagination[`${chartKey}`].getPage();

    }
    // init and set data table
    renderTable() {

        const conf = Object.assign({},  this.tableConfig.dataTable, {data: this.dashboarData.tableData});
        this.table = WB.tableReports.init('reports-table', {
            dataTable: conf
        });
    }

    // init and set filter class
    initFilter() {
          this.filter = new DashboardFilter({
            multiSelect: true,
            filterKeys: DashboardController.getFilterableChartKeys(this.chartConfigs)
        })
    }

    // init map module, render feature markers
    renderMap() {
         this.map = ashowMap(this.mapConfig);

         this.map.createMarkersOnLayer({
            markersData: this.dashboarData.mapData || [],
            addToMap: true,
            iconIdentifierKey: 'functioning'

        });
    }

    /**
     * Helper Function - execute common chart methods (update, resize...)
     * @param chartDataKeys
     */
    execChartMethod(chartName, methodName, methodArg) {
        let chartInstance = this.charts[`${chartName}`] || {};

        if (chartInstance && chartInstance[methodName] instanceof Function) {
            if (methodArg) {
                chartInstance[methodName](methodArg);
            } else {
                chartInstance[methodName]();
            }

        } else {
            console.log(`Chart - ${chartName} has no ${methodName} defined or does not exist.`);
        }
    }


    // execForAllCharts(chartNames, 'resetActive')
    // execForAllCharts(chartNames, 'resize')
    // execForAllCharts(chartNames, 'updateChart', methodArg)
    execForAllCharts(chartNames, methodName, methodArg = null) {
        chartNames.forEach((chartName) =>
            this.execChartMethod(chartName, methodName, methodArg && methodArg[chartName]));
    }

    /**
     * Filter chart keys not in filters
     * @param mapMoved
     * @returns {Array}
     */
    getActiveChartFilterKeys() {
        const activeFilterKeys = this.filter.getCleanFilterKeys();

        return Object.keys(this.fieldToChart).reduce((chartNamesArr, fieldName, i) => {
            if (activeFilterKeys.indexOf(fieldName) === -1) {
                chartNamesArr[chartNamesArr.length] = this.fieldToChart[fieldName];
            }
            return chartNamesArr;
        }, []);
    }

    /**
     * Update all dashboard elements - charts and map
     * @param data
     * @param mapMoved
     */
    updateDashboards(data, mapMoved) {
        const chartData = JSON.parse(data.dashboard_chart_data);

        let chartsToUpdate = this.getActiveChartFilterKeys();

        this.execForAllCharts(chartsToUpdate, 'updateChart', (chartData || []));

        this.map.createMarkersOnLayer({
            markersData: chartData.mapData,
            clearLayer: true,
            iconIdentifierKey: 'functioning'
        });

        this.table.redraw(chartData.tableData);
    }

    renderDashboardCharts(chartKeys, chartData) {
        let chart;

        chartKeys.forEach((chartKey) => {

            chart = this.chartConfigs[chartKey];

            if (chart) {

                chart.data = chartData[`${chartKey}`] || [];

                switch (chart.chartType) {
                    case 'horizontalBar':

                        if (chart.hasPagination === true) {
                            this.pagination[`${chartKey}`] =  pagination({
                                itemsCnt: (chartData[`${chartKey}`] || []).length,
                                itemsPerPage: this.itemsPerPage
                            });

                            let {lastIndex} = this.initPagination({chartKey, chart});

                            chart = Object.assign({}, chart, {data: chart.data.slice(0, lastIndex)});
                        }

                        this.charts[`${chartKey}`] = barChartHorizontal(chart);

                        return this.charts[`${chartKey}`];
                    case 'donut':
                        this.charts[`${chartKey}`] = donutChart(chart);
                        return this.charts[`${chartKey}`];
                    case 'pie':
                        this.charts[`${chartKey}`] = pieChart(chart);
                        return this.charts[`${chartKey}`];
                    default:
                        return false;
                }
            } else {
                console.log(`No Chart Configuration found - ${chartKey}`);
            }


        });
    }

    handleChartFilterFiltering(props) {
        const {name, filterValue, reset, alreadyClicked} = props;

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
    }

    initEvents() {
        // on resize event for all charts
        const chartResize = WB.utils.debounce((e) => {
            this.execForAllCharts(Object.keys(this.chartConfigs), 'resize');
        }, 150);

        WB.utils.addEvent(window, 'resize', chartResize);

        // Chart Reset click event
        WB.utils.addEvent(document.getElementById('tabiya-reset-button'), 'click', function (e) {
            DashboardController.handleChartEvents({
                    origEvent: e,
                    reset: true
                });
        });
    }

    /**
     * Get chart filter keys (filter field names) from chart config
     * @param chartConf
     * @returns {*}
     */
    static getFilterableChartKeys(chartConf){
        return Object.keys(chartConf).reduce((acc, val, i) => {
            if (chartConf[val].isFilter === true) {
                acc[acc.length] = chartConf[val].name;
            }
            return acc;
        }, []);
    }


    /**
     * General Dashboard event / filter handler
     *
     * Fetch new data based on map coordinates and active filters
     *
     */
    static handleChartEvents(props, mapMoved = false) {

        const preparedFilters = WB.controller.handleChartFilterFiltering(props, mapMoved);

        return axFilterTabyiaData({
            data: JSON.stringify(preparedFilters),
            successCb: (data) => WB.controller.updateDashboards(data, mapMoved),
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
    static getChartKeysByChartType(chartConf, chartType) {
        return Object.keys(chartConf).reduce((acc, val, i) => {
                if (chartConf[val].chartType === chartType) {
                    acc[acc.length] = val;
                }
                return acc;
            }, []);
        }
    }



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

const tabiaTooltip = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Group: ${d.group}</li>
    <li>Beneficiaries: ${d.beneficiaries}</li>
</ul>`;

const fencingTooltipRenderer = (d) => `<ul>
  <li>Count: ${d.cnt}</li><li>Fencing: ${d.fencing}</li>
</ul>`;

const fundedByTooltipRenderer = (d) => `<ul>
  <li>Count: ${d.cnt}</li>
  <li>Funders: ${d.group}</li>
</ul>`;

const waterCommiteeTooltipRenderer = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Water Commitee: ${d.water_committe_exist}</li>
</ul>`;

const amountOfDepositedTooltipRenderer = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Min: ${d.min}</li>
    <li>Max: ${d.max}</li>
    <li>Range: ${d.group_def.label}</li>
</ul>`;

const staticWaterLevelTooltipRenderer = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Min: ${d.min}</li>
    <li>Max: ${d.max}</li>
    <li>Range: ${d.group_def.label}</li>
</ul>`;

const yieldTooltipRenderer = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Min: ${d.min}</li>
    <li>Max: ${d.max}</li>
    <li>Range: ${d.group_def.label}</li>
</ul>`;

const functioningTooltipRenderer = (d) => `<ul>
    <li>Count: ${d.cnt}</li>
    <li>Group: ${d.group_id}</li>
</ul>`;

const mapOnMoveEndHandler = WB.utils.debounce(function (e) {
    DashboardController.handleChartEvents({
        origEvent: e,
        reset: false
    });
}, 250);
