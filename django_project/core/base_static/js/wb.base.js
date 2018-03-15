var WB = WB || {};

var TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000, -1], [10, 20, 50, 100, 1000, "All"]];
var DEFAULT_TIMESTAMP_IN_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
var DEFAULT_TIMESTAMP_OUT_FORMAT = 'YYYY-MM-DD HH:mm';

function tableRowClickHandlerFn(row) {
    if (!row.feature_uuid) {
        throw new Error('No Row UUID found');
    }
    openInNewTab('/feature-by-uuid/'+row.feature_uuid);
}

function timestampColumnRenderer ( data, type, row, meta ) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
}


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
function immutablePush(arr, newEntry, uniquePush){

    arr = arr.slice(0) || [];

    if (uniquePush === true) {
        if (arr.indexOf(newEntry) === -1) {
            arr.push(newEntry);

            return arr;
        }
        return arr;
    }
    arr.push(newEntry);

    return arr;
}

function immutableRemove(arr, filterValue) {
    var index = arr.indexOf(filterValue);

    if (index > -1) {
        let newArray = arr.slice(0);

        newArray.splice(index, 1);

        return newArray;
    }
    return arr.slice(0);
}



// check if value is undefined or null
function isNil(value) {
    return (value === null || value === undefined)
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
function createEmptyFilterObject(keys, multiSelect) {
    return keys.reduce(function(acc, val, i){
        acc[val] = multiSelect === true ? [] : null;
        return acc;
    }, {});
}

/**
 * Simple filter handler
 *
 * - filterKeys - array of field keys representing table column names
 *
 * @constructor
 */
function DashboardFilter(options) {

    var filterKeys = options.filterKeys;

    var multiSelect = options.multiSelect || false;

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

// returns array indexes for slicing
// data array starts from 0, pages from 1
function pagination (options) {

    let _itemsCnt = options.itemsCnt;
    let _currentPage = 1;
    let _itemsPerPage = options.itemsPerPage || 10;

    let _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);


    function _setOptions (itemsCnt, itemsPerPage, currentPage)  {
        if (itemsCnt !== undefined) {
            _itemsCnt = itemsCnt;
            _itemsPerPage = itemsPerPage || 10;
            _currentPage = currentPage || _currentPage || 1 ;

            _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);

            return _getPage();
        }
    }

    function _setPage (newPage) {
        if (1 <= newPage && newPage <= _pageCnt) {
            _currentPage = newPage;

            return _getPage();
        }

        return _samePage();
    }

    function _getPage () {
        return {
            firstIndex: _currentPage * _itemsPerPage - _itemsPerPage,
            lastIndex: _currentPage * _itemsPerPage,
            currentPage: _currentPage,
            itemsPerPage: _itemsPerPage,
            pageCnt: _pageCnt
        }

    }

    function _samePage () {
        let samePage = _getPage();

        samePage.samePage = true;

        return samePage;
    }

    function _nextPage () {
        let next = _currentPage + 1;

        if (next <= _pageCnt && next >= 1) {
            return _setPage(next);
        }
        return _samePage();
    }

    function _previousPage () {
        let prev = _currentPage - 1;
        if (1 <= prev && prev <= _currentPage && prev <= _pageCnt) {
            return _setPage(prev);
        }
        return _samePage();
    }


    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        currentPage: _currentPage,
        getPage: _getPage,
        setOptions: _setOptions
    }
}
