// don not combine with donut chart, same - but different
function pieChart(options) {

    const {
        data = [],
        parentId = 'chart',
        svgClass,
        margin = {
            top: 40,
            right: 20,
            bottom: 30,
            left: 60
        },
        valueField = 'cnt',
        labelField = 'group',
        tooltipRenderer = () => 'Default Tooltip'

    } = options;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var d3Utils = WB.utils.d3;

    var parent =  WB.utils.removeDomChildrenFromParent(parentId);

    // svg size
    var svgWidth = options.width || (parent.getBoundingClientRect()).width || 960;
    var svgHeight = options.height || 460;

    // chart size (the main group - g)
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var radius = Math.min(width, height) / 2;

    // Main SVG Dom
    var svg = d3Utils.createSvgOnParentById(parentId, svgClass, svgWidth, svgHeight);

    // Main chart group - centered
    var chartGroup = d3Utils.addMainGroupToToSvg(svg, {
        left: width / 2,
        top: height / 2
    });

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(d => d[valueField])
        .sort(null);


    var _handleMouseOver = function (d) {

        d3.select(this)
            .style("cursor", "pointer")
            .style("fill", "black");

    };


    var _handleMouseOut = function (d) {
        d3.select(this)
            .style("cursor", "none")
            .style("fill", color(this._current));

    };

    var path = chartGroup.selectAll('path')
        .data(pie(data))
    .enter()
        .append("g")
        .on("mouseover", _handleMouseOver)
        .on("mouseout", _handleMouseOut)
        .append('path')
        .attr('d', arc)
        .attr('fill',  (d, i) => color(i))
        .on("click", function (d) {

            console.log('[Clicked Object]', d);
            console.log('[Clicked Data]', d.data);

        })
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer")
                .style("fill", "black");
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .style("fill", color(this._current));
        })
        .each(function (d, i) {
            this._current = i;
        });

    var legend = d3.select('#' + parentId).append('div')
        .attr('class', 'legend')
        .style('margin-top', '30px');

    var keys = legend.selectAll('.key')
        .data(data)
        .enter().append('div')
        .attr('class', 'key')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-right', '20px');

    keys.append('div')
        .attr('class', 'symbol')
        .style('height', '10px')
        .style('width', '10px')
        .style('margin', '5px 5px')
        .style('background-color', function (d, i) {
            return color(i)
        });

    keys.append('div')
        .attr('class', 'name')
        .text(function (d) {
            return `${d.group} (${d.cnt})`;
        });

    keys.exit().remove();

    function _renderChart () {
        console.log('Pie chart update npot implemented');
    }
    return {
        chart: svg,
        updateChart: _renderChart
    };
}
