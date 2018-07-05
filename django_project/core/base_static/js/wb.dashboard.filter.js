/**
 * Simple filter handler
 *
 * - filter - array of values identified by filter key
 * - filterKeys - array of field keys representing table column names
 *              - ["tabiya", "woreda"]
 * Example:
 * 	    var filter = new DashboardFilter({
 * 	        filterKeys: ['tabiya']
 * 	    });
 * 	    // filter.filters === {tabiya: []}
 * 	    filter.addToFilter(filter.tabiya, 'name_3'); // filter.filters === {tabiya: ['name_3']}
 *
 * 	    filter.removeFromFilter(filter.tabiya, 'name_3'); // filter.filters === {tabiya: []}
 *
 * @param options
 */

function DashboardFilter(options) {
    this.filterKeys = options.filterKeys;

    this.filters = {};

    this.initFilters();
}

DashboardFilter.prototype = {

    /**
     * Set empty array as initial filter state for every key in filter keys
     */
    initFilters: function () {
        this.filters = this.filterKeys.reduce(function(acc, val, i) {
            acc[val] = [];
            return acc;
        }, {});
    },

    /**
     * Returns non empty (active) filters as key/value (chart identifier) / (array of selected) pair
     * remove null and undefined values
     * @returns json
     */
    getActiveFilters: function () {
        var self = this;

        return this.filterKeys.reduce(function (acc, val){
            if (!_.isEmpty(self.filters[val])) {
                acc[val] = self.filters[val];
            }
            return acc;

        },{});

    },

    /**
     * Add filter value to filter array
     * @param filterName
     * @param filterValue
     * @returns {*}
     */
    addToFilter: function (filterName, filterValue) {
        if (!filterName || !this.filters[filterName]) {
            return;
        }
        this.filters[filterName] = _.union(this.filters[filterName] || [], [filterValue]);
    },

    /**
     * Add filter value to filter array
     * @param filterName
     * @param filterValue
     * @returns {*}
     */
    removeFromFilter: function (filterName, filterValue) {
        this.filters[filterName] = _.remove(this.filters[filterName] || [], filterValue);
    },

    /**
     * Reset specified filter, set value to empty array
     * @param filterName
     * @returns {{}|*}
     */
    resetFilter: function (filterName) {
        if (this.filters[filterName] !== undefined) {
            this.filters[filterName] = [];
        }
    }
};
