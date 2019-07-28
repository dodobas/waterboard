import {createDomObjectFromTemplate} from "../../templates.utils";
import * as Mustache from "mustache";


let _data = {};


let COVERAGE_CALCULATOR_TEMPLATE = `<div class="{{className}}">
    
    
    <label for="waterCoverageFilterValue">{{title}}</label>
<input id="waterCoverageFilterValue" type="text" value="{{filterValue}}"/>

<label for="waterCoveragePopulation">Population</label>
<input name="waterCoveragePopulation" id="waterCoveragePopulation" type="text" min="1" value="{{population}}"/>

<div id="waterCoverageResult">0</div>
  </div>`;

let _population = 0;
let _filterValue = 0;
let _result = 0;

let _updateChartFn;

let _dom = {
    filterValue: {},
    population: {},
    result: {}
};
const _updateChart = () => {

    console.log(_dom);
    console.log('_population', _population);
    console.log('_filterValue', _filterValue);
    console.log('_result', _result);

    _dom.filterValue.value = _filterValue;
    _dom.population.value = _population;
    _dom.result.innerHTML = _result;
};

const _createUpdateFn = (element) => {
    return () => {
        _updateChart(element);
    }
};

/**
 * Round number to number of *decimals* specified
 *  - roiunding problem of toFixed()...
 * @param value
 * @param decimals
 * @returns {number}
 * @private
 */
function _round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}


// Water supply coverage of an area is computed as total beneficiaries in that area divided by its total population
function _calculateWaterSupplyCoverage(totalBeneficiaries, totalPopulation) {

    console.log('valc', totalBeneficiaries, totalPopulation);
    if (!(totalBeneficiaries > 0) || !(totalPopulation > 0)) {
        console.log('One or both values are not larger than 0');
        return 0;
    }

    let calculated = (totalBeneficiaries / totalPopulation);
    return _round(calculated, 2);
}

function coverageCalculator(options) {

    const {
        templateStr = COVERAGE_CALCULATOR_TEMPLATE,
        className = 'number-per-page',
        parentDom
    } = options;

    let templateConf = {
        className: 'wb-coverage-calculator',
        title: 'Water Supply',
        population: _population,
        filterValue: _filterValue
    };


    let _domObj = createDomObjectFromTemplate(Mustache.render(templateStr, templateConf));

    _dom = {
        filterValue: _domObj.querySelector('#waterCoverageFilterValue'),
        population: _domObj.querySelector('#waterCoveragePopulation'),
        result: _domObj.querySelector('#waterCoverageResult')
    };


    parentDom.appendChild(_domObj);


    _updateChartFn = _createUpdateFn(_domObj);


    document.addEventListener('change', function (ev) {
        console.log('this - change', this, ev);
        let el = event.target;

        if (el.name === 'waterCoveragePopulation') {
            coverageCalculator.data({
                population: parseInt(el.value)
            });
        }

    });
}

coverageCalculator.data = (newData) => {

    if (!newData) {
        return {

            filterValue: _filterValue,
            population: _population,
            result: _result

        }
    }

    let {population, filterValue} = newData;

    if (population > -1) {
        _population = population;
    }

    if (filterValue > -1) {
        _filterValue = filterValue;

    }

    if (_filterValue > -1 && _population > 0) {
        _result = _calculateWaterSupplyCoverage(_filterValue, _population);
    } else {
        _result = 0;
    }


    if (typeof _updateChartFn === 'function') {
        _updateChartFn();
    }

    return coverageCalculator;
};


const chartInit = (options) => {
    coverageCalculator(options);
    return coverageCalculator;
};

export default chartInit;
