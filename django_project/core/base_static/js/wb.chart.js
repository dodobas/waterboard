// TODO combine width dashboard charts
/**
 *
 * @param options
 * @returns {{updateChart: _renderChart, chart}}
 */

function calcMargins(showYaxis, showTitle, defaultMargin) {
    let marginTop = 15;
    let marginBottom = 20;
    let marginLeft = showYaxis === false ? 15 : 30;

  /*  if (showTitle === true) {
        marginBottom = marginTop = 25;
    }*/

    return {
        _marginTop: marginTop,
        _marginRight: 15,
        _marginBot: marginBottom,
        _marginLeft: marginLeft
    };
}


/**
 * dodo / knek
 * d3 helper functions
 */
var WB = (function (module) {

    function _createSvgOnParentById (parentId, svgClass, svgWidth, svgHeight) {
        return d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', '100%')
        .attr('height', svgHeight)
    }

    function _addMainGroupToToSvg (svg, margin, groupClass) {
        return svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }



    module.d3utils = module.d3utils || {};

    module.utils.d3 = {
        createSvgOnParentById: _createSvgOnParentById,
        addMainGroupToToSvg: _addMainGroupToToSvg
    };
    return module;
}(WB || {}));
