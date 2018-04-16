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
    var activeSliceClass =  options.activeSliceClass ||'wb-slice-active';


    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group_id';

    var showTitle = options.showTitle || true;
    var title = options.title || 'Pie';

    var filterValueField = options.filterValueField;

    var height = options.height || 400;

    var _legend = d3.select('#' + parentId).append('div')
        .attr('class', 'wb-pie-legend');



    var tooltipBackgroundPadding = 2;
    var opacity = .8;
    var opacityHover = 1;
    var otherOpacityOnHover = .6;
    var tooltipMargin = 13;

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

    var _marginLeft = 15;
    var _marginRight = 15;
    var _marginTop = 15;
    var _marginBot = 20;

    var parent = document.getElementById(parentId);


    var _data, _slices, _dataOld , _dataNew;

    // data value helper
    var _xValue = function (d) {return d[valueField];};
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

    // arc generator functions - one for pie, one for labels
    var _arc = d3.arc();
    var _outerArc = d3.arc();

    var _pie = d3.pie().sort(null).value(_xValue);

    // var sliceColors
    var _color = d3.scaleOrdinal(d3.schemeCategory10);

    // main svg
    var _svg = d3.select('#' + parentId).append('svg').classed(svgClass, true);

    // groups
    var _chartGroup = _svg.append("g").classed('chart-group', true);
    var _titleGroup = _svg.append("g").classed('title-group', true);

    var _tooltipGroup = _svg.append("g").classed(toolTipClass, true).style("opacity", 0);
    var _tooltipLabelText = _tooltipGroup.append("text");
    var _tooltipLabelBackGround = _tooltipGroup.insert("rect", "text");


    function _generateBarId(d) {

        var label = (_yLabel(d)).replace(/[^a-z0-9]+/gi,'');
        return [_ID,label].join('_');
    }
    function _sliceColor(d, i) {
        return options.sliceColors ?  options.sliceColors[_key(d)] :_color(i);
    }

    // set new pie data, store current pie data as _dataOld used for transformations
    function _setData(newData) {
        console.log('_slices', _slices);
        if (newData && newData instanceof Array) {
            _data = newData.slice(0);
            _dataNew = _pie(_data);
            _dataOld = _slices ? _slices.data() : _dataNew; //(_data || newData).slice(0);
        }
        return _data;
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
                .attr("x", (_width / 2) - _marginLeft / 2)
                .attr("y", 0 - (_marginTop / 2));
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

    function _handleMouseOver(d) {
        // change opacity of all paths
        _chartGroup
            .selectAll('path')
            .style("opacity", otherOpacityOnHover);

        // change opacity of hovered
        d3.select(this).style("opacity", opacityHover);

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

    function _toggleActiveBar (slicebj, isActive, key, d) {
        if (isActive === -1) {
           slicebj.classed(activeSliceClass, true);
            _activeBars[_activeBars.length] = key;
        } else {
            _chartGroup.select('#' +  _generateBarId(d)).classed(activeSliceClass, false);
            _activeBars.splice(isActive, 1);
        }
    }


    function _handleSliceClick (d) {
        if (options.clickHandler && options.clickHandler instanceof Function) {

            console.log(d, filterValueField);
            options.clickHandler({
                data: d,
                name: _NAME,
                filterValue: _filterValue(d),
                chartType: _CHART_TYPE,
                chartId: _ID
            });
        }
    }

    // calculates the angle for the middle of a slice, used for label line and text
    function _calcSliceMidPos(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    // computes the centre of the slice
    function _calcLabelPos(d) {
        var pos = _arc.centroid(d);

        // changes the point to be on left or right depending on where label is
        pos[0] = _radius * 0.95 * (_calcSliceMidPos(d) < Math.PI ? 1 : -1);

        return pos;
    }

    // TWEEN HANDLERS

    function _pointTween(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);
        return function(t){
            var d2  = interpolate(t);

            return [_arc.centroid(d2), _outerArc.centroid(d2), _calcLabelPos(d)];
        };
    }

    function _arcTween(d) {
        var interpolate = d3.interpolate(this._current, d);

        this._current = interpolate(0);

        return function (t) {
            return _arc(interpolate(t));
        };
    }

    // function that calculates transition path for label and also it's text anchoring
    function _labelStyleTween(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t){
            var d2 = interpolate(t);
            return _calcSliceMidPos(d2) < Math.PI ? 'start':'end';
        };
    }

    function _labelTween(d) {
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t){
            var d2  = interpolate(t);
           // return 'translate(' + _calcSliceMidPos(d2) + ')';
            return 'translate(' +  _arc.centroid(d2) + ')';
        };
    }
    function _findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = _findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
            : (d = _findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
                : null;
    }
    // Find the element in data0 that joins the highest preceding element in data1.
    function _findPreceding(i, data0, data1, key) {
        var m = data0.length;
        while (--i >= 0) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }
    // Find the element in data0 that joins the lowest following element in data1.
    function _findFollowing(i, data0, data1, key) {
        var n = data1.length, m = data0.length;
        while (++i < n) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }



    function _calcSize () {
        var bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot;

        _radius = Math.min(_width - _marginLeft, _height - _marginTop) / 2;
    }

    function _setSize() {
        _calcSize();

        _svg
            .attr("width", _svgWidth)
            .attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

        _titleGroup.attr("width", _width)
            .attr("height", _marginTop)
            .attr("transform", "translate(" + [_svgWidth / 2, _marginTop] + ")");

        _arc
            .outerRadius(_radius)
            .innerRadius(0);

        _outerArc
            .outerRadius(_radius)
            .innerRadius(_radius);
    }

    function _arcNeighborCb (d, i) {
        this._current = _findNeighborArc(i, _dataOld, _dataNew, _yLabel) || d;
    }

    // the legend is absolute positioned, some overlap could occur on small screen sizes
    function _renderLegend() {
        // add legend
        var keys = _legend.selectAll('.wb-legend-row')
            .data(_dataNew)
            .enter().append('div')
            .attr('class', 'wb-legend-row');

        keys.append('div')
            .attr('class', 'legend-symbol')
            .style('background-color', _sliceColor);

        keys.append('div')
            .attr('class', 'legend-label')
            .text(_key);

        keys.exit().remove();
    }

    function _renderLabel (d) {
        return '<tspan>' +  _value(d) + '</tspan>';
    }

    // render polyline from center of slice to text label
