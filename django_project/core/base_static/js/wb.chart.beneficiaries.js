

/**
 * Beneficiaries "chart"
 *
 * Example: Pattern used for reusable d3 charts
 *
 * @returns {chart}
 */
function beneficiariesChart() {

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

            infoDom.innerHTML = _createInfoRow('Beneficiaries', {
                'sum': defaultIfUndefiend(_data.total_beneficiaries, '*'),
                'min': defaultIfUndefiend(_data.min_beneficiaries),
                'max': defaultIfUndefiend(_data.max_beneficiaries),
                'avg': defaultIfUndefiend(_data.avg_beneficiaries),
            });

            infoDom.innerHTML +=  _createInfoRow('Number of waterpoints', {
                'sum': defaultIfUndefiend(_data.total_features, '*'),
                'min': defaultIfUndefiend(_data.min_features),
                'max': defaultIfUndefiend(_data.max_features),
                'avg': defaultIfUndefiend(_data.avg_features),
            });
        };

        function _createInfoBlock () {
            infoDom = document.createElement('div');
            // infoDom.style.height = '227px';
            infoDom.setAttribute('class', 'wb-beneficiaries-chart');

            _updateChart();
        }

        function _createInfoRow (label, opts) {
            var otherInfo = '<ul>' + [
                ['min:',  opts.min],
                ['avg:', opts.avg],
                ['max:', opts.max]
            ].map(function (item) {
                    return '<li><span>' + item[0] + '</span>' + '<span>' + item[1] + '</span></li>';
                }).join('') + '</ul>';

            return '<div class="info-row">' +
                    '<div class="info-row-label">'+ label +'</div>' +
                    '<div class="info-statistics">' +
                        '<div class="main-nmbr">'+ opts.sum +'</div>' +
                        // '<div class="other-nmbr">' + otherInfo + '</div>' +
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
