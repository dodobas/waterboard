function pushDates(difference, end, format, asDateObject) {
    const arr = [];
    let i = 0;

    if (asDateObject === true) {
        for (i = 0; i < difference; i += 1) {
            arr.push(end.subtract(1, 'd').toDate());

        }
    } else {
        for (i = 0; i < difference; i += 1) {
            arr.push(end.subtract(1, 'd').format(format));
        }
    }


    return arr;
}

function range(startDate, endDate, dateFormat, ascending, asDateObject) {
    let dates = [];
    ascending = ascending || false;

    // let start = moment(new Date(startDate));
    // let end = moment(new Date(endDate));
    let start = moment(startDate);
    let end = moment(endDate);

    let difference = end.diff(start, 'days');

    if (!start.isValid() || !end.isValid() || difference <= 0) {
        throw Error("Invalid dates specified. Please check format and or make sure that the dates are different");
    }

    if (asDateObject === true) {
        dates.push(end.toDate());
    } else {
        dates.push(end.format(dateFormat));
    }


    dates = dates.concat(pushDates(difference, end, dateFormat, asDateObject));

    if (ascending) {
        return dates.reverse();
    }

    return dates;
}

// TODO refactor - follow v4 guidelines
export default function lineChart(options) {

    let {
        parentId = 'chart',
        valueField = 'value',
        labelField = 'ts',
        yLabel = 'Default label',
        svgClass = 'wb-line-chart',
        height = 250,
        width = 920,
        margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 20
        }
    } = options;

    let parseTime = d3.isoParse;

    let dataPrepareFn = (data) => data.map((d) => {
        return {
            ts: parseTime(d.ts),
            value: +d.value
        }
    });

    let data = dataPrepareFn(options.data);


    let parentSize;

    let parent = document.getElementById(parentId);

    // main svg
    let svg;/* = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);*/


    let _axisGroup;
    let _xAxisGroup;
    let _yAxisGroup;

    let _chartGroup;
    let _linePath;
    let _dotGroup;

    let _focusGroup;

    let lineHelper;


