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
        labelField = 'group_id',
        height = 400,
        showTitle = true,
        title = 'Pie',
        toolTipClass = 'wb-pie-tooltip',
        tooltipRenderer = () => 'Default Tooltip',
        clickHandler,
        filterValueField

    } = options;

    let _svgWidth, _svgHeight = height, _width, _height;
    let _data = data.slice(0);
    let _radius = height;

    const {_marginLeft, _marginRight, _marginTop, _marginBot} = calcMargins(
        false, showTitle, defaultMargin);

    const parent = document.getElementById(parentId);

    // data value helper
    const _xValue = d => d[`${valueField}`];
    const _key = d => d.data[`${labelField}`];

    // main svg
    const svg =  d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

        var tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
    .attr("id", `wb_tooltip_${_ID}`);


    // groups
    const _chartGroup =  svg.append("g").classed('chart-group', true);
    const _titleGroup =  svg.append("g").classed('title-group', true);

    // helper fncs
    let _arc;

    const _pie = d3.pie().sort(null).value(function(d) {return d[`${valueField}`]});

    const _color = d3.scaleOrdinal(d3.schemeCategory10);

    function _handleMouseMove(d) {
        // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear_key

        const tooltipContent = tooltipRenderer(d.data);
        tooltip
            .style("display", 'inline-block')
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 130 + "px")
            .html(tooltipContent);
        d3.select(this)
            .style("cursor", "pointer")
            .style("fill", "black");
    }

    function _handleMouseOut(d) {
        tooltip.style("display", "none");
        d3.select(this)
            .style("cursor", "none")
            .style("fill", _color(this._current));
    }
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

        _radius =  Math.min(_svgWidth,_svgHeight) / 2;

        _arc = d3.arc()
            .outerRadius(_radius)
            .innerRadius(0)
            ;
    }

    if (showTitle === true && title && title !== '') {
        _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);
    }

    function arcTween(a) {
      console.log(this._current);
      let i = d3.interpolate(this._current, a);

      this._current = i(0);

      return function(t) {
        return _arc(i(t));
      };
    }
    function _renderChart (newData) {

        _data = newData ? newData : _data;

        _setSize();
        // update title position
        if (showTitle === true && title && title !== '') {
            _titleGroup
                .attr("x", (_width / 2) - _marginLeft / 2)
                .attr("y", 0 - (_marginTop / 2));
        }

        // JOIN
        let elements = _chartGroup.selectAll('.arc')
            .data(_pie(_data), _key);

        elements.exit().remove();
        // UPDATE
         elements
        .transition()
          .duration(1500)
          .attrTween("d", arcTween);

         // ENTER
        elements
        .enter()
           .append('path')
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .attr("class", "arc")
            .attr('d', _arc)
            .attr('fill',  (d, i) => _color(i))
            .on("click", function (d) {
                console.log('[Clicked Object]', d);
                console.log('[Clicked Data]', d.data);

                if (clickHandler && clickHandler instanceof Function) {
                    clickHandler({
                        data: d,
                        name: _NAME,
                        filterValue: d.data[filterValueField],
                        chartType: _CHART_TYPE,
                        chartId: _ID
                    });
                }
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
