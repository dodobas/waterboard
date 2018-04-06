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
    var _marginTop = calculatedMargins._marginTop;
    var _marginBot = calculatedMargins._marginBot;

    const parent = document.getElementById(parentId);

    // data value helper
    var _xValue = function (d) {
        return d[valueField]
    };
    var _yLabel = function (d) {
        return d[labelField];
    };
    var _value = function (d) {
        return d.data[valueField];
    };
    var _key = function (d) {
        return d.data[labelField];
    };


    // main svg
    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    // groups
    const _chartGroup = svg.append("g").classed('chart-group', true);
    const _titleGroup = svg.append("g").classed('title-group', true);
    const _tooltipGroup = svg.append("g").classed(toolTipClass, true).style("opacity", 0);

    var _labelLineGroup = svg.append('g').classed('wb-pie-label-lines', true);

    // helper fncs
    var _arc;
    var _labelArc;
    var _outerArc;

    const _pie = d3.pie().sort(null).value(_xValue);
    const _color = d3.scaleOrdinal(d3.schemeCategory10);

    var _sliceColor = function (d, i) {
        return _color(i);
    };

    function _renderTitle () {
        if (showTitle === true && title && title !== '') {
            _titleGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("class", titleClass)
                .style("text-decoration", "underline")
                .text(title);
        }
    }
    function _updateTitle () {
        if (showTitle === true && title && title !== '') {
            _titleGroup
                .attr("x", (_width / 2) - _marginLeft / 2)
                .attr("y", 0 - (_marginTop / 2));
        }
    }

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

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot; //bounds.height - _marginTop - _marginBot;

        svg.attr("width", _svgWidth).attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

        _labelLineGroup
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

        _labelArc = d3.arc()
            .outerRadius(_radius / 2)
            .innerRadius(_radius / 2);

        _outerArc = d3.arc()
                .outerRadius(_radius )
                .innerRadius(_radius );




    }

    function _innerLabelsTransform (d) {
        return "translate(" + _labelArc.centroid(d) + ")";
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
    var tooltipBackgroundPadding = 2;
    var opacity = .8;
    var opacityHover = 1;
    var otherOpacityOnHover = .6;
    var tooltipMargin = 13;

    // the legend is absolute positioned, some overlap could occur on small screen sizes
    function _renderLegend () {
        // add legend
        var keys = _legend.selectAll('.wb-legend-row')
            .data(_data)
            .enter().append('div')
            .attr('class', 'wb-legend-row');

        keys.append('div')
            .attr('class', 'legend-symbol')
            .style('background-color', _sliceColor);

        keys.append('div')
            .attr('class', 'legend-label')
            .text(_yLabel);

        keys.exit().remove();
    }
// calculates the angle for the middle of a slice
    function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

    function _renderLabels () {
        // add text labels
            var label = _labelLineGroup.selectAll('text')
                .data(_pie(_data))
              .enter().append('text')
                .attr('dy', '.35em')
                .html(function(d) {
                    // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                    return '<tspan>' + _key(d) + '(' + _value(d) + ')</tspan>';
                })
                .attr('transform', function(d) {

                    // effectively computes the centre of the slice.
                    // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                    var pos = _outerArc.centroid(d);

                    // changes the point to be on left or right depending on where label is.
                    pos[0] = _radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });


        var polyline = _labelLineGroup
                .selectAll('polyline')
                .data(_pie(_data))
              .enter().append('polyline')
                .attr('points', function(d) {

                    // see label transform function for explanations of these three lines.
                    var pos = _outerArc.centroid(d);
                    pos[0] = _radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    console.log(pos, pos[0]);
                    return [(_arc.centroid(d) +25), _outerArc.centroid(d) + 25, pos]
                });
    }
    function _renderPie () {

         // JOIN / ENTER
        var elements = _chartGroup.selectAll('.wb-pie-arc')
            .data(_pie(_data), _key)
            .enter()
            .append('g')
            .attr("class", "wb-pie-arc");

        // UPDATE
        elements
            .transition()
            .duration(1500)
            .attrTween("d", _arcTween);

        // add slices / paths
        elements
            .append('path')
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", function (d) {
                // change opacity of all paths
                _chartGroup.selectAll('path')
                    .style("opacity", otherOpacityOnHover);

                // change opacity of hovered
                d3.select(this)
                    .style("opacity", opacityHover);

                // add tooltip text to tooltip group
                var text = _tooltipGroup
                    .append("text")
                    .text(_key(d) + _value(d));


                var bbox = text.node().getBBox();

                // insert tooltip backround
                _tooltipGroup.insert("rect", "text")
                    .attr("x", bbox.x - tooltipBackgroundPadding)
                    .attr("y", bbox.y - tooltipBackgroundPadding)
                    .attr("width", bbox.width + (tooltipBackgroundPadding * 2))
                    .attr("height", bbox.height + (tooltipBackgroundPadding * 2));
            })
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
    }
    function _renderChart(newData) {
        _data = newData ? newData : _data;
        _setSize();
        // update title position
        _updateTitle();
        _renderPie();
        _renderLegend();
        _renderLabels();
    }

    _renderTitle();
    _renderChart(data);

    function _resize() {
        _renderChart();
    }

    return {
        updateChart: _renderChart,
        resize: _resize,
        renderLabels: _renderLabels,
        chart: svg
    };
}
