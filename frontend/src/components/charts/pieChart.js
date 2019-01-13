// don not combine with donut chart, same - but different
export default function pieChart(options) {
    let _INIT_TIME = new Date().getTime();

    let _CHART_TYPE = 'PIE_CHART';




    let {
        name,
        data,
        filterValueField = 'group',
        valueField = 'cnt',
        labelField = 'group_id',
        parentId = 'chart',
        titleClass = 'wb-chart-title wb-pie',
        labelClass = 'wb-pie-label',
        svgClass = 'wb-pie-chart',
        toolTipClass = 'wb-pie-tooltip',
        sliceClass = 'wb-pie-arc',
        activeSliceClass = 'wb-slice-active',
        showTitle = true,
        title,
        sliceColors,
        opacityHover = 1,
        otherOpacityOnHover = .6,
        height = 400,

        margin,
        tooltipBackgroundPadding = 2,
        opacity = .8,
        tooltipMargin = 13
    } = options;


    let _NAME = name;
    let _ID = parentId + '_' + _INIT_TIME;

    let _activeSlices = [];
    // parent width
    let _svgWidth;

    // parent height
    let _svgHeight = height;

    // chart width
    let _width;

    // chart height
    let _height;

    // pie radius
    let _radius;

    let _margin = margin || {
        top: 10,
        right: 7,
        bottom: 10,
        left: 7
    };

    let parent = document.getElementById(parentId);


    let _data, _slices, _dataOld, _dataNew;

    // data value helper
    let _xValue = (d) => d[valueField];

    let _value = (d) => d.data[valueField];

    let _key = (d) => d.data[labelField];

    let _filterValue = (d) =>  d.data[filterValueField];

        // helper - generates id for data object based on label
    function _generateSliceId(d) {

        let label = (_key(d)).replace(/[^a-z0-9]+/gi, '');
        return [_ID, label].join('_');
    }

    // arc generator functions - one for pie, one for labels
    let _arc = d3.arc();

    let _arcHover = d3.arc();

    let _pie = d3.pie()
        .sort(null)
        .value(_xValue);

    // let sliceColors
    let _color = d3.scaleOrdinal(d3.schemeCategory10);

    // main svg
    let _svg;
    let _chartGroup;
    let _titleGroup;
    let _legendGroup;
    let _tooltipGroup;
    let _tooltipLabelText;
    let _tooltipLabelBackGround;


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
        return sliceColors ? sliceColors[_key(d)] : _color(i);
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
        let mousePosition = d3.mouse(this);

        let x = mousePosition[0] + _width / 2;
        let y = mousePosition[1] + _height / 2 - tooltipMargin;

        let bbox = _tooltipLabelText.node().getBBox();

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
        _tooltipLabelText.text(_key(d) + ' ' +  _value(d));

        // get updated tooltip text size
        let bbox = _tooltipLabelText.node().getBBox();

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

    function _handleAdditionalClick(d, isActive, reset) {
        if (options.clickHandler && options.clickHandler instanceof Function) {
            options.clickHandler({
                data: d,
             //   name: _NAME,
                filterValue: _filterValue(d),
           //     chartType: _CHART_TYPE,
                // chartId: _ID,
                isActive: isActive > -1,
                reset: reset === true, // reset akk slices
            });
        }
    }

    function _handleClick(d) {

        let barLabel = _key(d);
        let isActive = _activeSlices.indexOf(barLabel);

        let id = _generateSliceId(d);

        let slice = _chartGroup.select('#' + id);

        _toggleActiveSlice(slice, isActive, barLabel);
        _handleAdditionalClick(d, isActive);
    }

    // calculates the angle for the middle of a slice, used for label line and text
    function _calcSliceMidPos(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    // TWEEN HANDLERS

    function _arcTween(d) {
        let interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);

        return function (t) {
            return _arc(interpolate(t));
        };
    }

    function _arcHoverTween(d) {
        let interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);

        return function (t) {
            return _arcHover(interpolate(t));
        };
    }

    // function that calculates transition path for label and also it's text anchoring
    function _labelStyleTween(d) {
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            let d2 = interpolate(t);
            return _calcSliceMidPos(d2) < Math.PI ? 'start' : 'end';
        };
    }

    function _labelTween(d) {
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            let d2 = interpolate(t);
            // return 'translate(' + _calcSliceMidPos(d2) + ')';
            return 'translate(' + _arc.centroid(d2) + ')';
        };
    }


    function _calcSize() {
        let bounds = parent.getBoundingClientRect();
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
            .attr("transform", "translate(" + [0, _svgHeight / 2 + _radius - 3] + ")");

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
        _chartGroup.select('#' + (_generateSliceId(d)))
            .select(`.${sliceClass}`)
            .transition()
            .duration(1500)
            .attrTween("d", _arcHoverTween);// .attr('d', _arcHoverTween);
    }

    function _handleLegendMouseOut(d, i) {

        _chartGroup.select('#' + ( _generateSliceId(d)))
            .select(`.${sliceClass}`)
            .transition()
            .duration(1500)
            .attrTween("d", _arcTween);//.attr('d', _arcTween);
    }
    // the legend is absolute positioned, some overlap could occur on small screen sizes
    function _renderLegend() {
        let legendItemSize = 12;
        let rectSize = legendItemSize * 1.5;

        let legendSpacing = 5;
        let legendMargin = 5;

        let legend = _legendGroup
            .selectAll('.legend')
            .data(_dataNew).enter()
            .append('g')
            .attr('class', 'legend')
            .on("mouseout", _handleLegendMouseOut)
            .on("mouseover", _handleLegendMouseOver)
            .on("click", _handleClick);

        legend
            .append('rect')
            .attr('width', rectSize)
            .attr('height', rectSize)
            .style('fill', _sliceColor);

        // key i value
        let last = 0;
        legend
            .append('text')
            .classed('pie-legend-label', true)
            .attr('x', rectSize + legendSpacing)
            .attr('y', legendSpacing)
            .text(_key);

        legend
            .append('text')
            .classed('pie-legend-value', true)
            .attr('x', rectSize + legendSpacing)
            .attr('y', legendItemSize + legendSpacing)
            .text(_value);


        _legendGroup
            .selectAll('.legend').each(function (d, i) {

                let txt = (d3.select(this).select('text.pie-legend-label').node().getBBox().width) + rectSize + legendSpacing + legendMargin;
                let val = (d3.select(this).select('text.pie-legend-value').node().getBBox().width) + rectSize + legendSpacing + legendMargin;

                let size = txt >= val ? txt : val;

                // calculate legend text width
                if (last === 0) {
                    last = size;
                } else {
                    d3.select(this).attr('transform', function (d) {
                        return 'translate(' + [last, 0] + ')';
                    });

                    last += size;
                }


            });

        legend.exit().remove();

    }

    function _renderLabel(d) {
        let val = _value(d);
        return val < 1000 ? '' : val;
    }

    function _renderPieSlices() {
        // render polyline from center of slice to text label
        _slices = _chartGroup.selectAll('.wb-pie-arc-group').data(_dataNew, _key);

        // ENTER - add groups
        let newSliceGroups = _slices.enter().append("g")
            .attr("class", "wb-pie-arc-group")
            .attr("id", _generateSliceId)
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", _handleMouseOver)
            .on("click", _handleClick).each(
                function (d) {
                    this._current = d;
                });

        // enter - add slices / paths / attach events
        newSliceGroups.append('path').attr("class", sliceClass)
            .attr('fill', _sliceColor);


        newSliceGroups
            .append('text')
            .classed(labelClass, true)
            .style('text-anchor', function (d) {
                // if slice centre is on the left, anchor text to start, otherwise anchor to end
                //  return (_calcSliceMidPos(d)) < Math.PI ? 'start' : 'end';
                return 'middle';
            });

        _slices.merge(newSliceGroups).select(`.${sliceClass}`)
            .attr('d', _arc)
            .transition().duration(1500)
            .attrTween("d", _arcTween);


         _slices.merge(newSliceGroups).select(`.${labelClass}`)
             .transition().duration(1500)
            .attrTween('transform', _labelTween)
            .styleTween('text-anchor', _labelStyleTween);

        _slices.merge(newSliceGroups).select(`.${labelClass}`).html(_renderLabel);

        _slices.exit().remove();

    }
    let updateChart;

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

            let txt = _svg.select('.no-data');

            let transformStr = "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")";

            if (!txt.empty()) {
                txt.attr("transform", transformStr);
                return _chart;
            }

            _svg.append("text").attr("class", 'no-data')
                .attr("transform", transformStr)
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
            // _.orderBy(_data, 'cnt', 'desc')
            _data =_.orderBy(newData, valueField, 'desc');
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
