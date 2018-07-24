var WB = WB || {};

function wbMap(conf) {
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

    var _markerLayer;
    var _searchField;
    var leafletMap = null;


    var _layerConf = initTileLayers(tileLayerDef, enabledLayers);

    if ( _.get(_layerConf, activeLayerName)) {
        leafletConf = Object.assign({}, leafletConf, {
            layers:  _layerConf[activeLayerName]
        });
    }


    function _map() {

        // INIT LEAFLET INSTANCE

        leafletMap = L.map(mapId, leafletConf)
            .setView(
                initialMapView,
                leafletConf.zoom
            );

        // ADD TILE LAYERS TO MAP INSTANCE

        L.control.layers(_layerConf).addTo(leafletMap);

        // ADD WB MARKER LAYER TO MAP INSTANCE

        initMarkerLayer(true);

        // RENDER MARKERS ON MAP

        if(initMarkersOnLoad === true && (markerData || []).length > 0) {
            addMarkersToMap(options, markerData);
        }

        // ADD MAP ON MOVE END CALLBACK

        if (mapOnMoveEndFn && mapOnMoveEndFn instanceof Function) {
            leafletMap.on('moveend', function () {
                mapOnMoveEndFn(this);
            });
        }

        // ENABLE MAP SEARCH

        if (mapSearch && mapSearch.enabled === true) {

            WBLib.selectizeSearch({
                parentId: mapSearch.parentId ||'geo-search-wrap',
                 urlFnc: buildSearchQueryString,
                leafletMap: leafletMap
            });

        }

    }

    // marker data getter / setter
    _map.markerData = function (data) {
        if (!arguments.length) {
            return markerData;
        }
        markerData = data;

        return _map;
    };

    // leflet map instance getter
    _map.leafletMap = () => leafletMap;
    _map.markerLayer = () => _markerLayer;

    // create /  clear map markers layer
    _map.clearLayer = function (clearLayer) {
        initMarkerLayer(clearLayer);

        return _map;
    };

    function initMarkerLayer (clearLayer) {
        if (_markerLayer) {

            if (clearLayer === true) {
                _markerLayer.clearLayers();
            }

            if ( leafletMap && !leafletMap.hasLayer(_markerLayer)) {
                _markerLayer.addTo(leafletMap);
            }

        } else {
            _markerLayer = L.layerGroup([]);

            if (leafletMap) {
                _markerLayer.addTo(leafletMap);
            }
        }
    }

    function addMarkersToMap(options, newMarkerData) {

        if (newMarkerData instanceof Array && newMarkerData.length > 0) {
            let marker;

            _.forEach(newMarkerData, (data) => {
                marker = markerRenderFn({
                    markerData: data,
                    _map: _map,
                    options: options
                });
                marker.addTo(_markerLayer);
            });

            if (newMarkerData[newMarkerData.length - 1].zoomToMarker === true && marker) {
                leafletMap.fitBounds(L.latLngBounds([marker.getLatLng()]), {maxZoom: 12});
            }
        } else {
            WB.notif.options({
              message: 'No Data found',
              type: 'warning'
            }).show();
        }
    }
    /**
     * render markers based on marker data
     * calls set markerRenderer function with marker data and options as arguments
     *
     * @param options any custom data provided at init
     * @returns {_map}
     */
    _map.renderMarkers = function (options) {

        addMarkersToMap(options, markerData);
        return _map;
    };

    _map.getMapBounds = function () {
        var bounds = leafletMap.getBounds();
        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];
    };

    // Clear map search drop down
    _map.clearSearchField = function () {
       _searchField[0].selectize.clear();

        return _map;
    };


    // TODO move somwhere, decide default search layer
    function buildSearchQueryString (query) {
        var apiConf = _.get(tileLayerDef, 'mapbox');

        var queryString = query.trim().replace(' ', '+') + '.json?access_token=' + apiConf.token;

        return apiConf.searchApi + queryString
    }

    /**
     * Init Map Tile layers from tile configuration
     *
     * will initialise layer instances, handling default leaflet layers and bing plugin layer
     *
     * @param layerOpts
     * @returns {{layers: Array, baseLayers: {}}}
     */
    function initTileLayers(layerOpts, enabledLayerNames) {

        return (enabledLayerNames || []).reduce((acc, layerName) => {

            let {initType, label, mapOpts, key} = layerOpts[layerName];

            if (!initType || initType === 'default') {
                acc[label] = L.tileLayer(
                    mapOpts.url,
                    mapOpts.options
                );

            } else if (initType === 'custom') {
                // currently only bing layer here
                acc[label] = L.tileLayer.bing(key);

            } else {
                console.log('Could not initialize map layers.');
            }

            return acc;
        }, {});

    }

    if (init === true) {
        _map();
    }
    return _map;
}
