/**
 *
 * @param options
 * @returns {{updateChart: _updateChart, chart}}
 */
function barChartHorizontal(options) {
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

    let _data = data.slice(0);


    let margin = showYaxis === false ? Object.assign({}, defaultMargin, {left: 30}) : Object.assign({}, defaultMargin, {left: 60});

    margin = showTitle === false ? Object.assign({}, margin, {
        top: 15,
        bottom: 15
    }) : Object.assign({}, margin, {top: 25, bottom: 15});



    // TODO check based on string -  WB.utils, build the paths and validate
    const moduleName = 'WB';
    if (!WB || !WB.utils) {
        throw new Error(`Could not find ${moduleName}.`)
    }
    var d3Utils = WB.utils.d3;

    var parent = WB.utils.removeDomChildrenFromParent(parentId);

    // TODO - append to chart div maybe?
    var tooltip = d3.select('body').append("div").attr("class", toolTipClass);

    // svg size
    var svgWidth = options.width || (parent.getBoundingClientRect()).width || 960;
    var svgHeight = options.height || 460;

    // chart size (the main group - g)
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // axis scales
    const _xValue = d => d[`${valueField}`];
    const _yValue = d => d[`${labelField}`];

    var xScale = d3.scaleLinear()
         .domain([0, d3.max(_data, _xValue)])
         .range([0, width]);

    var yScale = d3.scaleBand().range([height, 0]);

    const _xScaleValue = d => xScale(d[`${valueField}`]);
    const _yScaleValue = d => yScale(d[`${labelField}`]);

    //
    // 	var y = d3.scale.ordinal()
	 //  .rangeRoundBands([0, height], 0.1, 0);


    // Main SVG Dom
    // var svg = d3.select('#' + parentId)
    //     .append('svg')
    //     .attr('class', svgClass)
    //     .attr('width', '100%')
    //     .attr('height', svgHeight);


     var svg = d3Utils.createSvgOnParentById(parentId, svgClass, '100%', svgHeight);

    // Main chart group
    var chartGroup = d3Utils.addMainGroupToToSvg(svg, margin, 'chart-group');

    var axisGroup = svg.append("g").classed('axis-group', true);

    var xAxisGroup = axisGroup.append("g").attr("class", xAxisClass);

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
        // TODO remove / do something with the bneficiaries info in the tooltip

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
        chartGroup.append("text").attr("class", 'no-data')
            .text("No Data")
            .style("font-size", "20px");
    }

    if (!_data || (_data instanceof Array && data.length < 1)) {
        _drawNoData();
        return;
    }


    // Chart title
    if (showTitle === true && title && title !== '') {
        chartGroup.append("text")
            .attr("x", (width / 2) - margin.left / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);
    }

    // set y domain by provided columns as data groups or "calculate from data" based on label field
 //   columns ? yScale.domain(columns).padding(0.1) : yScale.domain(data.map(yValue)).padding(0.1);

    // add bottom (x) Axis group and axis

    let xAxis, yAxis;
    // axis definitions
    if (showYaxis === true) {
       // yAxis = d3.axisLeft(yScale);
    }
   // if (showXaxis === true) {
        //xAxis = d3.axisBottom(xScale);

     /*   let xAxisGroup = chartGroup.append("g")
            .attr("class", xAxisClass)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.ticks(thickNmbr).tickFormat(d => d).tickSizeInner([-height]));*/
 //   }

    if (showYaxis === true) {
        // add left (y) Axis group and axis
        // chartGroup.append("g")
        //     .attr("class", yAxisClass)
        //     .call(yAxis);
    }



    function drawAxis(){

      /*  var yAxis = d3.axisLeft(yScale)
            .tickSizeInner(-chartWidth);

        var selectedYAxisElm = axisLayer.selectAll(".y")
            .data(["dummy"])

        var newYAxisElm = selectedYAxisElm.enter().append("g")
            .attr("class", "axis y")*/

        // selectedYAxisElm.merge(newYAxisElm)
        //     .attr("transform", "translate("+[margin.left, margin.top]+")")
        //     .call(yAxis);
        //
   /*     var xAxis = d3.axisBottom(xScale);

        var selectedXAxisElm = axisLayer.selectAll(".x")
            .data(["dummy"])

        var newXAxisElm = selectedXAxisElm.enter().append("g")
            .attr("class", "axis x")

        selectedXAxisElm.merge(newXAxisElm)
            .attr("transform", "translate("+[margin.left, chartHeight+margin.top]+")")
            .call(xAxis);*/




    }

    // if new data is not set, only redraw
    function _updateChart(newData) {

        const bounds = parent.getBoundingClientRect();

        width = bounds.width - margin.left - margin.right;
        height = bounds.height - margin.top - margin.bottom;

        console.log('width ====> ', bounds, width);
        xScale.range([0, width]);
        svg.attr("width", width); //.attr("height", height)
        if (newData) {
            _data = newData.slice(0);



            if (columns) {
                yScale.domain(columns).padding(0.1)
            } else {
                // yScale.domain(newData.sort((a, b) => {
                //     return b[`${valueField}`] - a[`${valueField}`]
                // }).map(_yValue)).padding(0.1)
            }
        }

        yScale.domain(_data.sort((a, b) => {
                    return b[`${valueField}`] - a[`${valueField}`]
                }).map(_yValue)).padding(0.1);

        xScale.domain([0, d3.max(_data, _xValue)]);


        // ENTER

        let elements = chartGroup.selectAll(`.${barsClass}`)
            .data(data);

       // elements.enter()
        // newRow.insert("rect")
        elements.enter()
            .append("rect")
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

        elements.attr("x", 0)
            .attr("y", _yScaleValue)
            .attr("height", yScale.bandwidth())
            .attr("width", _xScaleValue);
        elements.exit()
            .remove();

        // chartGroup.select(xAxisClass)
        //         .attr("transform", "translate(0," + height + ")")
        //         .call(xAxis);
        // d3.axisBottom(xScale).ticks(thickNmbr).tickFormat(d => d).tickSizeInner([-height])
        if (showYaxis === true) {

        }
        //console.log(domain);
        //     d3.axisBottom(xScale);

        var xAxis = d3.axisBottom(xScale);

        // var selectedXAxisElm = axisGroup.selectAll(".x")
        //     .data(["dummy"]);
        //
        // var newXAxisElm = selectedXAxisElm.enter().append("g")
        //     .attr("class", xAxisClass);
        //
        // selectedXAxisElm.merge(newXAxisElm)
            xAxisGroup
            .attr("transform", "translate("+[margin.left, height]+")")
            .call(xAxis);
         // svg.select(xAxisClass).call(xAxis);
        // xAxis = d3.axisBottom(xScale).call(xAxis.ticks(thickNmbr).tickFormat(
        //     (d) => parseInt(d)).tickSizeInner([-height])
        // );
        // xaxis should not change
// chartGroup.select(xAxisClass)
//            .attr("transform", "translate(0," + height + ")")
//            .call(d3.axisBottom(xScale).ticks(thickNmbr).tickFormat(
//                (d) => parseInt(d)).tickSizeInner([-height])
//            );

    }


    _updateChart(data);

    function _resize() {
        _updateChart();
    }

    d3.select(window).on('resize', _resize);
    return {
        updateChart: _updateChart,
        chart: svg
    };
}
