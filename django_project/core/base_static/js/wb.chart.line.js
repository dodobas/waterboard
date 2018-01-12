var enumerateDaysBetweenDates = function (startDate, endDate) {
    var dates = [];

    var currDate = moment(startDate).startOf('day');
    var lastDate = moment(endDate).startOf('day');

    while (currDate.add(1, 'days').diff(lastDate) < 0) {
        console.log(currDate.toDate());
        dates.push(currDate.clone().toDate());
    }

    return dates;
};


function lineChart(options) {

    var data = options.data;
    var dataCount = data.length;

    var parentId = options.parentId || '#chart';
    var svgClass = options.svgClass;
    var width = options.width || 920;
    var height = options.height || 460;
    var innerRadius = options.innerRadius || 40;

    var svg = d3.select(parentId).append('svg')
        .attr('class', svgClass)
        .attr('width', width)
        .attr('height', height);


    var margin = {top: 20, right: 20, bottom: 30, left: 40};

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var parseTime = d3.isoParse;

    var bisectDate = d3.bisector(function (d) {
        return d.ts;
    }).left;

    data.forEach(function (d) {
        d.ts = parseTime(d.ts);
        d.value = +d.value;
    });

    var xScale = d3.scaleTime().rangeRound([0, width]);

    xScale.domain(d3.extent(data, function (d) {
        return d.ts;
    }));


    var yScale = d3.scaleLinear().rangeRound([height, 0]);

    var line = d3.line()
        .x(function (d) {return xScale(d.ts);})
        .y(function (d) {return yScale(d.value);});

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    yScale.domain([d3.min(data, function (d) {
        return d.value;
    }) / 1.005, d3.max(data, function (d) {
        return d.value;
    }) * 1.005]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")));

    g.append("g")
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
        .text("Count)");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = g.append("g")
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


    var hoverFormat = d3.timeFormat("%Y-%m-%d %d:%H:%M");

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.ts > d1.ts - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + xScale(d.ts) + "," + yScale(d.value) + ")");
        focus.select("text").text(function () {
            var ts = hoverFormat(d.ts);

            return ts + "val: " + d.value;
        });
        focus.select(".x-hover-line").attr("y2", height - yScale(d.value));
        focus.select(".y-hover-line").attr("x2", width + width);
    }

    var hoverTransition = d3.transition()
        .ease(d3.easeLinear);

    var dotRadius = 6;

    var dots = svg.append('g')
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






d3.select(window).on('resize', resize);

function resize() {
    // update width
    // width = parseInt(d3.select('#chart').style('width'), 10);
    // width = width - margin.left - margin.right;

    // reset x range
   // x.range([0, width]);

    // do the actual resize...
}



    return {
        chart: svg
    };
}
