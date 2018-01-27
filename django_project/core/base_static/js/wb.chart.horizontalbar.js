function barChartHorizontal(options) {

    const {
        data,
        columns,
        parentId = 'chart',
        svgClass,
        thickNmbr = 5,
        xAxisClass = 'x axis',
        yAxisClass = 'y axis',
        barsClass,
        toolTipClass = 'toolTip',
        margin = {
            top: 20,
            right: 30,
            bottom: 30,
            left: 70
        },
        valueField = 'cnt',
        minValueField = 'min',
        maxValueField = 'max'

    } = options;

    var parent = document.getElementById(parentId);

    // TODO check based on string -  WB.utils, build the paths and validate
    const moduleName = 'WB';
    if (!WB || !WB.utils ) {
        throw new Error(`Could not find ${moduleName}.`)
    }

    WB.utils.removeDomChildrenFromParent(parent);

    var tooltip = d3.select('body').append("div").attr("class", toolTipClass);

    var svgWidth = options.width || (parent.getBoundingClientRect()).width || 960;
    var svgHeight = options.height || 460;

        var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleBand().range([height, 0]);


        var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);



    // var x = d3.scaleLinear().range([0, width]);
    // var y = d3.scaleBand().range([height, 0]);
  //  x.domain([0, d3.max(data, d => d[`${valueField}`])]);

    // columns ? y.domain(columns).padding(0.1) : y.domain(data.map( d => d.group )).padding(0.1);

    // bottom (x) Axis
    chart.append("g")
        .attr("class", xAxisClass)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis).ticks(thickNmbr).tickFormat(
            (d) => parseInt(d)).tickSizeInner([-height])
        );

    // left (y) Axis
    chart.append("g")
        .attr("class", yAxisClass)
        .call(d3.axisLeft(y));


    function _updateChart(data){
        //set domain for the x axis
	    xScale.domain([0, d3.max(data, d => d[`${valueField}`])]);

	    //set domain for y axis
    	columns ? yScale.domain(columns).padding(0.1) : yScale.domain(data.map( d => d.group )).padding(0.1);

    	chart.selectAll(`.${barsClass}`)
            .remove()
            .exit()
            .data(data)
        .enter().append("rect")
        .attr("class", barsClass)
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.group))
        .attr("width", d => x(d[`${valueField}`]))
        .on("mousemove", function(d){
            // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear
            tooltip
                .style("display", 'inline-block')
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 130 +  "px")
                .html(`<ul>
                    <li>Count: ${d[valueField]}</li>
                    <li>Group: ${d.group}</li>
                    <li>Min: ${d[minValueField]}</li>
                    <li>Max: ${d[maxValueField]}</li>
                    </ul>`
                );

        })
        .on("mouseout", (d) => tooltip.style("display", "none"))
        .on("click", (d) => {
            console.log('[clicked bar]', d);
        });


    	//left axis
	chart.select(yAxisClass).call(yAxis);

	chart.select(xAxisClass)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(thickNmbr).tickFormat(
            (d) => parseInt(d)).tickSizeInner([-height])
        );

    }


    _updateChart(data);
    return {
        updateChart: _updateChart(data),
        chart: svg
    };
}
