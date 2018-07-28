const Info = {
   /* beneficiaries: {
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
    },*/
    initKeys: function (infoKeys) {
        let self = this;
        this.infoKeys = infoKeys;

        infoKeys.forEach((item) => {
            this[item.key] = {
                sum: '-',
                min: '-',
                max: '-',
                avg: '-'
            };
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


Info.initKeys([{
    key: 'beneficiaries',
    label: 'Beneficiaries'
},
{
    key: 'cnt',
    label: 'Count'
}]);

function _createInfoRow (label, opts) {

    const {min, max, avg, sum} = opts;

    var otherInfo = '<ul>' + [
        ['min:',  min], ['max:', max], ['avg:', avg]
    ].map((item) => `<li>
        <span>${item[0]}</span>
        <span>${item[1]}</span>
    </li>`
        ).join('') + '</ul>';

    return `<div class="info-row">
            <div class="info-row-label">${label}</div>
            <div class="info-statistics">
                <div class="main-nmbr">${sum}</div>
                <div class="other-nmbr">${otherInfo}</div>
            </div>
        </div>`;
}

function _createInfoBlock () {
    const infoDom = document.createElement('div');
    infoDom.setAttribute('class', 'wb-beneficiaries-chart');

    return infoDom;
}


/**
 * Beneficiaries "chart"
 *
 * Example: Pattern used for reusable d3 charts
 *
 * @returns {chart}
 */
function beneficiariesChart() {

    let _updateChartFn;

    const infoDom = _createInfoBlock();

    function chart(parentDom) {

        _updateChartFn = function () {
            infoDom.innerHTML =  '';

            Info.infoKeys.forEach((item) => {
                  infoDom.innerHTML += _createInfoRow(item.label, Info.get(item.key));
            });
        };

        parentDom.appendChild(infoDom);

        _updateChartFn();
    }

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


    return chart;
}
