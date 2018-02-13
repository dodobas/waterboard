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
    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleBand().range([height, 0]);
    //xScale.domain([0, d3.max(data, d => d[`${valueField}`])]);

    let xAxis, yAxis;
    // axis definitions
    if (showXaxis === true) {
        xAxis = d3.axisBottom(xScale);
    }
    if (showYaxis === true) {
        yAxis = d3.axisLeft(yScale);
    }

    // Main SVG Dom
    var svg = d3Utils.createSvgOnParentById(parentId, svgClass, '100%', svgHeight);

    // Main chart group
    var chartGroup = d3Utils.addMainGroupToToSvg(svg, margin);


    function _drawNoData() {
        chartGroup.append("text").attr("class", 'no-data')
            .text("No Data")
            .style("font-size", "20px");
    }

    if (!data || (data instanceof Array && data.length < 1)) {
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

    const xValue = d => d[`${valueField}`];
    const yValue = d => d[`${labelField}`];
    // set y domain by provided columns as data groups or "calculate from data" based on label field
 //   columns ? yScale.domain(columns).padding(0.1) : yScale.domain(data.map(yValue)).padding(0.1);

    // add bottom (x) Axis group and axis
    if (showXaxis === true) {
        chartGroup.append("g")
            .attr("class", xAxisClass)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.ticks(thickNmbr).tickFormat(d => d).tickSizeInner([-height]));
    }

    if (showYaxis === true) {
        // add left (y) Axis group and axis
        chartGroup.append("g")
            .attr("class", yAxisClass)
            .call(yAxis);
    }


    // TODO review if resize is needed or if update is enough
    // function _resizeChart () {
    //     var svgWidth = parent.getBoundingClientRect().width ;
    // // var svgHeight = options.height || 460;
    //
    //     width = svgWidth - margin.left - margin.right;
    // // var height = svgHeight - margin.top - margin.bottom;
    //
    // // axis scales
    //     xScale = d3.scaleLinear().range([0, width]);
    //     //var yScale = d3.scaleBand().range([height, 0]);
    //
    //
    //     // var svg = d3Utils.createSvgOnParentById(parentId, svgClass, svgWidth, svgHeight);
    //     svg.attr("width", width);
    //     // Main chart group
    //     // d3.select(xAxisClass)
    //     // d3.select()
    //
    //
    //
    // }

    let elements = false;

    function _updateChart(newData) {

        if (newData) {
            data = newData.slice(0);
        }
        var bounds = parent.getBoundingClientRect();

        width = bounds.width - margin.left - margin.right;
        height = bounds.height - margin.top - margin.bottom;

        svg.style("width", width);
        console.log(bounds);

       // xScale.domain([0, d3.max(data, xValue)]); // .range()
//xScale.domain([0, d3.max(data, d => d[`${valueField}`])]);
        xScale.range([0, width]);
        // set domain for y axis

        if (columns) {
            yScale.domain(columns).padding(0.1)
        } else {
            yScale.domain(data.map(yValue)).padding(0.1)
        }

        elements = chartGroup.selectAll(`.${barsClass}`)
            .data(data);
        /*elementselements
        * */
        elements.enter()
            .append("rect")
            .attr("class", barsClass)
            .attr("x", 0)
            .attr("y", d => yScale(d[`${labelField}`]))
            .attr("height", yScale.bandwidth())

            .attr("width", d => xScale(d[`${valueField}`]))
            .on("mousemove", function (d) {
                // NOTE: when the mouse cursor goes over the tooltip, tooltip flickering will appear
                // TODO remove / do something with the bneficiaries info in the tooltip

                const tooltipContent = tooltipRenderer(d);
                tooltip
                    .style("display", 'inline-block')
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 130 + "px")
                    .html(tooltipContent);
            })
            .on("mouseout", (d) => tooltip.style("display", "none"))
            .on("click", (d) => {
                if (barClickHandler && barClickHandler instanceof Function) {
                    barClickHandler({
                        data: d,
                        chartType: 'HORIZONTAL_BAR_CHART'
                    });
                }
            });


        elements.attr("x", 0)
            .attr("y", d => yScale(d[`${labelField}`]))
            .attr("height", yScale.bandwidth())
            .attr("width", d => xScale(d[`${valueField}`]));

        elements.exit()
            .remove();
        //    elements.enter()
        //        .append("text")
        //        .attr('class', 'bar-text')
        //        .attr("x", domain[1] * 0.08)
        //        .style("font-size", 11)
        //    .text((d)=> d[`${labelField}`])
        //        .attr("y", d => yScale(d[`${labelField}`]) + 12)
        // //   .attr("width", d => xScale(d[`${valueField}`]))
        //    ;
        //
chartGroup.select(xAxisClass)
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale).ticks(thickNmbr).tickFormat(d => d).tickSizeInner([-height]));
        if (showYaxis === true) {

        }
        //console.log(domain);
        //     d3.axisBottom(xScale);

        //   svg.select(xAxisClass).call(xAxis);
        // xAxis = d3.axisBottom(xScale).call(xAxis.ticks(thickNmbr).tickFormat(
        //     (d) => parseInt(d)).tickSizeInner([-height])
        // );
        // xaxis should not change
        // chartGroup.select(xAxisClass)
        //    .attr("transform", "translate(0," + height + ")")
        //    .call(xAxis.ticks(thickNmbr).tickFormat(
        //        (d) => parseInt(d)).tickSizeInner([-height])
        //    );

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
