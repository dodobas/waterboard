/**
 * Simple filter handler
 *
 *
 * - filter - set of unique values identified by filter key
 * - filterKeys - array of field keys representing table column names,  ["tabiya", "woreda"]
 * - filterOnChange - filter on change callback function
 *                  - will call the fn with active filter state as argument
 *                  - context in cb fn is DashboardFilter if defined as fn(){}
 * Example:
 *   function filterCb () {}
 *   var f = new WBLib.DashBoardFilter({filterKeys: ["tabiya", "woreda"]}, filterCb);
 *   f.addToFilter('tabyija', 'sample_value');
 *   f.getActiveFilters();
 *   f.resetFilter('tabyija');
 *   f.resetFilters();
 *
 *
 *
 * register filter groups
 * @param options
 */

/**
 * 1 filter - multi values
 * 1 filter - 1 value
 *  single array
 *  obj
 * Filter handler
 *{
    "offset": 0,
    "limit": 25,
    "search": "a search string",
    "filter": [
        {"zone": ["central"]},
        {"woreda": ["ahferon", "adwa"]}
    ],
    "order": [
        {"zone": "asc"},
        {"fencing_exists": "desc"}
    ],
}

 * Filters are identified by filterKey (db column name) and are mapped through
 * filterId to charts and components
 *
 *   filterDataKeys - array of filter / data mapping
 *   filterId        - chart key, key used on client side
 *   filterKey      - db column name, key used on backend
 *   filterKeys - [{"filterId": "tabiya", "filterKey": "tabiya"},...]
 * returns filter instance
 */
export default class WbFilter {
    constructor(config, filterOnChange) {
        this.filterKeys = config;

        // this.filters = this.filterKeys.reduce((acc, val) => {
        //     acc[val.filterKey] = {
        //         state: new Set([]),
        //         filterId: val.filterId,
        //         filterKey: val.filterKey
        //     };
        //     return acc;
        // }, {});

        this.filters = this.filterKeys.reduce((acc, val) => {

            let defaultState;
            if(val.filterType === 'multiObj') {
                defaultState = {};
            } else if (val.filterType === 'multiArr'){
                defaultState = [];
            } else if (val.filterType === 'single'){
                defaultState = '';
            } else {
console.log('asd');
            }

            acc[val.filterKey] = {
                state: defaultState,
                filterType: val.filterType,
                filterId: val.filterId,
                filterKey: val.filterKey
            };
            return acc;
        }, {});



        if (filterOnChange instanceof Function) {
            this.filterOnChange = filterOnChange;
        }

    }

    serializeFilter = (filter) => {
        return {
            state: Array.from(filter.state),
            filterId: filter.filterId,
            filterKey: filter.filterKey
        };
    };


    getActiveFilters = () => {

        //Object.keys(this.filters).forEach();
        return this.filterKeys.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size > 0) {// ##
                acc[filter.filterKey] = this.serializeFilter(filter);
            }
            return acc;

        }, {});

    };

    getEmptyFilters = () => {

        return this.filterKeys.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size === 0) { // ##
                acc[filter.filterKey] = this.serializeFilter(filter);
            }
            return acc;

        }, {});

    };


    setFilter = (filterName, filterValue) =>{
        let _filter = this.filters[filterName];

        if(_filter){
            _filter.state = filterValue;
        }

    };

    addToFilter = (filterName, filterValue) => {
        let _filter = this.filters[filterName];

        if(_filter){


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

                let _key = filterValue.name;
             //   let _val = filterValue.value;

                _filter.state[`${_key}`] = filterValue.value;
            } else {

                _filter.state = filterValue;
            }

            //this.filters[filterName].state.add(filterValue);
            //this.handleFilterOnChange();
        }
    };

    removeFromFilter = (filterName, filterValue) => {
        let _filter = this.filters[filterName];

        if(_filter){


            if (_filter.filterType === 'multiArr') {


               _filter.state = _filter.state.filter((item, ix) => item !== filterValue);

                // // add to array
                // let _valIndex = _filter.state.indexOf(filterValue);
                //
                // if (_valIndex > -1) {
                //     _filter.state[_filter.state.length] = filterValue;
                // } else {
                //     console.log('Filter value already selected');
                // }
            } else if (_filter.filterType === 'multiObj') {

                let _key = filterValue.name;
             //   let _val = filterValue.value;

                _filter.state[`${_key}`] = filterValue.value;

                _filter.state = Object.keys(_filter.state).reduce((acc, key) => {
                      if (key !== _key) {
                        acc[key] = _filter.state[key];
                      }
                      return acc;
                    }, {});

            } else {
                console.log('das');
            }

            //this.filters[filterName].state.add(filterValue);
            //this.handleFilterOnChange();
        }

        // if(this.filters[filterName]){
        //     this.filters[filterName].state.delete(filterValue);
        //     this.handleFilterOnChange();
        // }
    };

    // triggerOnChange - used to avoid duplicate handleFilterOnChange() calls (setFilter calls resetFilter first then adds filter)
    resetFilter = (filterName, triggerOnChange) => {
        if(this.filters[filterName]){
            this.filters[filterName].state.clear();

            triggerOnChange && this.handleFilterOnChange();
        }
    };

    resetFilters = () => {
        Object.keys(this.filters).forEach((filterName) => this.resetFilter(filterName, false));
        this.handleFilterOnChange();
    };

    handleFilterOnChange = () => {
        if (this.filterOnChange instanceof Function) {
            this.filterOnChange.call(this, this.getActiveFilters());
        }
    }

}
