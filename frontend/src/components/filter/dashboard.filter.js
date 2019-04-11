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
export class FilterHandler {
    constructor(filterDefinitions, filterOnChange) {
        this.filterDefinitions = filterDefinitions;

        // this.filters = this.filterDefinitions.reduce((acc, val) => {
        //     acc[val.filterKey] = {
        //         state: new Set([]),
        //         filterId: val.filterId,
        //         filterKey: val.filterKey
        //     };
        //     return acc;
        // }, {});

        if (filterOnChange instanceof Function) {
            this.filterOnChange = filterOnChange;
        }

        this.filterGroups = {};

        this.filterDefinitions.forEach(({groupName, filters}) => {
            this.registerFilterGroup(groupName, filters);
        });
    }

    registerFilterGroup  = (groupName, filters) => {
        let filterGroupFilters = filters.reduce((acc, val) => {
            acc[val.filterKey] = {
                state: new Set([]),
                filterId: val.filterId,
                filterKey: val.filterKey
            };
            return acc;
        }, {});


        this.filterGroups[groupName] = {
            filters: filterGroupFilters
        }
    };

    getActiveFilters = () => {

        //Object.keys(this.filters).forEach();
        return this.filterDefinitions.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size > 0) {// ##
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    filterId: val.filterId,
                    filterKey: val.filterKey
                };
            }
            return acc;

        }, {});

    };

    getEmptyFilters = () => {

        return this.filterDefinitions.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size === 0) { // ##
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    filterId: val.filterId,
                    filterKey: val.filterKey
                };
            }
            return acc;

        }, {});

    };

// TODO review implementing chaining... if filter onchange is set every change on any filter should call the on change method
    setFilter = (groupName, filterName, filterValue) =>{
        if(this.filters[filterName]) {
            this.resetFilter(filterName, false);
            this.filters[filterName].state.add(filterValue);
            this.handleFilterOnChange();
        }
    };

    addToFilter = (groupName, filterName, filterValue) => {
        let filter = this.filterGroups[`${groupName}`];

        if(filter && filter[filterName]){
            filter[filterName].state.add(filterValue);
            this.handleFilterOnChange();
        }
    };

    removeFromFilter = (groupName, filterName, filterValue) => {
        let filter = this.filterGroups[`${groupName}`];

        if(filter && filter[filterName]){
            filter[filterName].state.delete(filterValue);
            this.handleFilterOnChange();
        }
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












class Filter {
    constructor(config) {

        this.state = new Set([]);
        this.filterId = config.filterId;
        this.filterKey = config.filterKey;
    }
}



/**
 * Filter handler
 *
 * Filters are identified by filterKey (db column name) and are mapped through
 * filterId to charts and components
 *
 *   filterDataKeys - array of filter / data mapping
 *   filterId        - chart key, key used on client side
 *   filterKey      - db column name, key used on backend
 *   filterKeys - [{"filterId": "tabiya", "filterKey": "tabiya"},...]
 * returns filter instance
 */
export default class DashboardFilter {
    constructor(config, filterOnChange) {
        this.filterKeys = config;

        this.filters = this.filterKeys.reduce((acc, val) => {
            acc[val.filterKey] = {
                state: new Set([]),
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

// TODO review implementing chaining... if filter onchange is set every change on any filter should call the on change method
    setFilter = (filterName, filterValue) =>{
        if(this.filters[filterName]) {
            this.resetFilter(filterName, false);
            this.filters[filterName].state.add(filterValue);
            this.handleFilterOnChange();
        }
    };

    addToFilter = (filterName, filterValue) => {
        if(this.filters[filterName]){
            this.filters[filterName].state.add(filterValue);
            this.handleFilterOnChange();
        }
    };

    removeFromFilter = (filterName, filterValue) => {
        if(this.filters[filterName]){
            this.filters[filterName].state.delete(filterValue);
            this.handleFilterOnChange();
        }
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
