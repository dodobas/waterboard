var WB = WB || {};


function SimpleStorage(storage) {
    this.storage = storage || {};
};

SimpleStorage.prototype = {
    setItem: function (key, val) {
        this.storage[key] = val;
        return this.storage[key];
    },
    getItem: function (key) {
        if (key !== undefined && key !== null) {
            return WB.utils.getNestedProperty(this.storage, key);
        }
        return this.storage;
    },
    removeItem: function (key) {
        delete this.storage[key];
    },
    setStorage: function (storage) {
        this.storage = storage || {};
    },
    addArrayItem: function (key, item) {
        var arr = (this.storage[key] || []).slice(0);
        arr[arr.length] = item;

        this.storage[key] = arr;
    }
};

/**
 * Add an item to array, returns new array
 *
 * @param arr           - array
 * @param newEntry      - array item
 * @param uniquePush    - if true, will check if newEntry already exists in arr
 * @returns {Array}
 */
function immutablePush(arr = [], newEntry, uniquePush){
    if (uniquePush === true) {
        if (arr.indexOf(newEntry) === -1) {
            return [ ...arr, newEntry];
        }
        return arr.slice(0);
    }
    return [ ...arr, newEntry ];
}

// check if value is undefined or null
const isNil = (value) => value === null || value === undefined;

/**
 * Simple filter handler
 *
 * - filterKeys - array of field keys representing table column names
 *
 * @constructor
 */
function DashboardFilter(options) {

    const {filterKeys, multiSelect = false} = options;

    this.multiSelect = multiSelect;

    this.filterKeys = filterKeys;

    this.filters = {};

    this.initFilters();
}

/**
 * Reduce an array of filter keys to an object with empty prop values (array or null)
 * Used to init DashboardFilter initial filter state
 *
 * @param keys          - array of filter names (will become object keys), ['filter_1','filter_2'..]
 * @param multiSelect   - true | false, should the deafult value ne null or empty array
 *
 * @returns {Object}    - {'filter_1': null, 'filter_2': null} or {'filter_1': [], 'filter_2': []}
 */
const createEmptyFilterObject = (keys, multiSelect) => keys.reduce((acc, val, i) => {
    acc[`${val}`] = multiSelect === true ? [] : null;
    return acc;
}, {});

DashboardFilter.prototype = {

    // set initial filter state from filter keys
    // array for multselect, null for single select
    initFilters: function (filters) {
        this.filters = createEmptyFilterObject((filters || this.filterKeys), this.multiSelect);

        return this.filters;
    },

    // remove null and undefined values
    // remove empty arrays if multiSelect is true
    getCleanFilters: function () {

        let filterVal;

        return this.filterKeys.reduce((acc, val, i) => {
            filterVal = this.filters[`${val}`];

            if (!isNil(filterVal) && (this.multiSelect === true && filterVal instanceof Array && filterVal.length > 0)) {
                acc[`${val}`] = filterVal;
            }
            return acc;

        },{});

    },

    getFilter: function (filterName, clean) {
        if (!filterName) {
            if (clean === true) {
                return this.getCleanFilters();
            }
            return this.filters;
        }

        if (this.filters.hasOwnProperty(`${filterName}`)) {
            return {
                name: filterName || 'Does Not Exist.',
                value: this.filters[`${filterName}`] || null
            }
        }
        return null;
    },

    // set single filter single value {tabia: 'name'}
    setFilter: function (filterName, filterValue) {

        if (this.filters.hasOwnProperty(`${filterName}`)) {

            this.filters = Object.assign({}, this.filters, {
                [`${filterName}`]: filterValue
            });
            return this.filters;
        }
        console.log(`Filter - ${filterName} is not set.`);
        return false;
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

        const {value, name} = this.getFilter(filterName);

        if (this.multiSelect === true) {

            this.filters = Object.assign({}, this.filters, {
                [`${name}`]: value instanceof Array ? immutablePush(value, filterValue, true) : (isNil(filterValue) ? [] : [filterValue])
            });
        }

        return this.filters;

    }
};

