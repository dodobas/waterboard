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

    var _marginLeft = 7;
    var _marginRight = 7;
    var _marginTop = 10;
    var _marginBot = 10;

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

    var _pie = d3.pie().sort(null).value(_xValue);

    // var sliceColors
    var _color = d3.scaleOrdinal(d3.schemeCategory10);

    // main svg
    var _svg = d3.select('#' + parentId).append('svg').classed(svgClass, true);

    // groups
    var _chartGroup = _svg.append("g").classed('chart-group', true);
    var _titleGroup = _svg.append("g").classed('title-group', true);

    var _legendGroup = _svg.append("g").classed('legend-group', true);
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
        if (newData && newData instanceof Array) {
            _data = newData.slice(0);
            _dataNew = _pie(_data);
            _dataOld = _slices ? _slices.data() : _dataNew;
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

    // TWEEN HANDLERS

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

        _legendGroup
            .attr("width", _width)
            .attr("height", 30)
            .attr("transform", "translate(" + [0, _svgHeight / 2 + _radius] + ")");

        _titleGroup.attr("width", _width)
            .attr("height", _marginTop)
            .attr("transform", "translate(" + [_svgWidth / 2, _marginTop] + ")");

        _arc
            .outerRadius(_radius - 5)
            .innerRadius(0);


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
          .attr('class', 'legend');

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
          .selectAll('.legend').each(function(d, i) {
              var txt = d3.select(this).select('text');

              if (last === 0) {
                  last = txt.node().getBBox().width + legendItemSize + legendSpacing + legendMargin;
              } else {
                  d3.select(this).attr('transform', function (d) {
                    return 'translate(' + [last, 0]  + ')';
                  });
                  last += txt.node().getBBox().width + legendItemSize + legendSpacing + legendMargin;
              }


        });

        legend.exit().remove();

    }

    function _renderLabel (d) {
        return '<tspan>' +  _value(d) + '</tspan>';
    }

    // render polyline from center of slice to text label
var  _labelText;
    function _renderPieSlices() {

        _slices = _chartGroup.selectAll('.wb-pie-arc').data(_dataNew, _key);
        _labelText = _chartGroup.selectAll('text').data(_dataNew, _key);


                 // EXIT
        // removes slices/labels/lines that are not in the current dataset
         _slices
             .exit()
            .transition()
            .duration(500)
             .attrTween("d", _arcTween).remove();


        _labelText.exit()
            .transition()
            .duration(1500)
            .attrTween('transform', _labelTween)
        .styleTween('text-anchor', _labelStyleTween)
            .remove();

        // enter - add slices / paths / attach events
        _slices
            .enter()
            .append('path')

            .attr('fill', _sliceColor)
            .attr('d', _arc)
            .attr("class", "wb-pie-arc")
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("mouseover", _handleMouseOver)
            .on("click", _handleSliceClick).each(function(d) { this._current = d; });


        _labelText
            .enter()
            .append('text')
            .attr('transform', function (d) {
                return 'translate(' + _arc.centroid(d)  + ')';
            })
            .html(_renderLabel)
            .style('text-anchor', function (d) {
                // if slice centre is on the left, anchor text to start, otherwise anchor to end
              //  return (_calcSliceMidPos(d)) < Math.PI ? 'start' : 'end';
                return 'middle';
            }).each(function(d) { this._current = d; });





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
