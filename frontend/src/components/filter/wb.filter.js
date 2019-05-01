// const _DEFAULT_FILTER_STATES = {
//     multiObj: {},
//     multiArr: [],
//     single: ''
// };

function BaseFilter() {


}

function MultiObjFilter() {
    this.state = {};

    this.add = function ({name, value}) {
        this.state[`${name}`] = value;
    };
    this.remove = function (filterValue) {

        let _key = filterValue.name;

        this.state = Object.keys(this.state).reduce((acc, key) => {
            if (key !== _key) {
                acc[key] = this.state[key];
            }
            return acc;
        }, {});
    };

    this.clear = function () {
        this.state = {};
    }

}

function MultiArrFilter() {
    this.state = [];

    this.add = function (filterValue) {
        if (this.state.indexOf(filterValue) === -1) {
            this.state[this.state.length] = filterValue;
        } else {
            console.log('Filter value already selected');
        }
    };

    this.remove = function (filterValue) {
        this.state = this.state.filter((item) => item !== filterValue);
    };
    this.clear = function () {
        this.state = [];
    }
}

function SingleFilter() {
    this.state = '';

    this.add = function (filterValue) {
        this.state = filterValue;
    };
    this.clear = function () {
        this.state = '';
    }

}

function FilterFactory() {
    this.createFilter = function ({filterType, filterKey}) {
        let _filter;

        if (filterType === "multiObj") {
            _filter = new MultiObjFilter();
        } else if (filterType === "multiArr") {
            _filter = new MultiArrFilter();
        } else if (filterType === "single") {
            _filter = new SingleFilter();
        }

        _filter.filterType = filterType;
        _filter.filterKey = filterKey;

        _filter.get = function () {
            return this.state;
        };

            _filter.set = function (filterValue) {
                this.state =   filterValue;
            };
        return _filter;
    }
}

/**
 * Filter handler 2 - based on dashboard filter
 */
export default class WbFilter {


    constructor(props) {
        this.filterConfig = props.config;


        this.filters = this.filterConfig.reduce((acc, val) => {

            // TODO use _DEFAULT_FILTER_STATES
            let defaultState;
            if (val.filterType === 'multiObj') {
                defaultState = {};
            } else if (val.filterType === 'multiArr') {
                defaultState = [];
            } else if (val.filterType === 'single') {
                defaultState = '';
            } else {
                console.log('asd');
            }

            acc[val.filterKey] = {
                state: defaultState,
                filterType: val.filterType,
                filterKey: val.filterKey
            };
            return acc;
        }, {});


        if (props.onChange instanceof Function) {
            this.filterOnChange = props.onChange;
        }

    }

    getActiveFilters = () => {

        return this.filterConfig.reduce((acc, val) => {
            let _filter = this.filters[val.filterKey];

            if (_filter) {

                if (_filter.filterType === 'multiArr') {

                    if (_filter.state.length > 0) {
                        acc[_filter.filterKey] = _filter.state;
                    }

                } else if (_filter.filterType === 'multiObj') {

                    if (Object.keys(_filter.state || {}).length > 0) {
                        acc[_filter.filterKey] = _filter.state;
                    }

                } else {

                    if (_filter.state) {
                        acc[_filter.filterKey] = _filter.state;
                    }
                }
            }

            return acc;

        }, {});

    };

    getEmptyFilters = () => {
        return {};

    };

    setFilter = (filterName, filterValue) => {
        let _filter = this.filters[filterName];

        if (_filter) {
            _filter.state = filterValue;
            this.handleFilterOnChange();
        }

    };

    addToFilter = (filterName, filterValue) => {
        let _filter = this.filters[filterName];

        if (_filter) {


            if (_filter.filterType === 'multiArr') {
                // add to array
                if (_filter.state.indexOf(filterValue) === -1) {
                    _filter.state[_filter.state.length] = filterValue;
                } else {
                    console.log('Filter value already selected');
                }

            } else if (_filter.filterType === 'multiObj') {
                // add /overwrite object prop
                // order - zone asc, woreda desc
                // {name: value}

                _filter.state[`${filterValue.name}`] = filterValue.value;
            } else {

                _filter.state = filterValue;
            }
            this.handleFilterOnChange();
        }
    };

    /**
     * Remove value from filter
     * @param filterName
     * @param filterValue
     */
    removeFromFilter = (filterName, filterValue) => {
        let _filter = this.filters[filterName];

        if (_filter) {

            if (_filter.filterType === 'multiArr') {

                _filter.state = _filter.state.filter((item) => item !== filterValue);

            } else if (_filter.filterType === 'multiObj') {

                let _key = filterValue.name;

                _filter.state = Object.keys(_filter.state).reduce((acc, key) => {
                    if (key !== _key) {
                        acc[key] = _filter.state[key];
                    }
                    return acc;
                }, {});

            } else {
                console.log('das');
            }

            this.handleFilterOnChange();
        }

    };

    clearFilter = (filterName) => {

        let _filter = this.filters[filterName];

        if (_filter) {

            let defaultState;
            if (_filter.filterType === 'multiObj') {
                defaultState = {};
            } else if (_filter.filterType === 'multiArr') {
                defaultState = [];
            } else if (_filter.filterType === 'single') {
                defaultState = '';
            } else {
                console.log('Unknown filter type');

                return;
            }

            _filter.state = defaultState;
            this.handleFilterOnChange();
        }

    };

    handleFilterOnChange = () => {
        if (this.filterOnChange instanceof Function) {
            this.filterOnChange.call(this, this.getActiveFilters());
        }
    }

}
