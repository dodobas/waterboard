function pushDates(difference, end, format, asDateObject) {
  const arr = [];
    let i = 0;

  if (asDateObject === true) {
        for(i = 0; i < difference; i += 1) {
            arr.push(end.subtract(1, 'd').toDate());

      }
  } else {
        for(i = 0; i < difference; i += 1) {
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

  if(ascending) {
    return dates.reverse();
  }

  return dates;
}

// TODO refactor - follow v4 guidelines
export default function lineChart(options) {
    let _INIT_TIME = new Date().getTime();
    let _CHART_TYPE = 'LINE_CHART';

    let {
        parentId='chart',
        valueField = 'cnt',
        labelField = 'ts',
        yLabel = '',
        svgClass,
        height = 460,
        width = 920,
        margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 20
        }
    } = options;

    let _ID = (parentId || '') + '_' + _INIT_TIME;
    let _NAME = name || 'line-chart';

    let parseTime = d3.isoParse;

    let data = options.data.map(function (d) {
        return {
            ts: parseTime(d.ts),
            value: +d.value
        }
    });


    let parentSize;

    let parent = document.getElementById(parentId);

    // main svg
    let svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);



    let _axisGroup = svg.append("g").classed('axis-group', true);
    let _xAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--x');
    let _yAxisGroup = _axisGroup.append("g").attr("class", 'axis axis--y');

    let _chartGroup = svg.append("g").classed('chart-group', true);
    let _linePath = _chartGroup.append('path');
    let _dotGroup = _chartGroup.append('g');

    let _focusGroup = _chartGroup.append("g").classed('wb-line-focus', true).style("display", "none");

    let lineHelper = svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let _svgWidth;
    let _svgHeight = height;
    let _width = width || 920;
    let _height = height - margin.top - margin.bottom;


    let hoverFormat = d3.timeFormat("%d-%b-%y");
    let hoverTransition = d3.transition().ease(d3.easeLinear);
    let dotRadius = 6;

    let bisectDate = d3.bisector(_xValue).left;

    let xScale = d3.scaleTime();
    let yScale = d3.scaleLinear();
    let _xAxis = d3.axisBottom(xScale);
    let _yAxis = d3.axisLeft(yScale);

    let _setSize = function () {
        parentSize = parent.getBoundingClientRect();

        _svgWidth = parentSize.width;

        _width = _svgWidth - margin.left - margin.right;
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


    function _xValue(d) {
        return d[labelField];
    }

    function _yValue(d) {
        return d[valueField];
    }

    function _xScaleValue(d) {
        return xScale(_xValue(d));
    }

    function _yScaleValue(d) {
        return yScale(_yValue(d));
    }


    let _tickValues = [];
    let _minDomain;
    let _maxDomain;
    let _linePoints;
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
            .rangeRound([0, _width - 20 ]);


        let max = d3.max(data, _yValue);
        yScale
            .rangeRound([_height, 0])
            .domain([0, max * 1.05]);

        _linePoints = d3.line()
            .x(_xScaleValue)
            .y(_yScaleValue);
    }

    let tickDateFormatParse = d3.timeFormat("%Y-%m-%d");

    function _addAxis () {
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

    function _addLine() {
        _linePath.datum(data)
            .attr("class", "line")
            .attr("d", _linePoints);
    }


    let xHov = _focusGroup.append("line").classed('x-hover-line hover-line', true);
    let yHov = _focusGroup.append("line").classed('y-hover-line hover-line', true);
    let circleHov = _focusGroup.append("circle");

    let textRectHov = _focusGroup.append("rect").classed('wb-default-tooltip-rect', true);
    let textHov = _focusGroup.append("text").classed('wb-default-tooltip-text', true);

    let textHovLbl = textHov.append("tspan").attr('x', 0).attr('dy', '1.2em');
    let textHovVal = textHov.append("tspan").attr('x', 0).attr('dy', '1.2em');

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
            .on("mouseover", function () {
                _focusGroup.style("display", null);
            })
            .on("mouseout", function () {
                _focusGroup.style("display", "none");
            })
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

        let d = d1 === undefined ? d0 :  (x0 - d0[labelField] > d1[labelField] - x0 ? d1 : d0);

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

        // the whole group is translated alonside xAxis, the horizontal line needs to move back for the same amount
        yHov.attr("x1",  (-1 * _xScaleValue(d)));
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


    function _initDots () {

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

               txt.attr("transform", "translate(" + [_svgWidth / 2, _svgHeight /2] + ")");

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

    let _draw = function () {
        _setSize();
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
