/**
 * Beneficiaries statistics charts
 *
 * Statistic item is identified by key and has a Label
 * @type {{initKeys: Info.initKeys, setInfo: Info.setInfo, get: (function(*): *)}}
 */

import utils from '../../utils';

let _data = {};
let _updateChartFn;


const _createInfoRow = (label, opts) => {
    var otherInfo = '<ul>' + [
        ['min:', opts.min],
        ['avg:', opts.avg],
        ['max:', opts.max]
    ].map(function (item) {
        return '<li><span>' + item[0] + '</span>' + '<span>' + item[1] + '</span></li>';
    }).join('') + '</ul>';

    return '<div class="info-row">' +
        '<div class="info-row-label">' + label + '</div>' +
        '<div class="info-statistics">' +
        '<div class="main-nmbr">' + opts.sum + '</div>' +
        '<div class="other-nmbr">' + otherInfo + '</div>' +
        '</div>' +
        '</div>';
};

const _updateChart = (element) => {

    element.innerHTML = '';

    element.innerHTML = _createInfoRow('Beneficiaries', {
        'sum': utils.defaultIfUndefined(_data.total_beneficiaries, '*'),
        'min': utils.defaultIfUndefined(_data.min_beneficiaries),
        'max': utils.defaultIfUndefined(_data.max_beneficiaries),
        'avg': utils.defaultIfUndefined(_data.avg_beneficiaries),
    });

    element.innerHTML += _createInfoRow('Count', {
        'sum': utils.defaultIfUndefined(_data.total_features, '*'),
        'min': utils.defaultIfUndefined(_data.min_features),
        'max': utils.defaultIfUndefined(_data.max_features),
        'avg': utils.defaultIfUndefined(_data.avg_features),
    });
};

const createUpdateChartFn = (element) => {
    return () => {
        _updateChart(element);
    }
};



const chart = (parentDom) => {

    const infoWrapper = document.createElement('div');

    infoWrapper.setAttribute('class', 'wb-beneficiaries-chart');

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
