// don not combine with donut chart, same - but different
function pieChart(options) {
    const _INIT_TIME = new Date().getTime();
    const _ID = `${options.parentId}_${_INIT_TIME}`;
    const _CHART_TYPE = 'PIE_CHART';
    const _NAME = options.name;

    const {
        data = [],
        parentId = 'chart',
        titleClass = 'wb-chart-title',
        svgClass,
        defaultMargin = {
            top: 40,
            right: 20,
            bottom: 30,
            left: 60
        },
        valueField = 'cnt',
        labelField = 'group',
        height = 400,
        showTitle = true,
        title = 'Pie',
        tooltipRenderer = () => 'Default Tooltip'

    } = options;



    let _svgWidth, _svgHeight = height, _width, _height;
    let _data = data.slice(0);
    let _radius = height;

    const {_marginLeft, _marginRight, _marginTop, _marginBot} = calcMargins(
        false, showTitle, defaultMargin);

    const parent = document.getElementById(parentId);

    // data value helper
    const _xValue = d => d[`${valueField}`];

    // main svg
    const svg =  d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    // groups
    const _chartGroup =  svg.append("g").classed('chart-group', true);
    const _titleGroup =  svg.append("g").classed('title-group', true);

    // helper fncs
    const _arc = d3.arc();

    const _pie = d3.pie().value(_xValue).sort(null);

    const _color = d3.scaleOrdinal(d3.schemeCategory10);

    var _handleMouseOver = function (d) {

        d3.select(this)
            .style("cursor", "pointer")
            .style("fill", "black");

    };

    var _handleMouseOut = function (d) {
        d3.select(this)
            .style("cursor", "none")
            .style("fill", _color(this._current));

    };

    function _setSize() {
        const bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;
  //      _svgHeight = 400; //bounds.height ;//

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot; //bounds.height - _marginTop - _marginBot;

        svg.attr("width", _svgWidth).attr("height", _svgHeight);
      //  svg.attr('viewBox','0 0 '+Math.min(_svgWidth,_svgHeight)+' '+Math.min(_svgWidth,_svgHeight));

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate("+[_svgWidth / 2 , _svgHeight / 2]+")");

        _titleGroup.attr("width", _width)
            .attr("height", _marginTop)
            .attr("transform", "translate("+[_svgWidth / 2 , _marginTop]+")");

        console.log(_width,_height);
        _radius =  Math.min(_svgWidth,_svgHeight) / 2;

        _arc
            .innerRadius(0)
            .outerRadius(_radius);
    }

    if (showTitle === true && title && title !== '') {
        _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);
    }

    function _renderChart (newData) {
        console.log('Pie chart update npot implemented');

        _setSize();

        _data = newData ? newData.slice(0) : _data;

                // update title position
        if (showTitle === true && title && title !== '') {
            _titleGroup
                .attr("x", (_width / 2) - _marginLeft / 2)
                .attr("y", 0 - (_marginTop / 2));
        }



        let elements = _chartGroup.selectAll('path')
            .data(_pie(_data));

        elements.exit().remove();

        elements
        .enter()
           .append('path')
            .on("mouseover", _handleMouseOver)
            .on("mouseout", _handleMouseOut)

            .attr('d', _arc)
            .attr('fill',  (d, i) => _color(i))
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
                    .style("fill", _color(this._current));
            })
            .each(function (d, i) {
                this._current = i;
            });


        elements.exit().remove();
        //
        // var legend = d3.select('#' + parentId).append('div')
        //     .attr('class', 'legend')
        //     .style('margin-top', '30px');
        //
        // var keys = legend.selectAll('.key')
        //     .data(data)
        //     .enter().append('div')
        //     .attr('class', 'key')
        //     .style('display', 'flex')
        //     .style('align-items', 'center')
        //     .style('margin-right', '20px');
        //
        // keys.append('div')
        //     .attr('class', 'symbol')
        //     .style('height', '10px')
        //     .style('width', '10px')
        //     .style('margin', '5px 5px')
        //     .style('background-color', function (d, i) {
        //         return _color(i)
        //     });
        //
        // keys.append('div')
        //     .attr('class', 'name')
        //     .text(function (d) {
        //         return `${d.group} (${d.cnt})`;
        //     });
        //
        // keys.exit().remove();

    }

    _renderChart(data);

    function _resize() {
        _renderChart();
    }

    return {
        updateChart: _renderChart,
        resize: _resize,
        chart: svg
    };
}
