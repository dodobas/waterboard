// use lodash from global


function calc (data, key) {

    var sum = _.sumBy(data, key);
    var minGroup = (_.minBy(data, key)) || {};
    var maxGroup = (_.maxBy(data, key)) || {};
    var avg = Math.round((sum / dataCnt));

    return {
        sum: sum === undefined ? '-' : sum,
        min: minGroup[key]  === undefined ? '-' :  minGroup[key],
        max: maxGroup[key] === undefined ? '-' :  maxGroup[key],
        avg: avg|| '-'
    }
}

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

    var _sumByKey = 'beneficiaries';
    var dataCnt;
    var sum, min, max;
    var avg;

    var calculated = {
        beneficiaries: {
            sum: '-',
            min: '-',
            max: '-',
            avg: '-'
        },
        count: {
            sum: '-',
            min: '-',
            max: '-',
            avg: '-'
        }
    };


    function chart(parentDom) {

        var infoDom;

        _updateChart = function () {
            infoDom.innerHTML = _createInfoRow('Beneficiaries', calculated.beneficiaries);

            infoDom.innerHTML +=  _createInfoRow('Count', calculated.count);
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
                ['max:', opts.max],
                ['avg:', opts.avg]
            ].map(function (item) {
                    return '<li><span>' + item[0] + '</span>' + '<span>' + item[1] + '</span></li>';
                }).join('') + '</ul>';

            return '<div class="info-row">' +
                    '<div class="info-row-label">'+ label +'</div>' +
                    '<div class="info-statistics">' +
                        '<div class="main-nmbr">'+ opts.sum +'</div>' +
                        '<div class="other-nmbr">' + otherInfo + '</div>' +
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

    function calc (data, key) {

        var sum = _.sumBy(data, key);
        var minGroup = (_.minBy(data, key)) || {};
        var maxGroup = (_.maxBy(data, key)) || {};
        var avg = Math.round((sum / dataCnt));

        return {
            sum: sum === undefined ? '-' : sum,
            min:  minGroup[key]  === undefined ? '-' :  minGroup[key],
            max:   maxGroup[key] === undefined ? '-' :  maxGroup[key],
            avg: avg|| '-'
        }
    }
    chart.calculateData = function (data) {
        dataCnt = (data || []).length;

        calculated.beneficiaries = calc(data, 'beneficiaries');
        calculated.count = calc(data, 'cnt');

        return chart;
    };

    chart.sumByKey = function (value) {
        if (!arguments.length) {
            return _sumByKey;
        }
        _sumByKey = value;

        return chart;
    };

    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        chart.calculateData(value);

        if (typeof _updateChart === 'function') {
            _updateChart();
        }

        return chart;
    };


    return chart;
}
