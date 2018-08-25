

/**
 * SchemeType "chart"
 *
 * Example: Pattern used for reusable d3 charts
 *
 * @returns {chart}
 */
function schemeTypeChart() {

    var _data;
    var _updateChart;

    function defaultIfUndefiend(value, chars) {
        var default_value = '-';

        if (chars !== undefined) {
            default_value = chars;
        }
        return (value === undefined || value === null) ? default_value : value;
    }

    function chart(parentDom) {

        var infoDom;

        _updateChart = function () {
            var scheme_type_keys = Object.keys(_data).sort();

            var all_elements = scheme_type_keys.map(function(value) {
                return _createInfoRow(value, {
                    'beneficiaries': defaultIfUndefiend(_data[value].total_beneficiaries, '*'),
                    'features': defaultIfUndefiend(_data[value].total_features)
                });
            });

            infoDom.innerHTML = all_elements.join('');
        };

        function _createInfoBlock () {
            infoDom = document.createElement('div');
            infoDom.setAttribute('class', 'wb-schemetype-chart');

            _updateChart();
        }

        function _createInfoRow (label, opts) {
            return '<div class="info-row">' +
                    '<div class="info-row-label">'+ label +'</div>' +
                    '<div class="info-statistics">' +
                        '<div class="main-nmbr">'+ opts.beneficiaries +'</div>' +
                        '<div class="other-nmbr">' + opts.features + '</div>' +
                    '</div>' +
                '</div>';
        }

        function _addToParent () {
            while ((parentDom.childNodes || []).length) {
                parentDom.removeChild(parentDom.firstChild);
            }
            parentDom.appendChild(infoDom);
        }

         _createInfoBlock();
        _addToParent();
    }

    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }

        _data = value;

        if (typeof _updateChart === 'function') {
            _updateChart();
        }

        return chart;
    };


    return chart;
}
