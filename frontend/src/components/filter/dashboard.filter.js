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
 * @param options
 */
export default class DashboardFilter {
    constructor(filterKeys, filterOnChange) {
        this.filterKeys = filterKeys;

        this.filters = this.filterKeys.reduce((acc, val) => {
            acc[val.filterKey] = {
                state: new Set([]),
                dataKey: val.dataKey,
                filterKey: val.filterKey
            };
            return acc;
        }, {});

        if (filterOnChange instanceof Function) {
            this.filterOnChange = filterOnChange;
        }

    }

    getActiveFilters = () => {

        //Object.keys(this.filters).forEach();
        return this.filterKeys.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size > 0) {// ##
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    dataKey: val.dataKey,
                    filterKey: val.filterKey
                };
            }
            return acc;

        }, {});

    };

    getEmptyFilters = () => {

        return this.filterKeys.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size === 0) { // ##
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    dataKey: val.dataKey,
                    filterKey: val.filterKey
                };
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
