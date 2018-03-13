// don not combine with donut chart, same - but different
function pieChart(options) {
    const _INIT_TIME = new Date().getTime();
    const _ID = options.parentId + '_' + _INIT_TIME;
    const _CHART_TYPE = 'PIE_CHART';
    const _NAME = options.name;

    var data = options.data || [];
    var parentId = options.data || 'chart';
    var titleClass = options.titleClass || 'wb-chart-title';
    var svgClass = options.svgClass;
    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group_id';
    var height = options.height || 400;
    var showTitle = options.showTitle || true;
    var title = options.title || 'Pie';
    var toolTipClass = options.toolTipClass || 'wb-pie-tooltip';
    var tooltipRenderer =  options.tooltipRenderer || function () {
        return 'Default Tooltip'
    };
    var clickHandler = options.clickHandler;
    var filterValueField = options.filterValueField;
    var defaultMargin = {
        top: 40,
        right: 20,
        bottom: 30,
        left: 60
    };

    var _svgWidth, _svgHeight = height, _width, _height;
    var _data = data.slice(0);
    var _radius = height;

    var calculatedMargins= calcMargins(
        false, showTitle, defaultMargin
    );

    var _marginLeft = calculatedMargins._marginLeft;
    var _marginRight = calculatedMargins._marginRight;
    var _marginTop = calculatedMargins._marginTop;
    var _marginBot = calculatedMargins._marginBot;

    const parent = document.getElementById(parentId);

    // data value helper
    const _xValue = function(d) { return d[valueField]};
    const _key = function(d){ return d.data[labelField]};

    // main svg
    const svg =  d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    var tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
    .attr("id", 'wb_tooltip_' + _ID);


    // groups
    const _chartGroup =  svg.append("g").classed('chart-group', true);
    const _titleGroup =  svg.append("g").classed('title-group', true);

    // helper fncs
    let _arc;

    const _pie = d3.pie().sort(null).value(_xValue);

     const _color = d3.scaleOrdinal(d3.schemeCategory10);

    function _handleMouseMove(d) {
        // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear_key

        const tooltipContent = tooltipRenderer(d.data);
        tooltip
            .style("display", 'inline-block')
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 100 + "px")
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

        _radius =  Math.min(_width - _marginLeft,_height - _marginTop) / 2;

        _arc = d3.arc()
            .outerRadius(_radius)
            .innerRadius(0);
    }

    if (showTitle === true && title && title !== '') {
        _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);
    }

    function _arcTween(a) {
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
          .attrTween("d", _arcTween);

         // ENTER
        elements
        .enter()
           .append('path')
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .attr("class", "arc")
            .attr('d', _arc)
            .attr('fill',  function (d, i) { return _color(i)})
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
