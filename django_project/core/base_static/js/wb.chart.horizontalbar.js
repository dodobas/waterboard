function Tooltip() {

}
Tooltip.prototype = {
    init: function () {
    `<div>
                        <br>Count: ${d.sum}
                        <br>Group: ${d.group}
                        <br>Min: ${d.min}
                        <br>Max: ${d.max}
                    </div>`
    }
}
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
        }

    } = options;

    var parent = document.getElementById(parentId);

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    var svgWidth = options.width || (parent.getBoundingClientRect()).width || 960;
    var svgHeight = options.height || 460;

    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);

    x.domain([0, d3.max(data, d => d.cnt )]);

    columns ? y.domain(columns).padding(0.1) : y.domain(data.map( d => d.group )).padding(0.1);

    g.append("g")
        .attr("class", xAxisClass)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(thickNmbr).tickFormat(
            (d) => parseInt(d)).tickSizeInner([-height])
        );

    g.append("g")
        .attr("class", yAxisClass)
        .call(d3.axisLeft(y));

    var tooltip = d3.select('body').append("div").attr("class", toolTipClass);
    g.selectAll(`.${barsClass}`)
        .data(data)
        .enter().append("rect")
        .attr("class", barsClass)
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.group))
        .attr("width", d => x(d.cnt))
        .on("mousemove", function(d){
            tooltip
                .style("display", 'inline-block')
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 130 +  "px")
                .html(`<ul>
                    <li>Count: ${d.cnt}</li>
                    <li>Group: ${d.group}</li>
                    <li>Min: ${d.min}</li>
                    <li>Max: ${d.max}</li>
                    </ul>`
                );

        })
        .on("mouseout", (d) => tooltip.style("display", "none"))
        .on("click", (d) => {
            console.log('[clicked bar]', d);
        });

    return {
        chart: svg
    };
}
