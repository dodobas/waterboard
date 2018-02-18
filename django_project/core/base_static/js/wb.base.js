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
 * Simple filter handler
 * @constructor
 */
function DashboardFilter({filterKeys}) {
    this.filterKeys = filterKeys;

    this.filters = {};

    this.initFilters();
}
DashboardFilter.prototype = {

    // set initial filter state from filter keys
    initFilters: function (filters) {
        this.filters = (filters || this.filterKeys).reduce((acc, val, i) => {
            acc[`${val}`] = null;
            return acc;
        }, {});
        return this.filters;
    },

    // remove null and undefined values
    getCleanFilters: function () {

        const cleaned = {};

        let filterVal;

        this.filterKeys.forEach((key) => {
            filterVal = this.filters[`${key}`] ;
            if (filterVal !== null && filterVal !== undefined) {
                cleaned[`${key}`] = filterVal;
            }
        });

        return cleaned;

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

    setFilter: function (filterName, filterValue) {

        if (this.filters.hasOwnProperty(`${filterName}`)) {
            this.filters = Object.assign({}, this.filters, {
                [`${filterName}`]: filterValue
            });
            return this.filters;
        }
        console.log(`Filter - ${filterName} is not set.`);
        return false;
    }
};

