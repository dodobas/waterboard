// TODO refactor - follow v4 guidelines
function lineChart(options) {
    var _INIT_TIME = new Date().getTime();
    var _ID = (options.parentId || '') + '_' + _INIT_TIME;
    var _CHART_TYPE = 'LINE_CHART';
    var _NAME = options.name || 'line-chart';


    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'ts';


    function _xValue(d) {
        return d[labelField];
    }

    function _yValue(d) {
        return d[valueField];
    }

    var data = options.data;

    var parentId = options.parentId || '#chart';
    var svgClass = options.svgClass;

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    };

    var parentSize;
    var height = options.height || 460;

    var parent = document.getElementById(parentId);


    // main svg
    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    var _chartGroup = svg.append("g").classed('chart-group', true);

    var _axisGroup = svg.append("g").classed('axis-group', true);

    var _xAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--x');
    var _yAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--x');

    var _line = _chartGroup.append('path');
    var _dotGroup = _chartGroup.append('g');


    var _svgWidth, _svgHeight = height, _width = options.width || 920;

    var _height = height - margin.top - margin.bottom;


    // Chart Group - represented data


    var _setSize = function () {
        parentSize = parent.getBoundingClientRect();

        _svgWidth = parentSize.width;

        _width = _svgWidth - margin.left - margin.right;
console.log('heigth', _height);
        //_height = _svgHeight - margin.top - margin.bottom;

        svg.attr('width', _svgWidth).attr("height", _svgHeight);

        _axisGroup
            .attr("width", _svgWidth)
            .attr("height", _svgHeight)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")");

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")");

        _dotGroup
            .attr("width", _width)
            .attr("height", _height);

    };


    var parseTime = d3.isoParse;
    var hoverFormat = d3.timeFormat("%Y-%m-%d %d:%H:%M");
    var hoverTransition = d3.transition().ease(d3.easeLinear);
    var dotRadius = 6;

    var bisectDate = d3.bisector(function (d) {
        return d.ts;
    }).left;

    var xScale = d3.scaleTime();
    var yScale = d3.scaleLinear();
    var _xAxis = d3.axisBottom(xScale);
    var _yAxis = d3.axisLeft(yScale);

    data.forEach(function (d) {
        d.ts = parseTime(d.ts);
        d.value = +d.value;
    });


    function _setScales () {
        xScale
            .rangeRound([0, _width])
            .domain(d3.extent(data, function (d) {
                return d.ts;
            }));

        yScale
            .rangeRound([_height, 0])
            .domain([d3.min(data, function (d) {
                return d.value;
            }) / 1.005, d3.max(data, function (d) {
                return d.value;
            }) * 1.005]);

        line = d3.line()
            .x(function (d) {
                return xScale(d.ts);
            })
            .y(function (d) {
                return yScale(d.value);
            });
    };


    var _addAxis = function () {
        _xAxisGroup
            .attr('transform', 'translate(0,' + _height + ')')
            .call(_xAxis.tickFormat(d3.timeFormat("%Y-%m-%d")));

        _yAxisGroup
            .call(_yAxis.ticks(6).tickFormat(function (d) {
                return parseInt(d);
            }))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .attr("fill", "#5D6971")
            .text((options.yLabel || ''));

    };

    function _addLine() {
        _line.datum(data)
            .attr("class", "line")
            .attr("d", line);
    }

    var _focusGroup = _chartGroup.append("g")
        .attr("class", "focus")
        .style("display", "none");

    var lineHelper = svg.append("rect");
    var _setHoverLine = function () {
        _focusGroup.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", _height);

        _focusGroup.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", _width)
            .attr("x2", _width);

        _focusGroup.append("circle")
            .attr("r", 7.5);

        _focusGroup.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");

        console.log(_width, _height, margin);
        lineHelper
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "overlay")
            .attr("width", _width)
            .attr("height", _height)
            .attr("y", 0)
            .on("mouseover", function () {
                _focusGroup.style("display", null);
            })
            .on("mouseout", function () {
                _focusGroup.style("display", "none");
            })
            .on("mousemove", mousemove);
    };

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]);
        var i = bisectDate(data, x0, 1);
        var d0 = data[i - 1];
        var d1 = data[i];
        var d = x0 - d0.ts > d1.ts - x0 ? d1 : d0;

        _focusGroup.attr("transform", "translate(" + xScale(d.ts) + "," + yScale(d.value) + ")");
        _focusGroup.select("text").text(function () {
            var ts = hoverFormat(d.ts);

            // label format
            return ts + "val: " + d.value;
        });
        _focusGroup.select(".x-hover-line").attr("y2", _height - yScale(d.value));
        _focusGroup.select(".y-hover-line").attr("x2", _width + _width);
    }

    function _dotOnClickHandler(d) {
        console.log('data:', d);
    }

    function _handleMouseEnter() {
        d3.select(this)
            .interrupt()
            .transition(hoverTransition)
            .duration(300)
            .attr('r', dotRadius * 2);
    }

    function _handleMouseLeave() {
        d3.select(this)
            .interrupt()
            .transition(hoverTransition)
            .duration(300)
            .attr('r', dotRadius);
    }


    var _initDots = function () {

        var dots = _dotGroup.selectAll('.wb-line-chart-dot')
            .data(data);

        dots
            .enter()
            .append('circle')
            .attr('r', dotRadius)
            .attr('cx', function (d) {
                return xScale(d.ts);
            })
            .attr('cy', function (d) {
                return yScale(d.value);
            })

            .attr('class', 'wb-line-chart-dot')
            .on('click', _dotOnClickHandler)
            .on('mouseenter', _handleMouseEnter)
            .on('mouseleave', _handleMouseLeave);

        dots
            .attr('cx', function (d) {
                return xScale(d.ts);
            })
            .attr('cy', function (d) {
                return yScale(d.value);
            });
        //  dots.exit().remove();
    };


    var _draw = function () {
        _setSize();
        _setScales();
        _addAxis();
        _addLine();
        _setHoverLine();
        _initDots();
    };

    function _resize() {
        _draw();
    }

    _draw();

    return {
        draw: _draw,
        resize: _resize,
        chart: svg
    };
}
