/**
 * dodo / knek
 * d3 helper functions
 */
var WB = (function (module) {

    const _createSvgOnParentById = (parentId, svgClass, svgWidth, svgHeight) => d3.select('#' + parentId)
        .append('svg')
        .attr('class', svgClass)
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const _addMainGroupToToSvg = (svg, margin) => svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    module.d3utils = module.d3utils || {};

    const d3Utils = {
        createSvgOnParentById: _createSvgOnParentById,
        addMainGroupToToSvg: _addMainGroupToToSvg
    };
    module.utils.d3 = Object.assign({}, module.d3utils, d3Utils);

    return module;
}(WB || {}));
