/**
 * SchemeType "chart"
 *
 * Example: Pattern used for reusable d3 charts
 *
 * @returns {chart}
 */

import utils from '../../utils';

let _data = {};
let _updateChartFn;


const _updateChart = (element) => {
    const scheme_type_keys = Object.keys(_data).sort();

    const all_elements = scheme_type_keys.map(function (value) {
        return _createInfoRow(value, {
            'beneficiaries': utils.defaultIfUndefined(_data[value].total_beneficiaries, '*'),
            'features': utils.defaultIfUndefined(_data[value].total_features)
        });
    });

    element.innerHTML = all_elements.join('');
};


const _createInfoRow = (label, opts) => {
    return '<div class="info-row">' +
        '<div class="info-row-label">' + label + '</div>' +
        '<div class="info-statistics">' +
        '<div class="main-nmbr">' + opts.beneficiaries + '</div>' +
        '<div class="other-nmbr">' + opts.features + '</div>' +
        '</div>' +
        '</div>';
};

const createUpdateChartFn = (element) => {
    return () => {
        _updateChart(element);
    }
};

const chart = (parentDom) => {

    const infoWrapper = document.createElement('div');

    infoWrapper.setAttribute('class', 'wb-schemetype-chart');

    parentDom.appendChild(infoWrapper);

    _updateChartFn = createUpdateChartFn(infoWrapper);

    // update the chart
    _updateChartFn();
};

chart.data = (value = {}) => {
    _data = value;

    if (typeof _updateChartFn === 'function') {
        _updateChartFn();
    }

    return chart;
};


const chartInit = (parentDom) => {
    chart(parentDom);
    return chart;
};

export default chartInit;
