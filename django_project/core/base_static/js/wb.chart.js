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

    if (showTitle === true) {
        marginBottom = marginTop = 25;
    }

    return {
        _marginTop: marginTop,
        _marginRight: 15,
        _marginBot: marginBottom,
        _marginLeft: marginLeft
    };
}
