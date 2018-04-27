function barChartHorizontal(options) {
    var _INIT_TIME = new Date().getTime();
    var _ID = options.parentId + '_' + _INIT_TIME;
    var _CHART_TYPE = 'HORIZONTAL_BAR_CHART';
    var _NAME = options.name;

    var filterValueField = options.filterValueField || 'group';
    var columns = options.columns;
    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group';

    var sortKey = options.sortKey || valueField;

    var parentId = options.parentId || 'chart';
    var titleClass = options.titleClass || 'wb-chart-title';
    var barsClass = options.barsClass || 'bar';
    var labelClass = options.labelClass || 'wb-barchart-label';
    var xAxisClass = options.xAxisClass || 'x axis';
    var svgClass = options.svgClass || 'wb-horizontal-bar';
    var toolTipClass = options.toolTipClass || 'wb-horizontal-bar-tooltip';
    var activeBarClass = options.activeBarClass || 'wb-bar-active';

    var showTitle = options.showTitle || true;

    // used for bar label height calculation
    var fontSize = options.fontSize || 12;

    var barsCnt = options.barsCnt || 7;
    var _barHeight = 20;

    var clickHandler = options.clickHandler;
    var tooltipRenderer = options.tooltipRenderer || function () {
        return 'Default Tooltip'
    };

    var title = options.title;
    var _activeBars = [];

    var _margin = options.margin || {
        top: 15,
        right: 15,
        bottom: 20,
        left: 15
    };
    var opacityHover = 1;
    var otherOpacityOnHover = .6;
var barPadding = 3;
    var _svgWidth;
    var _svgHeight = options.height || 200;
    var _height = _svgHeight - _margin.top - _margin.bottom;
    var _width;


    var _data;


    var parent = document.getElementById(parentId);

    // TODO - append to chart div maybe?
    var tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
        .attr("id", 'wb_tooltip_' + _ID);

    // helper - returns value of data object
    function _xValue(d) {
        return _.get(d, valueField) || 0;
    }

    // helper - returns label of data object
    function _yValue(d) {
        return _.get(d, labelField);
    }

    // helper - generates id for data object based on label
    function _generateBarId(d) {

        var label = (_yValue(d)).replace(/[^a-z0-9]+/gi, '');
        return [_ID, label].join('_');
    }

    // x axis scale
    var _xScale = d3.scaleLinear();

    // y axis scale
    var _yScale = d3.scaleBand();

    // axis scale value helper
    function _xScaleValue(d) {
        return _xScale((_xValue(d) || 0));
    }

    // axis
    var _xAxis = d3.axisBottom(_xScale);

    var _svg;
    // Axis group and x axis, y axis not used
    var _xAxisGroup;

    // Chart Group - represented data
    var _chartGroup;

    // Chart title group
    var _titleGroup;
    var _clearBtnGroup;

    var updateChart, _handleMouseMove;


    /**
     * Add svg to dom
     * Add all groups to svg and apply base transformation using margin
     * @private
     */
    function _renderSvgElements(parentId) {
        // main svg
        _svg = d3.select('#' + parentId).append('svg')
            .classed(svgClass, true);


        _xAxisGroup = _svg.append("g").classed(xAxisClass, true);

        _chartGroup = _svg.append("g")
            .classed('chart-group', true)
             .on("mouseout", function () {
                 d3.select(this).selectAll('.' + barsClass + '_group')
                .style("opacity", opacityHover)
             })

            ;

        _titleGroup = _svg.append("g")
            .classed('title-group', true)
            .attr("transform", "translate(" + [0, _margin.top + 2] + ")");

        _clearBtnGroup = _svg.append("g")
            .classed('clear-btn-group', true);

    }

    function _chart(parentId) {
        _calcSize();
        _renderSvgElements(parentId);


        function _setScales() {
            // use predefined y labels or take them from data
            var cols = columns ? columns : _data.map(_yValue);

            _yScale
                .domain(cols)
                .range([_height, 0])
                .padding(0.1);

            _xScale
                .domain([0, d3.max(_data, _xValue)])
                .range([0, _width]);
        }

        // Set size and domains
        function _resize() {
            _svg
                .attr("width", _svgWidth)
                .attr("height", _svgHeight);

            _chartGroup
                .attr("width", _width)
                .attr("height", _height)
                .attr("transform", "translate(" + [_margin.left, _margin.top] + ")");

            _xAxisGroup
                .attr("width", _width)
                .attr("height", _height)
                .attr("transform", "translate(" + [_margin.left, (_height + _margin.top)] + ")")
                .call(_xAxis.ticks(5).tickSizeInner([-_height]));

            _clearBtnGroup.attr("transform", "translate(" + [_svgWidth - 50, 2] + ")");

        }

        function addTitle() {
            _titleGroup.append("text")
                .attr("class", titleClass)
                .attr("transform", "rotate(-90)")
                .attr("y", 10)
                .attr("text-anchor", "end")
                .text(title);

        }

        function addClearBtn() {


            var paddingLR = 10;
            var paddingTB = 4;

            _clearBtnGroup.attr("opacity", 0);
            _clearBtnGroup.on('click', _handleClear);

            var rect = _clearBtnGroup.append("rect");

            // add text to group
            var txt =_clearBtnGroup
                .append("text")
                .text('clear');

            var txtSize = txt.node().getBBox();

            var w = txtSize.width + paddingLR;
            var h = txtSize.height + paddingTB;

            rect.attr('width', w).attr('height', h);

            txt .attr("transform", "translate(" + [(w) / 2, (h) / 2 + (paddingLR / 2)] + ")");
         }

        // returns default class with appended active class if id in _activeBars
        function _getBarClass(d) {
            if (_activeBars.indexOf(_yValue(d)) > -1) {
                return barsClass + ' wb-bar-active';
            }
            return barsClass;
        }

        // set size based on parent dom, used with window resize
        function _calcSize() {
            var bounds = parent.getBoundingClientRect();

            _chart.width(bounds.width);
            _chart.height(_svgHeight);
        }

        // if new data is not set, only redraw
        updateChart = function () {

            _calcSize();
            _setScales();
            _resize();

            // select all bar groups, 1 group per bar
            var barGroups = _chartGroup.selectAll('.' + barsClass + '_group')
                .data(_data);

            // ENTER - add groups
            var newBarGroups = barGroups.enter().append("g")
                .attr("class", barsClass + '_group')
                .attr("id", _generateBarId)
                .on("mousemove", _handleMouseMove)
                .on("mouseout", _handleMouseOut)
                .on("mouseover", _handleMouseOver)
                .on("click", _handleClick);

            // add bar to group
            newBarGroups
                .append("rect")
                .attr("class", _getBarClass);

            // add text to group
            newBarGroups
                .append("text")
                .attr("class", labelClass);

            // UPDATE - bar
            barGroups.merge(newBarGroups).select('.' + barsClass)
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return (i +1) * (_barHeight + barPadding)  - _barHeight ;
                })
                .attr("height", _barHeight)
                .attr("width", _xScaleValue);

            // UPDATE - text
            barGroups.merge(newBarGroups).select('.' + labelClass)
                .attr("y", function (d, i) {
                    return (i +1) * (_barHeight + barPadding)  - _barHeight + (_barHeight - fontSize) / 2 + fontSize - barPadding;
                })
                .attr("x", 0)
                .text(_yValue);

            // EXIT
            barGroups.exit().remove();
        };

        /**
         * Toggle clicked bar class, add / remove clicked bar from _activeBars
         * @param selection
         * @param isActive
         * @param key
         * @private
         */
        function _toggleActiveBar(selection, isActive, key) {
            if (isActive === -1) {
                selection.classed(activeBarClass, true);
                _activeBars[_activeBars.length] = key;
            } else {
                selection.classed(activeBarClass, false);
                _activeBars.splice(isActive, 1);
            }
        }

        function _handleAdditionalClick(d, isActive, reset, resetSingle) {
            if (clickHandler && clickHandler instanceof Function) {
                clickHandler({
                    data: d,
                    name: _NAME,
                    filterValue: d[filterValueField],
                    chartType: _CHART_TYPE,
                    chartId: _ID,
                    isActive: isActive > -1,
                    reset: reset === true,
                    resetSingle: resetSingle === true
                });
            }
        }

        function _handleClear () {
            _chart.resetActive();
            _toggleClearBtn();
            _handleAdditionalClick({}, -1, true, true);
        }

        function _toggleClearBtn () {
            if (_activeBars.length > 0) {
                _clearBtnGroup.attr("opacity", 1);
            } else {
                _clearBtnGroup.attr("opacity", 0);
            }
        }
        /**
         * Main bar click handler
         * toggles _activeBars and calls user defined callback
         * @param d - bar data
         * @private
         */
        function _handleClick(d) {

            var barLabel = _yValue(d);
            var isActive = _activeBars.indexOf(barLabel);

            _toggleActiveBar(d3.select(this), isActive, barLabel);

            _toggleClearBtn();
            // handle click event defined in configuration
            _handleAdditionalClick(d, isActive);


        }

        _handleMouseMove = function(d) {
            // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear

            var tooltipContent = tooltipRenderer(d);
            tooltip
                .style("display", 'inline-block')
                .html(tooltipContent);

            var tooltipSize = tooltip.node().getBoundingClientRect();
            tooltip
                .style("display", 'inline-block')
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - (tooltipSize.height + 10) + "px")
                .html(tooltipContent);
        };

        function _handleMouseOut(d) {
            tooltip.style("display", "none");
        }
        function _handleMouseOver(d) {

            // change opacity of all paths
            _chartGroup
                .selectAll('.' + barsClass + '_group')
                .style("opacity", otherOpacityOnHover);

            // change opacity of hovered
            d3.select(this).style("opacity", opacityHover);
        }

        if (_data) {
            updateChart();
        }

        if (showTitle === true) {
            addTitle();
            addClearBtn();
        }

    }

    _chart.noData = function (show) {
        if (show === true) {
           _chartGroup.selectAll("*").remove();

           var txt = _svg.select('.no-data');

           if (!txt.empty()) {

               txt.attr("transform", "translate(" + [_svgWidth / 2, _svgHeight /2] + ")");

               return _chart;
           }

            _svg.append("text").attr("class", 'no-data')
                .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")")
                .attr('text-anchor', 'middle')
                .text("No Data")
                .style("font-size", "20px");
        } else {

            _svg.select(".no-data").remove();
        }

        return _chart;

    };


    _chart.title = function (value) {
        if (!arguments.length) {
            return title;
        }
        title = value;

        return _chart;
    };

    _chart.showTitle = function (value) {
        if (!arguments.length) {
            return showTitle;
        }
        showTitle = value === true;

        return _chart;
    };

    _chart.width = function (value) {
        if (!arguments.length) {
            return _svgWidth;
        }
        _svgWidth = value;
        _width = _svgWidth - _margin.left - _margin.right;

        return _chart;
    };

    /**
     *
     * @param value - svg height value
     * @returns {*}
     */
    _chart.height = function (value) {
        if (!arguments.length) {
            return _svgHeight;
        }
        _svgHeight = value;
        _height = _svgHeight - _margin.top - _margin.bottom;


        var paddingCnt = barsCnt + 1;

        _barHeight = (_height - (paddingCnt * barPadding)) / barsCnt;

        return _chart;
    };

    _chart.activeBars = function (value) {
        if (!arguments.length) {
            return _activeBars;
        }
        _activeBars = value;

        return _chart;
    };

    _chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        // asc or desc..?
        _data = _.orderBy(value, sortKey, 'desc');

        if (typeof updateChart === 'function') {
            updateChart();

            _data.length === 0 ? _chart.noData(true) : _chart.noData(false);
        }

        return _chart;
    };

    _chart.resize = function () {
        updateChart();

        return _chart;
    };

    _chart.resetActive = function () {
        _chartGroup.selectAll('.' + activeBarClass)
            .classed(activeBarClass, false);

        _activeBars = [];

        return _chart;
    };

    return _chart;
}
