function lineChart(options) {

    var d3Utils = WB.utils.d3;

    var data = options.data;

    var parentId = options.parentId || '#chart';
    var svgClass = options.svgClass;

    var parentDomObj = document.getElementById(parentId);

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    };

    var parentSize;
    var width = options.width || 920;
    var height = options.height || 460;

    var svg = d3Utils.createSvgOnParentById(parentId, svgClass, width, height);

    height = height - margin.top - margin.bottom;

    var chartGroup = d3Utils.addMainGroupToToSvg(svg, margin);

    var _getParentSize = function () {
        return parentDomObj.getBoundingClientRect();
    };

    var _setSize = function () {
        parentSize = _getParentSize();
        svg.attr('width', parentSize.width);
       // .attr('height', height);
        width = parentSize.width - margin.left - margin.right;
        // height = height - margin.top - margin.bottom;
    };


    var parseTime = d3.isoParse;
    var hoverFormat = d3.timeFormat("%Y-%m-%d %d:%H:%M");
    var hoverTransition = d3.transition().ease(d3.easeLinear);
    var dotRadius = 6;
    var xScale;
    var yScale;
    var line;
    var focus;
    var dots;
    var bisectDate = d3.bisector(function (d) {
        return d.ts;
    }).left;

    data.forEach(function (d) {
        d.ts = parseTime(d.ts);
        d.value = +d.value;
    });


    var _setScales = function () {
        xScale = d3.scaleTime().rangeRound([0, width]);

        xScale.domain(d3.extent(data, function (d) {
            return d.ts;
        }));

        yScale = d3.scaleLinear().rangeRound([height, 0]);
        yScale.domain([d3.min(data, function (d) {
            return d.value;
        }) / 1.005, d3.max(data, function (d) {
            return d.value;
        }) * 1.005]);

        line = d3.line()
        .x(function (d) {return xScale(d.ts);})
        .y(function (d) {return yScale(d.value);});
    };

     var _addAxis = function () {
        chartGroup.append('g')
            .attr('class', "axis axis--x")
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")));

            chartGroup.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(yScale).ticks(6).tickFormat(function (d) {
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

     var _addLine = function () {
         chartGroup.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
     };

    var _setHoverLine = function () {
        focus = chartGroup.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", height);

        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", width)
            .attr("x2", width);

        focus.append("circle")
            .attr("r", 7.5);

        focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");

        svg.append("rect")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                focus.style("display", null);
            })
            .on("mouseout", function () {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);
    };

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]);
        var i = bisectDate(data, x0, 1);
        var d0 = data[i - 1];
        var d1 = data[i];
        var d = x0 - d0.ts > d1.ts - x0 ? d1 : d0;

        focus.attr("transform", "translate(" + xScale(d.ts) + "," + yScale(d.value) + ")");
        focus.select("text").text(function () {
            var ts = hoverFormat(d.ts);

            // label format
            return ts + "val: " + d.value;
        });
        focus.select(".x-hover-line").attr("y2", height - yScale(d.value));
        focus.select(".y-hover-line").attr("x2", width + width);
    }

    var _initDots = function () {

         dots = svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .selectAll('circle')
                .data(data)
                .enter().append('circle')
                .attr('cx', function(d) { return  xScale(d.ts);})
        .attr('cy', function(d) { return  yScale(d.value);})
        .attr('r', dotRadius)
                .attr('fill', 'salmon')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('click', function (d) {
                    console.log('data:', d);
                })
                .on('mouseenter', function () {
                    d3.select(this)
                        .interrupt()
                        .transition(hoverTransition)
                        .duration(300)
                        .attr('r', dotRadius * 2);
                })
                .on('mouseleave', function () {
                    d3.select(this)
                        .interrupt()
                        .transition(hoverTransition)
                        .duration(300)
                        .attr('r', dotRadius);
                });
        };



    var _draw = function () {
        _setSize();
        _setScales();
        _addAxis();
        _addLine();
        _setHoverLine();
        _initDots();
    };

    function resize() {
        // TODO refactor update
        svg.selectAll("*").remove();
        chartGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        _draw();
    }

    d3.select(window).on('resize', resize);

    _draw();

    return {
        draw: _draw,
        chart: svg
    };
}