var  _labelText;
    function _renderPieSlices() {

        _slices = _chartGroup.selectAll('.wb-pie-arc').data(_dataNew, _key);
        _labelText = _chartGroup.selectAll('text').data(_dataNew, _key);


        // enter - add slices / paths / attach events
        _slices
            .enter()
            .append('path')
            .each(_arcNeighborCb)
            .attr('fill', _sliceColor)
            .attr('d', _arc)
            .attr("class", "wb-pie-arc")
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", _handleMouseOver)
            .on("click", _handleSliceClick);


        _labelText
            .enter()
            .append('text')
            .attr('transform', function (d) {
                return 'translate(' + _arc.centroid(d)  + ')';
            })
     //       .each(_arcNeighborCb)
            .html(_renderLabel)

            .style('text-anchor', function (d) {
                // if slice centre is on the left, anchor text to start, otherwise anchor to end
              //  return (_calcSliceMidPos(d)) < Math.PI ? 'start' : 'end';
                return 'middle';
            });


         // EXIT
        // removes slices/labels/lines that are not in the current dataset
         _slices
             .exit()
            .transition()
            .duration(500) .attrTween("d", _arcTween).remove();


        _labelText
            .exit()
            .remove();


        // UPDATE

        // animates the transition from old angle to new angle for slices/lines/labels
        _slices.transition().duration(1500)
            .attrTween("d", _arcTween);


        _labelText.transition().duration(1500)
            .attrTween('transform', _labelTween)
            .styleTween('text-anchor', _labelStyleTween);


        _labelText.html(_renderLabel);
    }


    function _renderChart(newData) {
        _setData(newData);

        _setSize();
        _updateTitle();
        _renderPieSlices();
        _renderLegend();
    }

    _renderTitle();
    _renderChart(options.data || []);

    function _resize() {
        _renderChart();
    }

    function _getInfo () {
        return {
            _data: _data,
            _newData: _dataNew
        }
    }
    return {
        info: _getInfo,
        updateChart: _renderChart,
        data: _renderChart,
        resize: _resize,
        chart: _svg
    };
}
