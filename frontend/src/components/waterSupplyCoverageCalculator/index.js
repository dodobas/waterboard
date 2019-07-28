import {createDomObjectFromTemplate} from "../../templates.utils";
import * as Mustache from "mustache";


let COVERAGE_CALCULATOR_TEMPLATE = `<div class="{{className}}">
<form class="form-inline">
    <div class="form-group">
        <label class="control-label" for="waterCoveragePopulation">{{populationLabel}}</label>
        <input name="waterCoveragePopulation" class="form-control" id="waterCoveragePopulation" type="text" min="1" value="{{population}}"/>
    </div>
    <div class="form-group">
        <label class="control-label">{{resultLabel}}</label>
        <div id="waterCoverageResult">0</div>
    </div>
    </form>
</div>`;

let _population = 100;
let _filterValue = 0;
let _result = 0;

let _dom = {
    population: {},
    result: {}
};

const _updateChartFn = () => {
    _dom.population.value = _population;
    _dom.result.innerHTML = _result;
};

/**
 * Round number to number of *decimals* specified
 *  - rounding problem with toFixed()...
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
        className: 'coverage-calculator-wrap',
        title: 'Water Supply',
        population: _population,
        sumLabel: 'Water Supply',
        populationLabel: 'Total P',
        resultLabel: 'Cov %'
    };


    let _domObj = createDomObjectFromTemplate(Mustache.render(templateStr, templateConf));

    _dom = {
        population: _domObj.querySelector('#waterCoveragePopulation'),
        result: _domObj.querySelector('#waterCoverageResult')
    };

    parentDom.appendChild(_domObj);

    document.addEventListener('change', function (ev) {

        let el = ev.target;

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
