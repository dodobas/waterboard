function donutChart(options) {

    var data = options.data;
    var parentId = options.parentId || 'chart';
    var svgClass = options.svgClass;
    var width = options.width || 320;
    var height = options.height || 320;
    var innerRadius = options.innerRadius || 40;

    var text = "";
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', width)
        .attr('height', height);

    var g = svg.append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var innerText = svg.append('g')
        .attr("class", "text-group")
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');


    var arc = d3.arc()
        .innerRadius(radius - innerRadius)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function (d) {
            return d.cnt;
        })
        .sort(null);

    var maxVal = _.maxBy(data, 'cnt');

    var addInnerText = function (innerData) {
        innerText.append("text")
            .attr("class", "name-text")
            .text(innerData.group || '')
            .attr('text-anchor', 'middle')
            .attr('dy', '-1.2em');

        innerText.append("text")
            .attr("class", "value-text")
            .text(innerData.cnt || '')
            .attr('text-anchor', 'middle')
            .attr('dy', '.6em');
    };
    var removeInnerText = function () {
        innerText.select(".value-text").remove();
        innerText.select(".name-text").remove();
    }
    addInnerText(maxVal);

    var _handleMouseOver = function (d) {

        d3.select(this)
            .style("cursor", "pointer")
            .style("fill", "black");

        removeInnerText();
        addInnerText(d.data);
    };


    var _handleMouseOut = function (d) {
        d3.select(this)
            .style("cursor", "none")
            .style("fill", color(this._current));
        removeInnerText();
        addInnerText(maxVal);
    };

    var path = g.selectAll('path')
        .data(pie(data))
    .enter()
        .append("g")
        .on("mouseover", _handleMouseOver)
        .on("mouseout", _handleMouseOut)
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return color(i)
        })
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

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(text);

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
            return d.group + ' ' + d.cnt;
        });

    keys.exit().remove();

    return {
        chart: svg
    };
}
