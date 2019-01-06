export default function barChartHorizontal(options) {

    const _INIT_TIME = new Date().getTime();
    let _CHART_TYPE = 'HORIZONTAL_BAR_CHART';

    let {
        name,
        data,
        filterValueField = 'group',
        columns,
        valueField = 'cnt',
        labelField = 'group',
        parentId = 'chart',
        titleClass = 'wb-chart-title',
        barsClass = 'bar',
        labelClass = 'wb-barchart-label',
        xAxisClass = 'x axis',
        svgClass = 'wb-horizontal-bar',
        toolTipClass = 'wb-horizontal-bar-tooltip',
        activeBarClass = 'wb-bar-active',
        showTitle = true,
        fontSize = 12,
        barsCnt = 7,
        title,
        clickHandler,
        tooltipRenderer = function () {
            return 'Default Tooltip'
        },

        opacityHover = 1,
        otherOpacityOnHover = .6,
         barPadding = 3,
        height = 200,
        barHeight = 20,

        margin
    } = options;


    const _NAME = name;
    const _ID = parentId + '_' + _INIT_TIME;

    // sort key identifie in data, defaults to valueField identifier
    let sortKey = options.sortKey || valueField;

    let barGroupClass = `${barsClass}_group`;

    let _barHeight = barHeight;

    let _margin = margin || {
        top: 15,
        right: 15,
        bottom: 20,
        left: 15
    };


    let _svgWidth;
    let _svgHeight = height;
    let _height = _svgHeight - _margin.top - _margin.bottom;

    // chart group width
    let _width;

    // list of active bar identified by data label
    let _activeBars = [];
    let _data;

    if(data) {
        _data = _.orderBy(data, sortKey, 'desc');
    }

    let parent = document.getElementById(parentId);

    // TODO - append to chart div maybe?
    let tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
        .attr("id", 'wb_tooltip_' + _ID);

    // helper - returns value of data object
    const _xValue = d => _.get(d, valueField) || 0;

    // helper - returns label of data object
    const _yValue = d => _.get(d, labelField);


    // helper - generates id for data object based on label
    function _generateBarId(d) {
        let label = (_yValue(d)).replace(/[^a-z0-9]+/gi, '');
        return [_ID, label].join('_');
    }

    // x axis scale
    let _xScale = d3.scaleLinear();

    // y axis scale
    let _yScale = d3.scaleBand();

    // axis scale value helper
    const _xScaleValue = (d) => _xScale((_xValue(d) || 0));

    // axis
    let _xAxis = d3.axisBottom(_xScale);

    // main svg
    let _svg;

    // Axis group and x axis, y axis not used
    let _xAxisGroup;

    // Chart Group - represented data
    let _chartGroup;

    // Chart title group
    let _titleGroup;
    let _clearBtnGroup;

    // Events
    let updateChart, _handleMouseMove;

    let _toggleClearBtn;

    const _handleSvgOnMouseOut = function () {
        d3.select(this).selectAll('g.' + barGroupClass)
        .style("opacity", opacityHover)
    };

    /**
     * Add svg to dom
     * Add all groups to svg and apply base transformation using margin
     * @private
     */
    function _renderSvgElements(parentId) {

        _svg = d3.select('#' + parentId).append('svg')
            .classed(svgClass, true);

        _xAxisGroup = _svg.append("g")
            .classed(xAxisClass, true);

        _chartGroup = _svg.append("g")
            .classed('chart-group', true)
            .on("mouseout", _handleSvgOnMouseOut);

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
            let cols = columns ? columns : _data.map(_yValue);

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

        // TODO add html button inside wrapper, attach only event here
        function addClearBtn() {

            let paddingLR = 10;
            let paddingTB = 4;

            _clearBtnGroup.attr("opacity", 0);
            _clearBtnGroup.on('click', _handleClear);

            let rect = _clearBtnGroup.append("rect");

            // add text to group
            let txt =_clearBtnGroup
                .append("text")
                .text('clear');

            let txtSize = txt.node().getBBox();

            let w = txtSize.width + paddingLR;
            let h = txtSize.height + paddingTB;

            rect.attr('width', w).attr('height', h);

            txt .attr("transform", "translate(" + [(w) / 2, (h) / 2 + (paddingLR / 2)] + ")");
         }

         // get bar group class - check if bar is active
        function _getBarGroupClass(d) {

            if (_activeBars.indexOf(_yValue(d)) < 0) {
                return barGroupClass;
            }
            return barGroupClass + ' ' + activeBarClass;
        }

        // returns default bar class with appended active class if id in _activeBars
        function _getBarClass(d) {
            if (_activeBars.indexOf(_yValue(d)) > -1) {
                return barsClass + ' wb-bar-active';
            }
            return barsClass;
        }

        // set size based on parent dom, used with window resize
        // hieght is not handled on resize
        function _calcSize() {
            let bounds = parent.getBoundingClientRect();

            _chart.width(bounds.width);
            _chart.height(_svgHeight);
        }


        function _calcBarVerticalBarGroupTextPosition (d, barIndex) {
            return ((barIndex + 1) * (_barHeight + barPadding))  - _barHeight + ((_barHeight - fontSize) / 2) + fontSize - barPadding;
        }

        function _calcBarVerticalBarGroupPosition (d, i) {
            return (i + 1) * (_barHeight + barPadding)  - _barHeight ;
        }

        // if new data is not set, only redraw
        updateChart = function () {

            _calcSize();
            _setScales();
            _resize();

            // select all bar groups, 1 group per bar
            let barGroups = _chartGroup.selectAll('g.' + barGroupClass)
                .data(_data, _generateBarId);

            // EXIT
            barGroups.exit().remove();

            // ENTER - add groups
            let newBarGroups = barGroups.enter().append("g")
                .attr("class", _getBarGroupClass)
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
                .attr("y", _calcBarVerticalBarGroupPosition)
                .attr("height", _barHeight)
                .attr("width", _xScaleValue);

            // UPDATE - text
            barGroups.merge(newBarGroups).select('.' + labelClass)
                .attr("y", _calcBarVerticalBarGroupTextPosition)
                .attr("x", 0)
                .text(_yValue);


            newBarGroups.exit().remove();
        };

        /**
         * Toggle clicked bar class, add / remove clicked bar from _activeBars
         * @param selection
         * @param isActive
         * @param key
         * @private
         */
        function _toggleActiveBar(selection, isActive, key) {
            console.log(_activeBars);
            console.log(selection, isActive, key);

            if (isActive === -1) {
                selection.classed(activeBarClass, true);
                _activeBars[_activeBars.length] = key;
            } else {
                selection.classed(activeBarClass, false);
                _activeBars.splice(isActive, 1);
            }
        }

        function _handleAdditionalClick(d, isActive, reset) {
            if (clickHandler && clickHandler instanceof Function) {
                clickHandler({
                    data: d,
                    name: _NAME,
                    filterValue: d[filterValueField],
                    chartType: _CHART_TYPE,
                    chartId: _ID,
                    isActive: isActive > -1,
                    reset: reset === true
                });
            }
        }

        _toggleClearBtn = function () {
            _clearBtnGroup.attr("opacity", (_activeBars.length > 0) ? 1 : 0);
        };

        function _handleClear () {
            _chart.resetActive();
            _toggleClearBtn();
            _handleAdditionalClick({}, -1, true);
        }

        /**
         * Main bar click handler
         * toggles _activeBars and calls user defined callback
         * @param d - bar data
         * @private
         */
        function _handleClick(d) {

            let barLabel = _yValue(d);
            let isActive = _activeBars.indexOf(barLabel);

            _toggleActiveBar(d3.select(this), isActive, barLabel);

            _toggleClearBtn();

            // handle click event defined in configuration
            _handleAdditionalClick(d, isActive);
        }

        _handleMouseMove = function(d) {
            // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear

            let tooltipContent = tooltipRenderer(d);
            tooltip
                .style("display", 'inline-block')
                .html(tooltipContent);

            let tooltipSize = tooltip.node().getBoundingClientRect();
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
                .selectAll('.' + barGroupClass)
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

           let txt = _svg.select('.no-data');

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

    _chart.width = function (value) {
        if (!arguments.length) {
            return _svgWidth;
        }
        _svgWidth = value;
        _width = _svgWidth - _margin.left - _margin.right;

        return _chart;
    };

    _chart.toggleClearBtn = function () {
        _toggleClearBtn();
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

        _barHeight = (_height - (( barsCnt + 1) * barPadding)) / barsCnt;

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
/*
*
*
* // setup horizontal bar chart config
                        let prepared = barChartHorizontal(chartConf)
                            .title(chartConf.title)
                            .data(chartConf.data);

                        // init horizontal bar chart
                        prepared(chartConf.parentId);

                        self.charts[chartKey] = prepared;
* */
