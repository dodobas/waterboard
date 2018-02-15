/**
 *
 * @param options
 * @returns {{updateChart: _renderChart, chart}}
 */

function calcMargins(showYaxis, showTitle, defaultMargin) {
    let marginTop = 15;
    let marginBottom = 15;
    let marginLeft = showYaxis === false ? 30 : 20;

    if (showTitle === true) {
        marginBottom = marginTop = 25;
    }

    return {
        _marginTop: marginTop,
        _marginRight: 20,
        _marginBot: marginBottom,
        _marginLeft: marginLeft
    };
}

function barChartHorizontal(options) {
    const _INIT_TIME = new Date().getTime();
    const _ID = `${options.parentId}_${_INIT_TIME}`;

    const chartType = 'HORIZONTAL_BAR_CHART';
    // TOODO use default props
    let {
        data = [],
        columns,
        parentId = 'chart',
        titleClass = 'wb-chart-title',
        svgClass,
        thickNmbr = 5,
        xAxisClass = 'x axis',
        yAxisClass = 'x axis',
        showXaxis = true,
        showTitle = false,
        showYaxis = false,
        barsClass = 'bar',
        toolTipClass = 'toolTip',
        title,
        defaultMargin = {
            top: 40,
            right: 20,
            bottom: 30,
            left: 60
        },
        valueField = 'cnt',
        labelField = 'group',
        barClickHandler,
        tooltipRenderer = () => 'Default Tooltip'


    } = options;


    let _svgWidth, _svgHeight, _width, _height;
    let _data = data.slice(0);

    let _lastData = data.slice(0);

    const {_marginLeft, _marginRight, _marginTop, _marginBot} = calcMargins(
        showYaxis, showTitle, defaultMargin);

    const parent = document.getElementById(parentId);

    // TODO - append to chart div maybe?
    var tooltip = d3.select('body').append("div").attr("class", toolTipClass);


    // data value helper
    const _xValue = d => d[`${valueField}`];
    const _yValue = d => d[`${labelField}`];

    // axis scales
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleBand();

    // axis scale value helper
    const _xScaleValue = d => xScale(d[`${valueField}`]);
    const _yScaleValue = d => yScale(d[`${labelField}`]);

    // axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const svg =  d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    const _chartGroup =  svg.append("g").classed('chart-group', true);

    const _axisGroup = svg.append("g").classed('axis-group', true);

    const _xAxisGroup = _axisGroup.append("g").attr("class", xAxisClass);
    const _yAxisGroup = _axisGroup.append("g").attr("class", yAxisClass);


    let titleElement;
        // Chart title
        if (showTitle === true && title && title !== '') {
            titleElement = _chartGroup.append("text")

                .attr("text-anchor", "middle")
                .attr("class", titleClass)
                .style("text-decoration", "underline")
                .text(title);
        }


    function _handleClick(d) {
        if (barClickHandler && barClickHandler instanceof Function) {
            barClickHandler({
                data: d,
                chartType: 'HORIZONTAL_BAR_CHART'
            });
        }
    }

    function _handleMouseMove(d) {
        // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear

        const tooltipContent = tooltipRenderer(d);
        tooltip
            .style("display", 'inline-block')
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 130 + "px")
            .html(tooltipContent);

    }

    function _handleMouseOut(d) {
        tooltip.style("display", "none")
    }

    function _drawNoData() {
        _chartGroup.append("text").attr("class", 'no-data')
            .text("No Data")
            .style("font-size", "20px");
    }

    // Set size and domains
    function _setSize(data) {
        const bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;
        _svgHeight = 400; //bounds.height ;//

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot; //bounds.height - _marginTop - _marginBot;

        svg.attr("width", _svgWidth).attr("height", _svgHeight);

        _axisGroup.attr("width", _svgWidth).attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate("+[_marginLeft, _marginTop]+")");


        if (columns) {
            yScale
                .domain(columns)
                .range([_height, 0])
                .padding(0.1);
        } else {
            yScale
                .domain(data.sort((a, b) => {
                    return b[`${valueField}`] - a[`${valueField}`]
                }).map(_yValue))
                .range([_height, 0])
                .padding(0.1);
        }

        xScale
            .domain([0, d3.max(data, _xValue)])
            .range([0, _width]);
    }

    // Transform and add axis to axis group
    function _renderAxis() {
        if (showXaxis === true) {
            // yAxis = d3.axisLeft(yScale);
            _xAxisGroup
                .attr("transform", "translate(" + [_marginLeft, _height] + ")")
                .call(xAxis);
        }

        if (showYaxis === true) {
            // add left (y) Axis group and axis
            // _yAxisGroup.append("g")
            //     .call(yAxis);
        }

    }

    // if new data is not set, only redraw
    function _renderChart(data) {

        _lastData = data ? data.slice(0) : _lastData;

        _setSize(_lastData);

        if (titleElement) {
            titleElement.attr("x", (_width / 2) - _marginLeft / 2)
            .attr("y", 0 - (_marginTop / 2));

        }

        _renderAxis(_lastData);


        // ENTER

        let elements = _chartGroup.selectAll(`.${barsClass}`)
            .data(_lastData);

        // EXIT

        elements.exit().remove();

        elements.enter()
            .append("rect")
        .merge(elements)
            .attr("class", barsClass)
            .attr("x", 0)
            .attr("y", _yScaleValue)
            .attr("height", yScale.bandwidth())
            .attr("width", _xScaleValue)
            .on("mousemove", _handleMouseMove)
            .on("mouseout", _handleMouseOut)
            .on("click", _handleClick);


        //Add value labels
        // elements.append("text")
        //   .attr("class","label")
        //   .attr("y", _yScaleValue)
        //   .attr("x",0)
        //   .attr("opacity",0)
        //   .attr("dy",".35em")
        //   .attr("dx","0.5em")
        //   .text(_yValue);


        // UPDATE
        elements.attr("x", 0)
            .attr("y", _yScaleValue)
            .attr("height", yScale.bandwidth())
            .attr("width", _xScaleValue);


        elements.exit().remove();
    }


    _renderChart(_lastData);

    function _resize() {
        _renderChart();
    }

    d3.select(window).on('resize', _resize);
    return {
        updateChart: _renderChart,
        chart: svg
    };
}
