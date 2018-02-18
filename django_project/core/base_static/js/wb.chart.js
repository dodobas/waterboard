/**
 *
 * @param options
 * @returns {{updateChart: _renderChart, chart}}
 */

function calcMargins(showYaxis, showTitle, defaultMargin) {
    let marginTop = 15;
    let marginBottom = 20;
    let marginLeft = showYaxis === false ? 20 : 30;

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
