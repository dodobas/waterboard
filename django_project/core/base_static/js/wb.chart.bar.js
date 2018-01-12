function barChart(options) {

    var data = options.data;
    var parentId = options.parentId || 'chart';
    var svgClass = options.svgClass;


    var parent = document.getElementById(parentId);
    var w = (parent.getBoundingClientRect()).width;
    var width = w || 960;
    var height = options.height || 460;

    var colors = d3.scaleOrdinal(d3.schemeCategory10);



    var tooltip = d3.select('body').append("div").attr("class", "toolTip");


    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', width)
        .attr('height', height);

        var margin = {top: 20, right: 20, bottom: 30, left: 50};

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // var g = svg.append('g')
    //     .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);


    x.domain(data.map(function(d) {
        return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
      	.attr("class", "axis axis--y")
      	.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
      	    return parseInt(d); }).tickSizeInner([-width]))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Some WB label");

    g.selectAll(".bar")
      	.data(data)
      .enter().append("rect")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return colors(d.name); })
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.name) + "<br>" + (d.value));
        })
    		.on("mouseout", function(d){ tooltip.style("display", "none");});


    return {
        chart: svg
    };
}
