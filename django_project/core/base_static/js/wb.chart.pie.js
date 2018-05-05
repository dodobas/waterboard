// don not combine with donut chart, same - but different
function pieChart(options) {
    var _INIT_TIME = new Date().getTime();
    var _ID = options.parentId + '_' + _INIT_TIME;
    var _CHART_TYPE = 'PIE_CHART';
    var _NAME = options.name;

    // parent id of dom object where the chart (svg) will be appended
    var parentId = options.parentId || 'chart';

    var titleClass = options.titleClass || 'wb-chart-title wb-pie';
    var svgClass = options.svgClass || 'wb-pie-chart';
    var toolTipClass = options.toolTipClass || 'wb-pie-tooltip';
    var activeSliceClass = options.activeSliceClass || 'wb-slice-active';


    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group_id';

    var showTitle = options.showTitle || true;
    var title = options.title || 'Pie';

    var filterValueField = options.filterValueField;

    var height = options.height || 400;

    var tooltipBackgroundPadding = 2;
    var opacity = .8;
    var opacityHover = 1;
    var otherOpacityOnHover = .6;
    var tooltipMargin = 13;

    var _activeSlices = [];
    // parent width
    var _svgWidth;

    // parent height
    var _svgHeight = height;

    // chart width
    var _width;

    // chart height
    var _height;

    // pie radius
    var _radius;

    var _margin = options.margin || {
        top: 10,
        right: 7,
        bottom: 10,
        left: 7
    };

    var parent = document.getElementById(parentId);


    var _data, _slices, _dataOld, _dataNew;

    // data value helper
    var _xValue = function (d) {
        return d[valueField];
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
    var _filterValue = function (d) {
        return d.data[filterValueField];
    };

        // helper - generates id for data object based on label
    function _generateBarId(d) {

        var label = (_key(d)).replace(/[^a-z0-9]+/gi, '');
        return [_ID, label].join('_');
    }

    // arc generator functions - one for pie, one for labels
    var _arc = d3.arc();

    var _arcHover = d3.arc();

    var _pie = d3.pie().sort(null).value(_xValue);

    // var sliceColors
    var _color = d3.scaleOrdinal(d3.schemeCategory10);

    // main svg
    var _svg;
    var _chartGroup;
    var _titleGroup;
    var _legendGroup;
    var _tooltipGroup;
    var _tooltipLabelText;
    var _tooltipLabelBackGround;


    function _renderSvgElements(parentId) {
        // main svg
        // main svg
        _svg = d3.select('#' + parentId).append('svg')
            .classed(svgClass, true);

        _chartGroup = _svg.append("g").classed('chart-group', true);
        _titleGroup = _svg.append("g").classed('title-group', true);
        _legendGroup = _svg.append("g").classed('legend-group', true);
        _tooltipGroup = _svg.append("g").classed(toolTipClass, true).style("opacity", 0);
        _tooltipLabelText = _tooltipGroup.append("text");
        _tooltipLabelBackGround = _tooltipGroup.insert("rect", "text");

    }


    function _sliceColor(d, i) {
        return options.sliceColors ? options.sliceColors[_key(d)] : _color(i);
    }

    function _renderTitle() {
        if (showTitle === true && title && title !== '') {
            _titleGroup.append("text")
                .attr("class", titleClass)
                .text(title);
        }
    }

    function _updateTitle() {
        if (showTitle === true && title && title !== '') {
            _titleGroup
                .attr("x", (_width / 2) - _margin.left / 2)
                .attr("y", 0 - (_margin.top / 2));
        }
    }

    // HANDLE MOUSE EVENTS

    function _handleMouseMove(d) {
        var mousePosition = d3.mouse(this);

        var x = mousePosition[0] + _width / 2;
        var y = mousePosition[1] + _height / 2 - tooltipMargin;

        var bbox = _tooltipLabelText.node().getBBox();

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
            .style("display", "block")
            .attr('transform', 'translate(' + x + ',' + y + ')');
    }

    function _handleMouseOut(d, i) {
        _tooltipGroup
            .style("opacity", 0)
            .style("display", "none");

        _chartGroup.selectAll('path')
            .style("opacity", opacity);
    }

    function _showTooltip (d) {
        // update tooltip text
        _tooltipLabelText.text(_key(d) + _value(d));

        var bbox = _tooltipLabelText.node().getBBox();

        // update tooltip backround / rect
        _tooltipLabelBackGround
            .attr("x", bbox.x - tooltipBackgroundPadding)
            .attr("y", bbox.y - tooltipBackgroundPadding)
            .attr("width", bbox.width + (tooltipBackgroundPadding * 2))
            .attr("height", bbox.height + (tooltipBackgroundPadding * 2));
    }

    function _handleMouseOver(d) {
        // change opacity of all paths
        _chartGroup
            .selectAll('path')
            .style("opacity", otherOpacityOnHover);

        // change opacity of hovered
        d3.select(this).style("opacity", opacityHover);

        _showTooltip(d);
    }

    function _toggleActiveSlice(selection, isActive, key) {
        if (isActive === -1) {
            selection.classed(activeSliceClass, true);
            _activeSlices[_activeSlices.length] = key;
        } else {
            selection.classed(activeSliceClass, false);
            _activeSlices.splice(isActive, 1);
        }
    }

    function _handleAdditionalClick(d, isActive, reset, resetSingle) {
        if (options.clickHandler && options.clickHandler instanceof Function) {
            options.clickHandler({
                data: d,
                name: _NAME,
                filterValue: _filterValue(d),
                chartType: _CHART_TYPE,
                chartId: _ID,
                isActive: isActive > -1,
                reset: reset === true,
                resetSingle: resetSingle === true
            });
        }
    }

    function _handleClick(d) {
        var barLabel = _key(d);
        var isActive = _activeSlices.indexOf(barLabel);

        _toggleActiveSlice(d3.select(this), isActive, barLabel);
        _handleAdditionalClick(d, isActive);
    }

    // calculates the angle for the middle of a slice, used for label line and text
    function _calcSliceMidPos(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    // TWEEN HANDLERS

    function _arcTween(d) {
        var interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);

        return function (t) {
            return _arc(interpolate(t));
        };
    }

    function _arcHoverTween(d) {
        var interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);

        return function (t) {
            return _arcHover(interpolate(t));
        };
    }

    // function that calculates transition path for label and also it's text anchoring
    function _labelStyleTween(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            var d2 = interpolate(t);
            return _calcSliceMidPos(d2) < Math.PI ? 'start' : 'end';
        };
    }

    function _labelTween(d) {
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            var d2 = interpolate(t);
            // return 'translate(' + _calcSliceMidPos(d2) + ')';
            return 'translate(' + _arc.centroid(d2) + ')';
        };
    }


    function _calcSize() {
        var bounds = parent.getBoundingClientRect();
        _chart.width(bounds.width);
        _chart.height(_svgHeight);
        _chart.calcRadius();
    }

    function _setSize() {
        _svg
            .attr("width", _svgWidth)
            .attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

        _legendGroup
            .attr("width", _width)
            .attr("height", 30)
            .attr("transform", "translate(" + [0, _svgHeight / 2 + _radius] + ")");

        _titleGroup.attr("width", _width)
            .attr("height", _margin.top)
            .attr("transform", "translate(" + [_svgWidth / 2, _margin.top] + ")");

        _arc
            .outerRadius(_radius - 5)
            .innerRadius(0);

        _arcHover
            .outerRadius(_radius)
            .innerRadius(0);
    }



    function _handleLegendMouseOver(d) {
        var sliceGroupId = _generateBarId(d);
        var slice = _chartGroup.select('#' + sliceGroupId);

        slice.select('.' + 'wb-pie-arc').transition().duration(1500)
            .attrTween("d", _arcHoverTween);// .attr('d', _arcHoverTween);
    }

    function _handleLegendMouseOut(d, i) {

        var sliceGroupId = _generateBarId(d);
        var slice = _chartGroup.select('#' + sliceGroupId);

        slice.select('.' + 'wb-pie-arc').transition().duration(1500)
            .attrTween("d", _arcTween);//.attr('d', _arcTween);
    }
    // the legend is absolute positioned, some overlap could occur on small screen sizes
    function _renderLegend() {
        var legendItemSize = 12;
        var legendSpacing = 4;
        var legendMargin = 5;

        var legend = _legendGroup
            .selectAll('.legend')
            .data(_dataNew).enter()
            .append('g')
            .attr('class', 'legend')
            .on("mouseout", _handleLegendMouseOut)
            .on("mouseover", _handleLegendMouseOver);

        legend
            .append('rect')
            .attr('width', legendItemSize)
            .attr('height', legendItemSize)
            .style('fill', _sliceColor);

        var last = 0;
        legend
            .append('text')
            .attr('x', legendItemSize + legendSpacing)
            .attr('y', legendItemSize - legendSpacing)
            .text(_key);


        _legendGroup
            .selectAll('.legend').each(function (d, i) {

                var txt = d3.select(this).select('text');

                // calculate legend text width
                if (last === 0) {
                    last = txt.node().getBBox().width + legendItemSize + legendSpacing + legendMargin;
                } else {
                    d3.select(this).attr('transform', function (d) {return 'translate(' + [last, 0] + ')';});

                    last += txt.node().getBBox().width + legendItemSize + legendSpacing + legendMargin;
                }


            });

        legend.exit().remove();

    }

    function _renderLabel(d) {
        return '<tspan>' + _value(d) + '</tspan>';
    }

    function _renderPieSlices() {
        // render polyline from center of slice to text label
        _slices = _chartGroup.selectAll('.wb-pie-arc-group').data(_dataNew, _key);

        // ENTER - add groups
        var newSliceGroups = _slices.enter().append("g")
            .attr("class", "wb-pie-arc-group")
            .attr("id", _generateBarId)
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", _handleMouseOver)
            .on("click", _handleClick).each(
                function (d) {
                    this._current = d;
                });

        // enter - add slices / paths / attach events
        newSliceGroups.append('path').attr("class", "wb-pie-arc")
            .attr('fill', _sliceColor);


        newSliceGroups
            .append('text')
            .classed('wb-pie-label', true)
            .style('text-anchor', function (d) {
                // if slice centre is on the left, anchor text to start, otherwise anchor to end
                //  return (_calcSliceMidPos(d)) < Math.PI ? 'start' : 'end';
                return 'middle';
            });

        _slices.merge(newSliceGroups).select('.' + 'wb-pie-arc').attr('d', _arc).transition().duration(1500)
            .attrTween("d", _arcTween);


         _slices.merge(newSliceGroups).select('.wb-pie-label').transition().duration(1500)
            .attrTween('transform', _labelTween)
            .styleTween('text-anchor', _labelStyleTween);

        _slices.merge(newSliceGroups).select('.wb-pie-label').html(_renderLabel);

        _slices.exit().remove();

    }
    var updateChart;

    function _chart(parentId) {
        _calcSize();
        _renderSvgElements(parentId);
        _renderTitle();

        updateChart = function () {
            _calcSize();
            _setSize();
            _updateTitle();
            _renderPieSlices();
            _renderLegend();
        };

        if (_dataNew) {
            updateChart();
        }
    }

    _chart.noData = function (show) {
        if (show === true) {
            _chartGroup.selectAll("*").remove();

            var txt = _svg.select('.no-data');

            if (!txt.empty()) {

                txt.attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

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

    _chart.calcRadius = function () {
        if (!_width || !_height) {
            console.log("Parent Size not set.");
        }
        _radius = Math.min(_width - _margin.left, _height - _margin.top) / 2;
        return _chart;
    };

    _chart.radius = function (value) {
        if (!arguments.length) {
            return _radius;
        }
        _radius = value;
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
        return _chart;
    };

    _chart.data = function (newData) {
        if (!arguments.length) {
            return _data;
        }

        if (newData && newData instanceof Array) {
            _data = newData.slice(0);
            _dataNew = _pie(_data);
            _dataOld = _slices ? _slices.data() : _dataNew;

            if (typeof updateChart === 'function') {
                updateChart();

                _data.length === 0 ? _chart.noData(true) : _chart.noData(false);
            }
        }


        return _chart;
    };


    _chart.resize = function () {
        updateChart();

        return _chart;
    };

    _chart.resetActive = function () {
        _chartGroup.selectAll('.' + activeSliceClass)
            .classed(activeSliceClass, false);

        _activeSlices = [];

        return _chart;
    };

    return _chart;
}
