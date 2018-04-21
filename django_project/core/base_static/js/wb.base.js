var WB = WB || {};

var TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000, -1], [10, 20, 50, 100, 1000, "All"]];
var TABLE_ROWS_PER_PAGE_SMALL = [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]];
var DEFAULT_TIMESTAMP_IN_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
var DEFAULT_TIMESTAMP_OUT_FORMAT = 'YYYY-MM-DD HH:mm';


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



function initAccordion (conf) {
    var accordion = $(conf.selector);
    accordion.accordion(conf.opts);

    return accordion;
}



function tableRowClickHandlerFn(row) {
    if (!row.feature_uuid) {
        throw new Error('No Row UUID found');
    }
    var url = '/feature-by-uuid/'+row.feature_uuid;

    var win = window.open(url, '_blank');

    win.focus();
}

/**
 * Jquery datatable timestamp column renderer
 * @returns {*|string}
 */
function timestampColumnRenderer ( data, type, row, meta ) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
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
