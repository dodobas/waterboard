/*global L*/
import TILELAYER_DEFINITIONS from '../pages/config/map.layers';

import {
    initTileLayers,
    initMarkerLayer,
    selectizeSearch,
    addMarkersToMap
} from './mapUtils';

/**
 * Leaflet map handler
 *
 * @param conf
 *   init (bool)              - should map render on class init
 *   mapId (string)           - parent dom id
*   leafletConf (object)     - leaflet configuration options
 *     zoom (integer)
 *     editable (bool)
 *   initialMapView (array)   - center coordinates
 *   tileLayerDef (object)    - collection of tile layer definciotns
 *   enabledLayers (array)    - layers which will be available in the map control ordered by its array position
 *   mapOnMoveEndFn (function)- map on mopve end callback (fetch new data for extent)
 *   activeLayerName (string) - key of tile layer definition to be used on init
 *   initMarkersOnLoad (bool) - should marker render on class init
 *   markerRenderFn (funciton)- marker data render function
 *   markerData (array)       -
 *   mapSearch (object)
 *     enabled (bool)         - enable map search, search provider defined in tilelayer conf
 *     parentId (string)      - parent of search input
 *
 *
 *
 * @returns {_map}
 */
export default function wbMap(conf) {
    let options = conf || {};

    let {
        mapId,
        initialMapView = [14.3, 38.3],
        leafletConf = {
            zoom: 6
        },

        activeLayerName = 'MapBox',
        tileLayerDef = TILELAYER_DEFINITIONS,
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

    if ( _.get(_layerConf, activeLayerName)) {
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

        // ADD TILE LAYERS TO MAP INSTANCE / CONTROLS

        L.control.layers(_layerConf).addTo(_leafletMap);

        // ADD WB MARKER LAYER TO MAP INSTANCE

        _markerLayer = initMarkerLayer(true, _markerLayer, _leafletMap);

        // RENDER MARKERS ON MAP

        if(initMarkersOnLoad === true && (_markerData || []).length > 0) {
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

    /**
     * Set marker position specified by its index in marker layer
     * If no markerIx provided will default to last marker in layer
     * TODO
     * @param markerIx
     * @param latitude
     * @param longitude
     * @returns {_map}
     */
    _map.setMarkerPosition = function ({markerIx, latitude, longitude}) {

        let markers = _map.markerLayer().getLayers();

        let marker;
        if (!markerIx) {
           marker = _.last(markers);
        } else {
            marker = _.get(markers, markerIx);
        }

        marker.setLatLng([latitude, longitude]);

        _leafletMap.setView({
            lat: latitude,
            lng: longitude
        }, 10);
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

    _map.enableDragging = function (isDraggingEnabled) {
        let markers = _map.markerLayer().getLayers();

        // let lastMarker = markers[markers.length - 1];
        if (isDraggingEnabled === true) {
            _.forEach(markers, (marker) => {
                marker.dragging.enable();
            });
        } else {
            _.forEach(markers, (marker) => {
                marker.dragging.disable();
            });

        }
    };


    // TODO move somwhere, decide default search layer
    /**
     * Map search handler
     * TODO Search provider hardcoded to mapbox
     * @param query
     * @returns {string}
     */
    function buildSearchQueryString (query) {
        let {token, searchApi} = _.get(tileLayerDef, 'mapbox', {});

        const queryString = query.trim().replace(' ', '+') + `.json?access_token=${token}`;

        return `${searchApi}${queryString}`;
    }


    if (init === true) {
        _map();
    }
    return _map;
}
