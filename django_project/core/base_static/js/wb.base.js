var WB = WB || {};

const TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000, -1], [10, 20, 50, 100, 1000, "All"]];
const DEFAULT_TIMESTAMP_IN_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const DEFAULT_TIMESTAMP_OUT_FORMAT = 'YYYY-MM-DD HH:mm';

const tableRowClickHandlerFn = (row) => {
    if (!row.feature_uuid) {
        throw new Error(`No Row UUID found`);
    }
    openInNewTab(`/feature-by-uuid/${row.feature_uuid}`);
};

const timestampColumnRenderer = ( data, type, row, meta ) => moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);


function SimpleStorage(storage) {
    this.storage = storage || {};
}

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

const immutableRemove = (arr, filterValue) => {
    const index = arr.indexOf(filterValue);

    if (index => -1) {
        return [
            ...arr.slice(0, index),
            ...arr.slice(index + 1)
        ];
    }
    return arr.slice(0);
};



// check if value is undefined or null
const isNil = (value) => value === null || value === undefined;


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

    getCleanFilterKeys: function () {
        const cleanFilters = this.getCleanFilters();

        return Object.keys(cleanFilters);
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

    },

    removeFromFilter: function (filterName, filterValue) {

        const {value, name} = this.getFilter(filterName);

        if (this.multiSelect === true) {

            this.filters = Object.assign({}, this.filters, {
                [`${name}`]: value instanceof Array ? immutableRemove(value, filterValue) : []
            });
        }

        return this.filters;

    }
};

// returns array indexes for slicing
// data array starts from 0, pages from 1
function pagination ({itemsCnt, itemsPerPage = 10}) {

    let _itemsCnt = itemsCnt;
    let _currentPage = 1; // 1 - 10, 11 -20, 21 -30
    let _itemsPerPage = itemsPerPage ;

    let _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);


    const _setOptions = ({itemsCnt, itemsPerPage}) => {
        if (itemsCnt !== undefined && itemsPerPage !== null) {
            _itemsCnt = itemsCnt;
            _itemsPerPage = itemsPerPage;

            _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);
        }
    };
// data.slice((current * itemsCnt), (current * itemsCnt + itemsCnt));
    const _setPage = (newPage) => {
        if (1 <= newPage && newPage <= _pageCnt) {
            _currentPage = newPage;

            return _getPage();
        }

        return _samePage();
    };

    const _getPage = () => {
        let a =  {
            firstIndex: _currentPage * _itemsPerPage - _itemsPerPage,
            lastIndex: _currentPage * _itemsPerPage,
            currentPage: _currentPage,
            itemsPerPage: _itemsPerPage,
            pageCnt: _pageCnt
        }
        console.log(a);

        return a;
    };

    const _samePage = () => {
        let samePage = _getPage();

        return Object.assign({}, samePage, {samePage: true});
    };

    const _nextPage = () => {
        let next = _currentPage + 1;

        if (next <= _pageCnt && next >= 1) {
            return _setPage(next);
        }
        return _samePage();
    };

    const _previousPage = () => {
        let prev = _currentPage - 1;
        if (1 <= prev && prev <= _currentPage && prev <= _pageCnt) {
            return _setPage(prev);
        }
        return _samePage();
    };


    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        currentPage: _currentPage,
        getPage: _getPage,
        setOptions: _setOptions
    }
}
