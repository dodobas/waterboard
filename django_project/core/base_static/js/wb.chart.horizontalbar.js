

function barChartHorizontal(options) {
    const _INIT_TIME = new Date().getTime();
    const _ID = `${options.parentId}_${_INIT_TIME}`;
    const _CHART_TYPE = 'HORIZONTAL_BAR_CHART';
    const _NAME = options.name;

    // TOODO use default props
    let {
        data = [],
        filterValueField = 'group',
        columns,
        parentId = 'chart',
        titleClass = 'wb-chart-title',
        svgClass = 'wb-horizontal-bar',
        thickNmbr = 5,
        xAxisClass = 'x axis',
        showXaxis = true,
        showTitle = true,
        showYaxis = false,
        barsClass = 'bar',
        toolTipClass = 'wb-horizontal-bar-tooltip',
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
        height = 400,
        tooltipRenderer = () => 'Default Tooltip'


    } = options;


    let _svgWidth, _svgHeight = height, _width, _height;

    function _sortData(data) {
        return data.sort((a, b) =>  b[`${valueField}`] - a[`${valueField}`]);
    }


    let _data = _sortData(data.slice(0));

    const {_marginLeft, _marginRight, _marginTop, _marginBot} = calcMargins(
        showYaxis, showTitle, defaultMargin);

    const parent = document.getElementById(parentId);

    // TODO - append to chart div maybe?
    var tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
    .attr("id", `wb_tooltip_${_ID}`);


    // data value helper
    const _xValue = d => d[`${valueField}`] || 0;
    const _yValue = d => d[`${labelField}`];
    const _generateBarId = (d) => [_ID, d[`${labelField}`]].join('_');

    // axis scales
    const xScale = d3.scaleLinear();
    const yScale = d3.scaleBand();

    // axis scale value helper
    const _xScaleValue = d => {
        let val = d[`${valueField}`] || 0;
        //
        // if(d[`${valueField}`] !== undefined || d[`${valueField}`] !== null) {
        //    val = d[`${valueField}`];
        // }
        return xScale(val)
    };
    const _yScaleValue = d => yScale(d[`${labelField}`]);

    // axis
    const _xAxis = d3.axisBottom(xScale);

    // main svg
    const svg =  d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    // Axis group and axis
    const _axisGroup = svg.append("g").classed('axis-group', true);
    const _xAxisGroup = _axisGroup.append("g").attr("class", xAxisClass);

    // Chart Group - represented data
    const _chartGroup =  svg.append("g").classed('chart-group', true);

    // Chart title group
    const _titleGroup =  svg.append("g").classed('title-group', true);
    let _chartTitle;

    const _activeBars = [];

    function _handleClick(d) {
        // this references the bar not class
        let alreadyClicked = _activeBars.indexOf(this);

        if (alreadyClicked === -1) {
            this.classList.add('wb-bar-active');
            _activeBars[_activeBars.length] = this;
        } else {

            let removedNode = _activeBars.splice(alreadyClicked, 1);

            removedNode[0].classList.remove('wb-bar-active');
        }


        if (barClickHandler && barClickHandler instanceof Function) {
            barClickHandler({
                data: d,
                name: _NAME,
                filterValue: d[filterValueField],
                chartType: _CHART_TYPE,
                chartId: _ID,
                alreadyClicked: alreadyClicked > -1
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

    if (!_data || (_data instanceof Array && data.length < 1)) {
        _drawNoData();
        return;
    }


    // Set size and domains
    function _setSize() {
        const bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;
  //      _svgHeight = 400; //bounds.height ;//

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
                .domain(_data.sort((a, b) => {
                    return b[`${valueField}`] - a[`${valueField}`]
                }).map(_yValue))
                .range([_height, 0])
                .padding(0.1);
        }

        xScale
            .domain([0, d3.max(_data, _xValue)])
            .range([0, _width]);
    }



    // Transform and add axis to axis group
    function _renderAxis() {
        if (showXaxis === true) {
            _xAxisGroup
                .attr("transform", "translate(" + [_marginLeft, _svgHeight  - _marginBot] + ")")
                .call(_xAxis.tickSizeInner([-height + _marginBot + _marginTop]));

            // .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));
        }
    }

    function addTitle () {
        _chartTitle = _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);

    }

    function _updateTitle() {
        if (showTitle === true && title && title !== '') {
            _chartTitle
                .attr("x", (_width / 2) )
                .attr("y", _marginTop - 2);
        }
    }

    // if new data is not set, only redraw
    function _renderChart(newData) {

        // _data = newData ? newData.slice(0) : _data;

        _data = newData ? newData : _data;
        _sortData(_data.slice(0));

        _setSize();
        _renderAxis();
        _updateTitle();

        // UPDATE

        let elements = _chartGroup.selectAll(`.${barsClass}`)
            .data(_data);

        let labels = _chartGroup.selectAll('.label')
            .data(_data);

        labels.exit().remove();
        elements.exit().remove(); // EXIT

        elements
            .enter()
                .append("rect")
            .merge(elements)
                .attr("class", barsClass)
                .attr("id", _generateBarId)
                .attr("x", 0)
                .attr("y", _yScaleValue)
                .attr("height", yScale.bandwidth())
                .attr("width", _xScaleValue)
                .on("mousemove", _handleMouseMove)
                .on("mouseout", _handleMouseOut)
                .on("click", _handleClick);


        //Add value labels
        labels.enter()
            .append("text")
        .merge(labels)
          .attr("class","label")
          .attr("y", d => yScale(d[`${labelField}`]) + yScale.bandwidth() /2)
          .attr("x",0)
          .text(_yValue);

        elements.attr("x", 0)
            .attr("y", _yScaleValue)
            .attr("height", yScale.bandwidth())
            .attr("width", _xScaleValue);


        elements.exit().remove();

        labels.exit().remove();

    }


    if (showTitle === true && title && title !== '') {
        addTitle();
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
