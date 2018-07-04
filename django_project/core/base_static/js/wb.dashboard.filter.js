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

    /**
     * Set initial filter state from filter keys
     *  - array for multiselect, null for single select
     *
     * Sample:
     *  {'filter_1': null, 'filter_2': null} or {'filter_1': [], 'filter_2': []}
     * @param filters
     */
    initFilters: function (filters) {
        var self = this;

        this.filters = (filters || this.filterKeys).reduce(function(acc, val, i) {
            acc[val] = self.multiSelect === true ? [] : null;
            return acc;
        }, {});
    },

    /**
     * Returns current active filters as key (chart identifier) / value (array of selected) pair
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

            if (_.isArray(filterVal) && (self.multiSelect === true && filterVal.length > 0)) {
                acc[val] = filterVal;
            }
            return acc;

        },{});

    },

    getCleanFilterKeys: function () {
        return Object.keys(this.getCleanFilters());
    },

    /**
     * Returns filter(s):
     * - single filter and its value (filterName specified)
     * - all filters
     * - all clean filters
     *
     * @param filterName
     * @param clean
     * @returns {*}
     */
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
     * {tabiya: ['name_1', 'name_2']}
     *
     * Initial filters should be defined as arrays
     *
     * @param filterName
     * @param filterValue
     * @returns {*}
     */
    addToFilter: function (filterName, filterValue) {

        if (this.multiSelect === true) {
            var filters = this.getFilter(filterName);
            this.filters[filters.name] = filters.value instanceof Array ? WB.utils.immutablePush(filters.value, filterValue, true) : (_.isNil(filterValue) ? [] : [filterValue]);

        }

        return this.filters;

    },

    removeFromFilter: function (filterName, filterValue) {


        if (this.multiSelect === true) {
            var filters = this.getFilter(filterName);
            this.filters[filters.name] = filters.value instanceof Array ? WB.utils.immutableRemove(filters.value, filterValue) : [];
        }

        return this.filters;

    },

    /**
     * Reset specified filter
     * - set value to array for multiselect, null for single select
     *
     * @param filterName
     * @returns {{}|*}
     */
    resetFilter: function (filterName) {

        if (this.filters[filterName] !== undefined) {
            this.filters[filterName] = this.multiSelect === true ? [] : null;
        } else {
            console.log('Provided Filter not found' + filterName);
        }

        return this.filters;
    }
};
