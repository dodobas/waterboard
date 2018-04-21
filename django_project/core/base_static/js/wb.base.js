var WB = WB || {};

var TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000, -1], [10, 20, 50, 100, 1000, "All"]];
var TABLE_ROWS_PER_PAGE_SMALL = [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]];
var DEFAULT_TIMESTAMP_IN_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
var DEFAULT_TIMESTAMP_OUT_FORMAT = 'YYYY-MM-DD HH:mm';

var globalVars = {
    defaultMapConf: {
        editable: true,
        zoomControl: false,
        zoom: 6
    }
};

// thearray order defines the order in leaflet control
var DEFAULT_ENABLED_TILELAYERS  = [
    "bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"
];

var TILELAYER_DEFINITIONS = {
        // TODO: replace ACCESS_TOKEN with one provided by the company

        bingLayer: {
            name: 'bingLayer',
            label: 'Bing Layer',
            key: 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
            initType: 'custom'
        },
        googleSatLayer: {
            name: 'googleSatLayer',
            label: 'Google Satellite',
            mapOpts: {
                url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                options: {
                    maxZoom: 20,
                    subdomains:['mt0','mt1','mt2','mt3']
                }
            },
            initType: 'default'

        },
        mapbox: {
            name: 'mapbox',
            label: 'MapBox',
            token: 'pk.eyJ1Ijoia2tuZXpldmljIiwiYSI6ImNqZm54dHJlNTFldDAycW80ZHB1dm95c2IifQ.QBQpTxctlN1ftvVOQpNe6A',
            searchApi: 'https://api.mapbox.com/geocoding/v5/mapbox.places/',
            mapOpts: {
                url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2tuZXpldmljIiwiYSI6ImNqZm54dHJlNTFldDAycW80ZHB1dm95c2IifQ.QBQpTxctlN1ftvVOQpNe6A',
                options: {
                    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            },
            initType: 'default'
        },
        osmLayer: {
            name: 'osmLayer',
            label: 'OSM',
            mapOpts: {
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            },
            initType: 'default'
        },
        googleLayer: {
            name: 'googleLayer',
            label: 'Google Streets',
            mapOpts: {
                url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                options: {
                    maxZoom: 20,
                    subdomains:['mt0','mt1','mt2','mt3']
                }
            },
            initType: 'default'
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
        var newArray = arr.slice(0);

        newArray.splice(index, 1);

        return newArray;
    }
    return arr.slice(0);
}



// check if value is undefined or null
function isNil(value) {
    return (value === null || value === undefined)
}


// returns array indexes for slicing
// data array starts from 0, pages from 1
function pagination (options) {

    var _itemsCnt = options.itemsCnt;
    var _currentPage = 1;
    var _itemsPerPage = options.itemsPerPage || 10;

    var _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);

    var _paginationBlock;
    var _pageNmbrInfo;

    var chartKey = options.chartKey;

    function renderDom () {
        _paginationBlock = document.createElement('div');
        _paginationBlock.setAttribute('class', 'wb-pagination-block');

        _paginationBlock.innerHTML = '<div>' +
            '<button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">' +
                '<i class="fa fa-chevron-left" aria-hidden="true"></i>' +
            '</button>' +
            '<button data-pagination-button="next" class="btn btn-chart-pag btn-xs">' +
                '<i class="fa fa-chevron-right" aria-hidden="true"></i>' +
            '</button>' +
            '<div class="page-nmbr"></div>' +
        '</div>';

        document.getElementById(options.parentId).appendChild(_paginationBlock);

        _pageNmbrInfo = _paginationBlock.querySelector('.page-nmbr');
        var btns = _paginationBlock.querySelectorAll('[data-pagination-button]');

        var i = 0;

        for (i; i < btns.length; i += 1) {
            WB.utils.addEvent(btns[i], 'click', function () {
                var page = this.dataset.paginationButton === 'next' ? _nextPage() : _previousPage();
                if (page.samePage === true) {
                    return;
                }
                _pageNmbrInfo.innerHTML = page.currentPage + '/' + page.pageCnt;

                if (options.callback instanceof Function) {
                    options.callback(chartKey, page);
                }

            });
        }

        var page = _getPage();
        _pageNmbrInfo.innerHTML = page.currentPage + '/' + page.pageCnt;

    }

    function _setOptions (itemsCnt, itemsPerPage, currentPage)  {
        if (itemsCnt !== undefined) {
            _itemsCnt = itemsCnt;
            _itemsPerPage = itemsPerPage || 10;
            _currentPage = currentPage || _currentPage || 1 ;

            _pageCnt = Math.ceil(_itemsCnt / _itemsPerPage);

            _pageNmbrInfo.innerHTML = _currentPage + '/' + _pageCnt;

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
        var samePage = _getPage();

        samePage.samePage = true;

        return samePage;
    }

    function _nextPage () {
        var next = _currentPage + 1;

        if (next <= _pageCnt && next >= 1) {
            return _setPage(next);
        }
        return _samePage();
    }

    function _previousPage () {
        var prev = _currentPage - 1;
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
        setOptions: _setOptions,
        renderDom: renderDom
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
