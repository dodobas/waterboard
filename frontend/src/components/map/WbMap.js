import _get from 'lodash/get';

import {initTileLayers, initMarkerLayer, selectizeSearch, addMarkersToMap} from './mapUtils';

// Do not import leaflet ... use from global


// const DEFAULT_CONF = {
//        // mapId,
//         initialMapView: [14.3, 38.3],
//         leafletConf: {
//             zoom: 6
//         },
//
//         activeLayerName: 'MapBox',
//         tileLayerDef: TILELAYER_DEFINITIONS,
//
//         // layers which will be available in the map control ordered by its array position
//         enabledLayers: [
//             "bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"
//         ],
//         markerData: [],
//         markerRenderFn: null,
//         mapOnMoveEndFn: null,
//         initMarkersOnLoad: false,
//         init: false,
//
//
//         mapSearch: null
//     };


export default function wbMap(conf) {
    var options = conf || {};

    let {
        mapId,
        initialMapView = [14.3, 38.3],
        leafletConf = {
            zoom: 6
        },

        activeLayerName = 'MapBox',
        tileLayerDef = TILELAYER_DEFINITIONS,

        // layers which will be available in the map control ordered by its array position
        enabledLayers = [
            "bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"
        ],
        markerData = [],
        markerRenderFn = null,
        mapOnMoveEndFn = null,
        initMarkersOnLoad = false,
        init = false,
        mapSearch
    } = conf;

    let _markerData = markerData.slice(0);
    let _markerLayer;
    let _searchField;
    let _leafletMap = null;


    let _layerConf = initTileLayers(tileLayerDef, enabledLayers);

    if ( _get(_layerConf, activeLayerName)) {
        leafletConf = Object.assign({}, leafletConf, {
            layers:  _layerConf[activeLayerName]
        });
    }


    function _map() {

        // INIT LEAFLET INSTANCE

        _leafletMap = L.map(mapId, leafletConf)
            .setView(
                initialMapView,
                leafletConf.zoom
            );

        // ADD TILE LAYERS TO MAP INSTANCE

        L.control.layers(_layerConf).addTo(_leafletMap);

        // ADD WB MARKER LAYER TO MAP INSTANCE

        _markerLayer = initMarkerLayer(true, _markerLayer, _leafletMap);

        // RENDER MARKERS ON MAP

        if(initMarkersOnLoad === true && (_markerData || []).length > 0) {
            // addMarkersToMap(options, _markerData, markerRenderFn,  _markerLayer, _leafletMap);
            addMarkersToMap({
                options,
                markerRenderFn,
                markerData: _markerData,
                markerLayer:_markerLayer,
                leafletMap: _leafletMap
            });
        }

        // ADD MAP ON MOVE END CALLBACK

        if (mapOnMoveEndFn && mapOnMoveEndFn instanceof Function) {
            _leafletMap.on('moveend', function () {
                mapOnMoveEndFn(this);
            });
        }

        // ENABLE MAP SEARCH

        if (mapSearch && mapSearch.enabled === true) {

            selectizeSearch({
                parentId: mapSearch.parentId ||'geo-search-wrap',
                 urlFnc: buildSearchQueryString,
                leafletMap: _leafletMap
            });

        }

    }

    // marker data getter / setter
    _map.markerData = function (data) {
        if (!arguments.length) {
            return _markerData;
        }
        _markerData = data;

        return _map;
    };

    // leaflet map instance getter
    _map.leafletMap = () => _leafletMap;

    // leaflet marker layergetter
    _map.markerLayer = () => _markerLayer;

    // create /  clear map markers layer
    _map.clearLayer = function (clearLayer) {
        _markerLayer = initMarkerLayer(clearLayer, _markerLayer, _leafletMap);

        return _map;
    };

    /**
     * render markers based on marker data
     * calls set markerRenderer function with marker data and options as arguments
     *
     * @param options any custom data provided at init
     * @returns {_map}
     */
    _map.renderMarkers = function (options) {

        addMarkersToMap({
            options,
            markerRenderFn,
            markerData: _markerData,
            markerLayer:_markerLayer,
            leafletMap: _leafletMap
        });
        return _map;
    };

    _map.getMapBounds = function () {
        const bounds = _leafletMap.getBounds();

        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];
    };

    // Clear map search drop down
    _map.clearSearchField = function () {
       _searchField && _searchField[0].selectize.clear();

        return _map;
    };


    // TODO move somwhere, decide default search layer
    function buildSearchQueryString (query) {
        let {token, searchApi} = _get(tileLayerDef, 'mapbox', {});

        const queryString = query.trim().replace(' ', '+') + `.json?access_token=${token}`;

        return `${searchApi}${queryString}`;
    }


    if (init === true) {
        _map();
    }
    return _map;
}
