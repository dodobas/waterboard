
function hasClass(el, className) {
    console.log('hasClass', el);
  if (el.classList) {
    return el.classList.contains(className);
  }
  return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
    console.log('addClass', el);
  if (el.classList) {
    el.classList.add(className)
  }
  else if (!hasClass(el, className)) {
      el.className += " " + className;
  }
}

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  }
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className=el.className.replace(reg, ' ');
  }
}

function barChartHorizontal(options) {
    var _INIT_TIME = new Date().getTime();
    var _ID = options.parentId + '_' + _INIT_TIME;
    var _CHART_TYPE = 'HORIZONTAL_BAR_CHART';
    var _NAME = options.name;

    var data = options.data || [];
    var filterValueField = options.filterValueField || 'group';
    var columns = options.columns;
    var parentId = options.parentId || 'chart';
    var titleClass = options.titleClass || 'wb-chart-title';
    var svgClass = options.svgClass || 'wb-horizontal-bar';
    var thickNmbr = options.thickNmbr || 5;
    var xAxisClass = options.xAxisClass || 'x axis';
    var showXaxis = options.showXaxis || true;
    var showTitle = options.showTitle || true;
    var showYaxis = options.showYaxis || false;
    var barsClass = options.barsClass || 'bar';
    var labelClass = options.labelClass || 'wb-barchart-label';
    var fontSize = options.fontSize || 12;
    var toolTipClass = options.toolTipClass || 'wb-horizontal-bar-tooltip';
    var title = options.title;
    var valueField = options.valueField || 'cnt';
    var labelField = options.labelField || 'group';
    var barClickHandler = options.barClickHandler;
    var height = options.height || 400;
    var tooltipRenderer = options.tooltipRenderer || function () {return 'Default Tooltip'};
    var defaultMargin =  options.defaultMargin || {
        top: 40,
        right: 20,
        bottom: 30,
        left: 40
    };




    var _svgWidth, _svgHeight = height, _width, _height;

    function _sortData(data) {
        return data.sort(function (a, b) { return (b[valueField] - a[valueField]); })
    }
    // var _data = barCnt ? _sortData(data.slice(0, barCnt)) : _sortData(data.slice(0));
    var _data = _sortData(data.slice(0));

    var calculatedMargins = calcMargins(
        false, showTitle, defaultMargin
    );

    var _marginLeft = calculatedMargins._marginLeft;
    var _marginRight = calculatedMargins._marginRight;
    var _marginTop = calculatedMargins._marginTop;
    var _marginBot = calculatedMargins._marginBot;

    var parent = document.getElementById(parentId);

    var _activeBars = [];

    // TODO - append to chart div maybe?
    var tooltip = d3.select('body').append("div")
        .attr("class", toolTipClass)
        .attr("id", 'wb_tooltip_' + '_ID');

// labelField
    // data value helper
     function _xValue (d) {
        return WB.utils.getNestedProperty(d, valueField) || 0;
    }
    function _yValue (d) {
        return WB.utils.getNestedProperty(d, labelField);
    }
    function _generateBarId (d) {
        return [_ID, d[labelField]].join('_');
    }

    // axis scales
    var xScale = d3.scaleLinear();
    var yScale = d3.scaleBand();

    // axis scale value helper
    function _xScaleValue (d){ return  xScale((_xValue(d) || 0));}
    /*{
           //
           // if(d[valueField] !== undefined || d[valueField] !== null) {
           //    val = d[valueField];
           // }
           return
       };*/
    function _yScaleValue (d) {
        return yScale(_yValue(d));
    };

    // axis
    var _xAxis = d3.axisBottom(xScale);

    // main svg
    var svg = d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass);

    // Axis group and axis
    var _axisGroup = svg.append("g").classed('axis-group', true);
    var _xAxisGroup = _axisGroup.append("g").attr("class", xAxisClass);

    // Chart Group - represented data
    var _chartGroup = svg.append("g").classed('chart-group', true);

    // Chart title group
    var _titleGroup = svg.append("g").classed('title-group', true);
    var _chartTitle;

    function _handleClick(d) {

        var key = _yValue(d);

        var alreadyClicked = _activeBars.indexOf(key);

        if (alreadyClicked === -1) {
            // this.classList.add('wb-bar-active'
            // this.classList.add('wb-bar-active');
            console.log(this);
            $(this).addClass('wb-bar-active');

            _activeBars[_activeBars.length] = key;
        } else {

            _activeBars.splice(alreadyClicked, 1);

            var nodeId = _generateBarId(d);

            var node = _chartGroup.select('#' + nodeId);

           // node.node().classList.remove('wb-bar-active');
            let n = node.node();
            $(n).removeClass('wb-bar-active');
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

        var tooltipContent = tooltipRenderer(d);
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
        var bounds = parent.getBoundingClientRect();

        _svgWidth = bounds.width;
        //      _svgHeight = 400; //bounds.height ;//

        _width = _svgWidth - _marginLeft - _marginRight;

        _height = _svgHeight - _marginTop - _marginBot; //bounds.height - _marginTop - _marginBot;

        svg.attr("width", _svgWidth).attr("height", _svgHeight);

        _axisGroup.attr("width", _svgWidth).attr("height", _svgHeight);

        _chartGroup
            .attr("width", _width)
            .attr("height", _height)
            .attr("transform", "translate(" + [_marginLeft, _marginTop] + ")");

        if (columns) {
            yScale
                .domain(columns)
                .range([_height, 0])
                .padding(0.1);
        } else {
            yScale
                .domain(_data.sort(function (a, b){
                    return b[valueField] - a[valueField]
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
                .attr("transform", "translate(" + [_marginLeft, _svgHeight - _marginBot] + ")")
                .call(_xAxis.tickSizeInner([-height + _marginBot + _marginTop]));

            // .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));
        }
    }

    function addTitle() {
        _chartTitle = _titleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("class", titleClass)
            .style("text-decoration", "underline")
            .text(title);

    }

    function _updateTitle() {
        if (showTitle === true && title && title !== '') {
            _chartTitle
                .attr("x", (_width / 2))
                .attr("y", _marginTop - 2);
        }
    }

    function _getBarClass(d){
        if (_activeBars.indexOf(_yValue(d)) > -1) {
            return barsClass + ' wb-bar-active';
        }
        return barsClass;
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

        var elements = _chartGroup.selectAll('.' + barsClass)
            .data(_data);

        var labels = _chartGroup.selectAll('.' + labelClass)
            .data(_data);

        labels.exit().remove();
        elements.exit().remove(); // EXIT


        // this.classList.add('wb-bar-active');

        elements
            .enter()
            .append("rect")
            .merge(elements)
            .attr("class", _getBarClass)
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
            .attr("class", labelClass)
            .attr("y", function(d) {
                return (yScale(_yValue(d)) + (yScale.bandwidth() + fontSize / 2 ) / 2);
            }) // font size is 12
            .attr("x", 0)
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

    function _resetActive() {
        //  var activeBars = _chartGroup.selectAll(`.${barsClass}.wb-bar-active`);

        _activeBars.forEach(function (bar) {
            var obj = {};
            obj[labelField] = bar;

            var nodeId = _generateBarId(obj);

            var node = _chartGroup.select('#' + nodeId);

            // node.node().classList.remove('wb-bar-active');
            // removeClass(node.node(), 'wb-bar-active');
            $(node.node()).removeClass('wb-bar-active');

        });
        _activeBars = [];

    }

    return {
        updateChart: _renderChart,
        resize: _resize,
        resetActive: _resetActive,
        chart: svg,
        active: _activeBars
    };
}
