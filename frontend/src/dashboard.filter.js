/**
 * Simple filter handler
 *
 * - filter - set of unique values identified by filter key
 * - filterKeys - array of field keys representing table column names,  ["tabiya", "woreda"]
 *
 * Example:
 *   var f = new WBLib.DashBoardFilter({filterKeys: ["tabiya", "woreda"]});
 *   f.addToFilter('tabyija', 'sample_value');
 *   f.getActiveFilters();
 *   f.resetFilter('tabyija');
 *   f.resetFilters();
 *
 * @param options
 */
export default class DashboardFilter {
    constructor(filterKeys) {
        this.filterKeys = filterKeys;
// filter i data key
        this.filters = this.filterKeys.reduce((acc, val) => {
            acc[val.filterKey] = {
                state: new Set([]),
                dataKey: val.dataKey,
                filterKey: val.filterKey
            };
            return acc;
        }, {});
    }

    getActiveFilters = () => {

        //Object.keys(this.filters).forEach();
        return this.filterKeys.reduce((acc, val) => {
            let filter = this.filters[val.filterKey];

            if (filter && filter.state.size > 0) {
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

            if (filter && filter.state.size === 0) {
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    dataKey: val.dataKey,
                    filterKey: val.filterKey
                };
            }
            return acc;

        }, {});

    };

    addToFilter = (filterName, filterValue) =>
        this.filters[filterName] && this.filters[filterName].state.add(filterValue);

    removeFromFilter = (filterName, filterValue) =>
        this.filters[filterName] && this.filters[filterName].state.delete(filterValue);

    resetFilter = (filterName) =>
        this.filters[filterName] && this.filters[filterName].state.clear();

    resetFilters = () => {
        Object.keys(this.filters).forEach((filterName) => this.resetFilter(filterName));
    }
}