// HOVER LINE

    let xHov;
    let yHov;
    let circleHov;

    let textRectHov;
    let textHov;

    let textHovLbl;
    let textHovVal;

    function _renderSvgElements() {
        svg = d3.select('#' + parentId).append('svg')
            .classed(svgClass, true);

        _axisGroup = svg.append("g").classed('axis-group', true);
        _xAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--x');
        _yAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--y');

        _chartGroup = svg.append("g").classed('chart-group', true);
        _linePath = _chartGroup.append('path');
        _dotGroup = _chartGroup.append('g');

        _focusGroup = _chartGroup.append("g").classed('wb-line-focus', true).style("display", "none");

        lineHelper = svg.append("rect")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// HOVER LINE

        xHov = _focusGroup.append("line").classed('x-hover-line hover-line', true);
        yHov = _focusGroup.append("line").classed('y-hover-line hover-line', true);
        circleHov = _focusGroup.append("circle");

        textRectHov = _focusGroup.append("rect").classed('wb-default-tooltip-rect', true);
        textHov = _focusGroup.append("text").classed('wb-default-tooltip-text', true);

        textHovLbl = textHov.append("tspan").attr('x', 0).attr('dy', '1.2em');
        textHovVal = textHov.append("tspan").attr('x', 0).attr('dy', '1.2em');

    }

    let _svgWidth;
    let _svgHeight = height;
    let _width = width || 920;
    let _height = height - margin.top - margin.bottom;


    const _xValue = (d) => d[labelField];

    const _yValue = (d) => d[valueField];

    const _xScaleValue = (d) => xScale(_xValue(d));

    const _yScaleValue = (d) => yScale(_yValue(d));
    let hoverFormat = d3.timeFormat("%d-%b-%y");
    let hoverTransition = d3.transition().ease(d3.easeLinear);
    let dotRadius = 6;


    let bisectDate = d3.bisector(_xValue).left;
    let tickDateFormatParse = d3.timeFormat("%Y-%m-%d");
    let xScale = d3.scaleTime();
    let yScale = d3.scaleLinear();
    let _xAxis = d3.axisBottom(xScale);
    let _yAxis = d3.axisLeft(yScale);
    let _tickValues = [];
    let _minDomain;
    let _maxDomain;
    let _linePoints;


    let updateChart;


    function _chart(parentId) {
        _calcSize();
        _renderSvgElements(parentId);

        // Set size and domains
        function _resize() {
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

        }


        function _addAxis() {
            _xAxisGroup
                .attr('transform', 'translate(0,' + _height + ')');

            if (data.length > 1) {

                if (_width < 350) {
                    _xAxis.ticks(3);
                } else if (_width > 350 && _width < 900) {
                    _xAxis.ticks(5);
                }
                _xAxisGroup.call(_xAxis.tickFormat(tickDateFormatParse));
            } else {
                _xAxisGroup.call(_xAxis.tickValues(_tickValues).tickFormat(tickDateFormatParse));
            }

            _yAxisGroup
                .call(_yAxis.tickSize(-_width).tickFormat(function (d) {
                    return parseInt(d);
                }))
                .append("text")
                .attr("class", "wb-line-axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .text((yLabel));

        }
        function _calcSize() {
            let bounds = parent.getBoundingClientRect();

            //_height = _svgHeight - margin.top - margin.bottom;
            _chart.width(bounds.width);
            _chart.height(_svgHeight);


        }


        function _setScales() {
            let dataDomains = d3.extent(data, _xValue);

            // Handle xAxis ticks manually - issues with single point of data
            // if single point d3 will scale that point on the whole chart which is technically correct but visually not pleasant
            _minDomain = moment(dataDomains[0]).subtract(2, 'hour').toDate();

            if (dataDomains[0] === dataDomains[1]) {
                _maxDomain = moment(dataDomains[1]).add(1, 'day').toDate()
            } else {
                _maxDomain = moment(dataDomains[1]).add(2, 'hour').toDate()
            }

            if (data.length === 1) {
                _tickValues = range(_minDomain, _maxDomain, 'YYYY-MM-DD', true, true);
            }

            xScale
                .domain([_minDomain, _maxDomain])
                //.domain([_minDomain, _maxDomain])
                .rangeRound([0, _width - 20]);


            let max = d3.max(data, _yValue);
            yScale
                .rangeRound([_height, 0])
                .domain([0, max * 1.05]);

            _linePoints = d3.line()
                .x(_xScaleValue)
                .y(_yScaleValue);
        }


        function _addLine() {
            _linePath.datum(data)
                .attr("class", "line")
                .attr("d", _linePoints);
        }


        function _setHoverLine() {
            xHov.attr("y1", 0)
                .attr("y2", _height);

            yHov.attr("x1", 0)
                .attr("x2", 0);

            circleHov.attr("r", 7.5);

            textHov
                .attr("x", 15)
                .attr("dy", ".31em");

            lineHelper
                .attr("class", "wb-line-chart-overlay")
                .attr("width", _width)
                .attr("height", _height)
                .attr("y", 0)
                .on("mouseover", () => _focusGroup.style("display", null))
                .on("mouseout", () => _focusGroup.style("display", "none"))
                .on("mousemove", mousemove);
        }

        // TODO update logic
        // on mouse move the whole focus group is translated
        // the horizontal lin
        function mousemove() {
            let x0 = xScale.invert(d3.mouse(this)[0]);
            let i = bisectDate(data, x0, 1);
            let d0 = data[i - 1];
            let d1 = data[i];

            let d = d1 === undefined ? d0 : (x0 - d0[labelField] > d1[labelField] - x0 ? d1 : d0);

            // translate the whole group to hovered data position
            _focusGroup.attr("transform", "translate(" + _xScaleValue(d) + "," + _yScaleValue(d) + ")");

            let ts = hoverFormat(d.ts);
            // TOOD handle border labels
            textHovLbl.text(ts);
            textHovVal.text(d.value);
            let textHovSize = textHov.node().getBBox();

            textRectHov
                .attr('y', textHovSize.y - (10 / 2))
                .attr('x', textHovSize.x - (10 / 2))
                .attr('width', textHovSize.width + 10)
                .attr('height', textHovSize.height + 10);

            // update height of vertical hover line
            xHov.attr("y2", _height - yScale(d.value));

            // the whole group is translated alongside xAxis, the horizontal line needs to move back for the same amount
            yHov.attr("x1", (-1 * _xScaleValue(d)));
        }

        function _dotOnClickHandler(d) {
            console.log('Clicked dot data:', d);
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


        function _initDots() {

            let dots = _dotGroup.selectAll('.wb-line-chart-dot')
                .data(data);

            dots
                .enter()
                .append('circle')
                .attr('r', dotRadius)
                .attr('cx', _xScaleValue)
                .attr('cy', _yScaleValue)

                .attr('class', 'wb-line-chart-dot')
                .on('click', _dotOnClickHandler)
                .on('mouseenter', _handleMouseEnter)
                .on('mouseleave', _handleMouseLeave);

            dots
                .attr('cx', _xScaleValue)
                .attr('cy', _yScaleValue);

            dots.exit().remove();
        }

        function _drawNoData(show) {

            if (show === true) {
                _chartGroup.selectAll("*").remove();

                let txt = svg.select('.no-data');

                if (!txt.empty()) {

                    txt.attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

                    return;
                }

                svg.append("text").attr("class", 'no-data')
                    .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")")
                    .attr('text-anchor', 'middle')
                    .text("No Data")
                    .style("font-size", "20px");
            } else {

                svg.select(".no-data").remove();
            }
        }

        updateChart = function () {
            _calcSize();
            _setScales();
            _resize();
            _addAxis();
console.log('sakfdaljksfh');
            if (data && data instanceof Array && data.length > 0) {
                _drawNoData(false);
                if (data.length > 1) {
                    _addLine();
                    _setHoverLine();
                    _initDots();
                }
                if (data.length === 1) {
                    // when only one point is present show only that point
                    _addLine();
                    _setHoverLine();
                    _initDots();
                }

            } else {
                _drawNoData(true);
            }
        };

        if (data) {
            updateChart();
        }
    }

    _chart.width = function (value) {
        if (!arguments.length) {
            return _svgWidth;
        }
        _svgWidth = value;
        _width = _svgWidth - margin.left - margin.right;

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

        _height = _svgHeight - margin.top - margin.bottom;

        return _chart;
    };


    _chart.resize = function () {
        updateChart();

        return _chart;
    };
    _chart.noData = function (show) {
        if (show === true) {
            _chartGroup.selectAll("*").remove();

            let txt = svg.select('.no-data');

            if (!txt.empty()) {

                txt.attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")");

                return _chart;
            }

            svg.append("text").attr("class", 'no-data')
                .attr("transform", "translate(" + [_svgWidth / 2, _svgHeight / 2] + ")")
                .attr('text-anchor', 'middle')
                .text("No Data")
                .style("font-size", "20px");
        } else {

            svg.select(".no-data").remove();
        }

        return _chart;

    };
    _chart.data = function (value) {
        if (!arguments.length) {
            return data;
        }
        // asc or desc..?
        let data = dataPrepareFn(value);

        if (typeof updateChart === 'function') {
            updateChart();

            data.length === 0 ? _chart.noData(true) : _chart.noData(false);
        }

        return _chart;
    };

    return _chart;
    /*
    let _draw = function () {
        _calcSize();
        _setScales();
        _addAxis();

        if (data && data instanceof Array && data.length > 0 ) {
            _drawNoData(false);
            if (data.length > 1) {
                _addLine();
                _setHoverLine();
                _initDots();
            }
            if (data.length === 1) {
                // when only one point is present show only that point
                 _addLine();
                 _setHoverLine();
                _initDots();
            }

        } else {
            _drawNoData(true);
        }


    };
*/
    // function _resize() {
    //     _draw();
    // }
    //
    // _draw();
    //
    // return {
    //     draw: _draw,
    //     resize: _resize,
    //     chart: svg
    // };
}
