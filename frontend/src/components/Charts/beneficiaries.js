// ===================================================
// HELPER FUNCTIONS
// ===================================================


/* beneficiaries: {
        sum: '-',
        min: '-',
        max: '-',
        avg: '-'
    },...*/
const DEFAULT_INFO_VALUE = {
    sum: '-',
    min: '-',
    max: '-',
    avg: '-'
};
const Info = {
    initKeys: function (infoKeys) {
        this.infoKeys = infoKeys;

        infoKeys.forEach((item) => {
            this[item.key] = DEFAULT_INFO_VALUE;
        });
    },
    setInfo: function (data, keys) {
        const dataCnt = (data || []).length;

        _.forEach(keys, (key) => {
            let sum = _.sumBy(data, key) || '-';

            this[key] = {
                sum: sum,
                min: _.get(_.minBy(data, key), key, '-'),
                max: _.get(_.maxBy(data, key), key, '-'),
                avg: Math.round((sum / dataCnt)) || '-'
            };
        });


    },
    get: function ( key) {
        return this[key];
    }
};

const _renderInfoItem = (item) => `<li>
    <span>${item[0]}</span>
    <span>${item[1]}</span>
</li>`;

function _createInfoRow (label, opts) {

    const {min, max, avg, sum} = opts;

    let otherInfo = '<ul>' + [
        ['min:',  min], ['max:', max], ['avg:', avg]
    ].map(_renderInfoItem).join('') + '</ul>';

    return `<div class="info-row">
            <div class="info-row-label">${label}</div>
            <div class="info-statistics">
                <div class="main-nmbr">${sum}</div>
                <div class="other-nmbr">${otherInfo}</div>
            </div>
        </div>`;
}

const _createUpdateChartFn = (parent) => () => {
    parent.innerHTML =  '';

    Info.infoKeys.forEach((item) => {
          parent.innerHTML += _createInfoRow(item.label, Info.get(item.key));
    });
};


// ===================================================
// Chart
// ===================================================

Info.initKeys([{
    key: 'beneficiaries',
    label: 'Beneficiaries'
},
{
    key: 'cnt',
    label: 'Count'
}]);


let infoWrapper;
let _updateChartFn;

function chart(parentDom) {

    infoWrapper = document.createElement('div');

    infoWrapper.setAttribute('class', 'wb-beneficiaries-chart');

    parentDom.appendChild(infoWrapper);

    _updateChartFn = _createUpdateChartFn(infoWrapper);

    _updateChartFn();
}

// BENEFICIARIES CHART DATA GETTER / SETTER
chart.data = function (data) {
    if (!arguments.length) {
        return Info.infoKeys.map((item) => Info.get(item.key));
    }

    Info.setInfo(data, ['beneficiaries', 'cnt']);

    if (typeof _updateChartFn === 'function') {
        _updateChartFn();
    }

    return chart;
};

function chartInit(parentDom) {
    chart(parentDom);
    return chart;
}

export default chartInit;
