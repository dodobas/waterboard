// BASE CONFIGURATION USED THROUGH WATERBOARD

var TABLE_ROWS_PER_PAGE = [[10, 20, 50, 100, 1000], [10, 20, 50, 100, 1000]];
var TABLE_ROWS_PER_PAGE_SMALL = [[10, 20, 50, 100], [10, 20, 50, 100]];
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
