/**
 * Simple filter handler
 *
 * - filter - set of unique values identified by filter key
 * - filterKeys - array of field keys representing table column names,  ["tabiya", "woreda"]
 *
 * Example:
 *   var f = new WBLib.DashBoardFilter({filterKeys: ["tabiya", "woreda"]});
 *   f.addToFilter('tabyija', 'sample_value');
 *   f.getActiveFilters('tabyija', 'sample_value');
 *   f.resetFilter('tabyija');
 *   f.resetFilters();
 *
 * @param options
 */
export default class DashboardFilter {
    constructor({filterKeys}) {
        this.filterKeys = filterKeys;

        this.filters = this.filterKeys.reduce((acc, val) => {
            acc[val] = new Set([]);
            return acc;
        }, {});
    }

    getActiveFilters = () => {
        return this.filterKeys.reduce((acc, val) => {
            if (this.filters[val].size > 0) {
                acc[val] = Array.from(this.filters[val]);
            }
            return acc;

        }, {});

    };

    addToFilter = (filterName, filterValue) =>
        this.filters[filterName] && this.filters[filterName].add(filterValue);

    removeFromFilter = (filterName, filterValue) =>
        this.filters[filterName] && this.filters[filterName].delete(filterValue);

    resetFilter = (filterName) =>
        this.filters[filterName] && this.filters[filterName].clear();

    resetFilters = () => {
        Object.keys(this.filters).forEach((filterName) => this.resetFilter(filterName));
    }
}
