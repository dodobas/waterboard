/**
 * Simple filter handler
 *
 * - filterKeys - array of field keys representing table column names
 *
 * @constructor
 */
function DashboardFilter(options) {

    this.options = options;

    this.multiSelect = options.multiSelect || false;

    this.filterKeys = options.filterKeys;

    this.filters = {};

    this.initFilters();
}

DashboardFilter.prototype = {

    // set initial filter state from filter keys
    // array for multselect, null for single select
// {'filter_1': null, 'filter_2': null} or {'filter_1': [], 'filter_2': []}
    initFilters: function (filters) {
        var self = this;

        this.filters = (filters || this.filterKeys).reduce(function(acc, val, i) {
                acc[val] = self.multiSelect === true ? [] : null;
                return acc;
            }, {});
        return this.filters;
    },

    /**
     * Returns current active filters as key (chart identifier) value (array of selected) pair
     * remove null and undefined values
     * remove empty arrays if multiSelect is true
     * {
     *  tabiya: ['Midri-Felasi'],
     *  water_committe_exist: ['Yes', 'No']
     * }
     * @returns json
     */
    getCleanFilters: function () {
        var self = this;
        var filterVal;

        return this.filterKeys.reduce(function (acc, val, i){
            filterVal = self.filters[val];

            if (!isNil(filterVal) && (self.multiSelect === true && filterVal instanceof Array && filterVal.length > 0)) {
                acc[val] = filterVal;
            }
            return acc;

        },{});

    },


    getCleanFilterKeys: function () {
        var cleanFilters = this.getCleanFilters();

        return Object.keys(cleanFilters);
    },

    getFilter: function (filterName, clean) {
        if (!filterName) {
            if (clean === true) {
                return this.getCleanFilters();
            }
            return this.filters;
        }

        if (this.filters.hasOwnProperty(filterName)) {
            return {
                name: filterName || 'Does Not Exist.',
                value: this.filters[filterName] || null
            }
        }
        return null;
    },


    /**
     * Multi Filter Select handler, Add filter value to filters array (immutable)
     *
     * {tabia: ['name_1', 'name_2']}
     *
     * Initial filters should be defined as arrays
     *
     * @param filterName
     * @param filterValue
     * @returns {*}
     */
    addToFilter: function (filterName, filterValue) {

        var filters = this.getFilter(filterName);

        if (this.multiSelect === true) {
            this.filters[filters.name] = filters.value instanceof Array ? immutablePush(filters.value, filterValue, true) : (isNil(filterValue) ? [] : [filterValue]);

        }

        return this.filters;

    },

    removeFromFilter: function (filterName, filterValue) {

        var filters = this.getFilter(filterName);
        if (this.multiSelect === true) {
            this.filters[filters.name] = filters.value instanceof Array ? immutableRemove(filters.value, filterValue) : [];
        }

        return this.filters;

    }
};
