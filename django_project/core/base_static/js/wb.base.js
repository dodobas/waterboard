var WB = WB || {};

var TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000, -1], [10, 20, 50, 100, 1000, "All"]];
var DEFAULT_TIMESTAMP_IN_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
var DEFAULT_TIMESTAMP_OUT_FORMAT = 'YYYY-MM-DD HH:mm';

var globalVars = {
    defaultMapConf: {
        editable: true,
        zoomControl: false,
        zoom: 6
    }
};



// # TODO add tokens ?access_token='
var DEFAULT_TILELAYER_DEF = {
        // TODO: replace ACCESS_TOKEN with one provided by the company
        externalLayers: {
            bingLayer: {
                label: 'Bing Layer',
                key: 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
            }
        },
        withUrl: {
            googleSatLayer: {
                label: 'Google Satellite',
                mapOpts: {
                    url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                    options: {
                        maxZoom: 20,
                        subdomains:['mt0','mt1','mt2','mt3']
                    }
                }

            },
            mapbox: {
                label: 'MapBox',
                mapOpts: {
                    url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFrc2hhayIsImEiOiJ5cHhqeHlRIn0.Vi87VjI1cKbl1lhOn95Lpw',
                    options: {
                        attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }
                }
            },
            osmLayer: {
                label: 'OSM',
                mapOpts: {
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    options: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }
                }
            },
            googleLayer: {
                label: 'Google Streets',
                mapOpts: {
                    url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                    options: {
                        maxZoom: 20,
                        subdomains:['mt0','mt1','mt2','mt3']
                    }
                }

            }
        }
    };


function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function initAccordion (conf) {
    var accordion = $(conf.selector);
    accordion.accordion(conf.opts);

    return accordion;
}



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


// TODO unneded - remoev prolly
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
    getItems: function (keys) {
        var key, i = 0, items = {};

        var keysCnt = (keys || []).length;

        if (keysCnt > 1) {
            for (i; i < keysCnt; i += i) {
                key = keys[i];

                if (key !== undefined && key !== null) {
                    items[key] = WB.utils.getNestedProperty(this.storage, key);
                }
            }
            return items;
        }
        return this.storage;
    },

    removeItem: function (key) {
        delete this.storage[key];
    },
    setStorage: function (storage) {
        this.storage = storage || {};
    }
};

WB.Storage = new SimpleStorage(globalVars);

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
    return keys.reduce(function(acc, val, i) {
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

    this.multiSelect = options.multiSelect || false;

    this.filterKeys = options.filterKeys;

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



// https://github.com/mischat/js-humanize

Humanize = {
    humanize: function (value) {
        var mag = this.magnitude(value);

        if (mag <= 3) return value;

        if (mag > 3 && mag <= 6) {
            return value.toString().substr(0, mag - 3) + "K"
        }

        if (mag > 6 && mag <= 9) {
            return value.toString().substr(0, mag - 6) + "M"
        }

        if (mag > 9 && mag <= 12) {
            return value.toString().substr(0, mag - 9) + "B"
        }

        if (mag > 12 && mag <= 15) {
            return value.toString().substr(0, mag - 12) + "T"
        }

        return value;
    },

    magnitude: function (value) {
        var mag = 0;

        while(value > 1) {
          mag++;
          value = value / 10;
        };

        return mag;
    }
};
