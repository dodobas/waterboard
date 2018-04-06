// don not combine with donut chart, same - but different
function pieChart(options) {
    const _INIT_TIME = new Date().getTime();
    const _ID = options.parentId + '_' + _INIT_TIME;
    const _CHART_TYPE = 'PIE_CHART';
    const _NAME = options.name;

    var data = options.data || [];
    var parentId = options.parentId || 'chart';
    var titleClass = options.titleClass || 'wb-chart-title';
    var svgClass = options.svgClass;
    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group_id';
    var height = options.height || 400;
    var showTitle = options.showTitle || true;
    var title = options.title || 'Pie';
    var toolTipClass = options.toolTipClass || 'wb-pie-tooltip';

    var clickHandler = options.clickHandler;
    var filterValueField = options.filterValueField;
    var defaultMargin = {
        top: 40,
        right: 20,
        bottom: 30,
        left: 60
    };
    var _legend = d3.select('#' + parentId).append('div')
        .attr('class', 'wb-pie-legend');


    var _svgWidth, _svgHeight = height, _width, _height;
    var _data = data.slice(0);
    var _radius = height;

    var calculatedMargins = calcMargins(
        false, showTitle, defaultMargin
    );

    var _marginLeft = calculatedMargins._marginLeft;
    var _marginRight = calculatedMargins._marginRight;
    var _marginTop = 20;
    var _marginBot = calculatedMargins._marginBot;

    const parent = document.getElementById(parentId);

    // data value helper
    const _xValue = function (d) {
        return d[valueField]
    };
    const _yValue = function (d) {
        return d[labelField];
    };

    const _key = function (d) {
        return d.data[labelField]
    };


    // main svg
    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    // groups
    const _chartGroup = svg.append("g").classed('chart-group', true);
    const _titleGroup = svg.append("g").classed('title-group', true);
    const _tooltipGroup = svg.append("g").classed(toolTipClass, true).style("opacity", 0);

    if (showTitle === true && title && title !== '') {
        _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);
    }

    // helper fncs
    var _arc;

    const _pie = d3.pie().sort(null).value(_xValue);
    const _color = d3.scaleOrdinal(d3.schemeCategory10);
    var _sliceColor = function (d, i) {
        return _color(i);
    };

    function _handleMouseMove(d) {
        var mousePosition = d3.mouse(this);

        var x = mousePosition[0] + _width / 2;
        var y = mousePosition[1] + _height / 2 - tooltipMargin;

        var text = _tooltipGroup.select('text');

        var bbox = text.node().getBBox();
        if (x - bbox.width / 2 < 0) {
            x = bbox.width / 2;
        }
        else if (_width - x - bbox.width / 2 < 0) {
            x = _width - bbox.width / 2;
        }

        if (y - bbox.height / 2 < 0) {
            y = bbox.height + tooltipMargin * 2;
        }
        else if (_height - y - bbox.height / 2 < 0) {
            y = _height - bbox.height / 2;
        }

        _tooltipGroup
            .style("opacity", 1)
            .attr('transform', 'translate(' + x + ',' + y + ')');
    }

    function _handleMouseOut(d, i) {
        _tooltipGroup.selectAll('*').remove();
        _chartGroup.selectAll('path')
            .style("opacity", opacity);
    }

    function _setSize() {
        const bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;
        //      _svgHeight = 400; //bounds.height ;//

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot; //bounds.height - _marginTop - _marginBot;

        svg.attr("width", _svgWidth).attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

        _titleGroup.attr("width", _width)
            .attr("height", _marginTop)
            .attr("transform", "translate(" + [_svgWidth / 2, _marginTop] + ")");

        _radius = Math.min(_width - _marginLeft, _height - _marginTop) / 2;

        _arc = d3.arc()
            .outerRadius(_radius)
            .innerRadius(0);
    }

    function _arcTween(a) {
        var i = d3.interpolate(this._current, a);

        this._current = i(0);

        return function (t) {
            return _arc(i(t));
        };
    }

    var thickness = 40;
    var duration = 750;
    var padding = 10;
    var opacity = .8;
    var opacityHover = 1;
    var otherOpacityOnHover = .6;
    var tooltipMargin = 13;

    function _renderChart(newData) {

        _data = newData ? newData : _data;

        _setSize();

        // update title position
        if (showTitle === true && title && title !== '') {
            _titleGroup
                .attr("x", (_width / 2) - _marginLeft / 2)
                .attr("y", 0 - (_marginTop / 2));
        }

        // JOIN
        var elements = _chartGroup.selectAll('.wb-pie-arc')
            .data(_pie(_data), _key);


        // UPDATE
        elements
            .transition()
            .duration(1500)
            .attrTween("d", _arcTween);

        // ENTER
        elements
            .enter()
            .append('path')
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", function (d) {
                _chartGroup.selectAll('path')
                    .style("opacity", otherOpacityOnHover);

                d3.select(this)
                    .style("opacity", opacityHover);

                var text = _tooltipGroup
                    .append("text")
                    .text(d.data[labelField] + d.data[valueField]);

                // var text = _tooltipGroup.select("text");
                var bbox = text.node().getBBox();
                var padding = 2;

                _tooltipGroup.insert("rect", "text")
                    .attr("x", bbox.x - padding)
                    .attr("y", bbox.y - padding)
                    .attr("width", bbox.width + (padding * 2))
                    .attr("height", bbox.height + (padding * 2));
            })
            .attr("class", "wb-pie-arc")
            .attr('d', _arc)
            .attr('fill', _sliceColor)
            .on("click", function (d) {
                if (clickHandler && clickHandler instanceof Function) {
                    clickHandler({
                        data: d,
                        name: _NAME,
                        filterValue: d.data[filterValueField],
                        chartType: _CHART_TYPE,
                        chartId: _ID
                    });
                }
            })
            .each(function (d, i) {
                this._current = d;
            });


        elements.exit().remove();

        var keys = _legend.selectAll('.wb-legend-row')
            .data(_data)
            .enter().append('div')
            .attr('class', 'wb-legend-row');

        keys.append('div')
            .attr('class', 'legend-symbol')
            .style('background-color', _sliceColor);

        keys.append('div')
            .attr('class', 'legend-label')
            .text(_yValue);

        keys.exit().remove();


    }

    _renderChart(data);

    function _resize() {
        _renderChart();
    }

    return {
        updateChart: _renderChart,
        resize: _resize,
        chart: svg
    };
}
