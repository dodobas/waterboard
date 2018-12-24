/**
 * Available tile layer definitions
 * @type {{bingLayer: {name: string, label: string, key: string, initType: string}, googleSatLayer: {name: string, label: string, mapOpts: {url: string, options: {maxZoom: number, subdomains: string[]}}, initType: string}, mapbox: {name: string, label: string, token: string, searchApi: string, mapOpts: {url: string, options: {attribution: string}}, initType: string}, osmLayer: {name: string, label: string, mapOpts: {url: string, options: {attribution: string}}, initType: string}, googleLayer: {name: string, label: string, mapOpts: {url: string, options: {maxZoom: number, subdomains: string[]}}, initType: string}}}
 */
const TILELAYER_DEFINITIONS = {
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


export default TILELAYER_DEFINITIONS;
