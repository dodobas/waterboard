var WB = WB || {};

function wbMap(conf) {
    var options = conf || {};
    var initialMapView = options.initialMapView || [14.3, 38.3];
    var leafletConf = options.leafletConf || {
        zoom: 6
    };
    var markerLayer;

    var _layerConf;

    // layers which will be available in the map control ordered by its array position
    var _enabledLayers = options.enabledLayers || [
        "bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"
    ];
    var _searchField;
    var markerData = [];
    var leafletMap = null;
    function _map(parentId) {
        leafletMap = L.map(parentId, leafletConf).setView(initialMapView, leafletConf.zoom);

        L.control.layers(_layerConf).addTo(leafletMap);

        initMarkerLayer(true);

        // renderMarkers
    }

    /**
     * Set layer whitelist keys which will be shown in leaflet control
     * Layer Key Order determines the render order in leaflet controll
     * @param layerNames
     * @returns {*}
     */
    _map.enabledLayers = function (layerNames) {

        if (!arguments.length) {
            return _enabledLayers;
        }
        _enabledLayers = layerNames;

        return _map;
    };

    // {MapBox: e, Google Satellite: e, Bing Layer: e}
    // get / set layer configurations
    _map.layerConf = function (layerConf) {

        if (_enabledLayers.length === 0) {
            throw new Error("No enabled layers found.");
        }

        if (!arguments.length) {
            return _layerConf;
        }
        _layerConf = initTileLayers(layerConf || TILELAYER_DEFINITIONS, _enabledLayers);

        return _map;
    };

    _map.mapOnMoveEnd = function (mapOnMoveEndFn) {
        if (mapOnMoveEndFn && mapOnMoveEndFn instanceof Function) {
            leafletMap.on('moveend', function () {
                mapOnMoveEndFn(this);
            });
        } else {
            console.log('Provided mapOnMoveEndHandler callback is not a function.');
        }
    };

    /**
     * Init leaflet tile layers
     *
     * @param mapConf leaflet map instance configuration
     * @param activeLayer layer name which will be added to map conf, layerConf must be set
     * @returns {*}
     */
    _map.leafletConf = function (mapConf, activeLayer) {
        if (!arguments.length) {
            return leafletConf;
        }

        mapConf.layers =  _layerConf[activeLayer || 'MapBox'];

        leafletConf = mapConf;

        return _map;
    };

    // marker data getter / setter
    _map.markerData = function (data) {
        if (!arguments.length) {
            return markerData;
        }
        markerData = data;

        return _map;
    };

    _map.leafletMap = function () {
        return leafletMap;
    };

    // create /  clear map markers layer
    _map.clearLayer = function (clearLayer) {
        initMarkerLayer(clearLayer);

        return _map;
    };

    _map.markerLayer = function () {
        return markerLayer;
    };
    // set marker render function
    _map.markerRenderer = function (renderFnc) {
        if (!arguments.length) {
            return _markerRenderFn;
        }
        if (renderFnc instanceof Function) {
            _markerRenderFn = renderFnc;
        } else {
            console.error('Provided Marker Render Function is a Function.');
        }
        return _map;
    };

    function initMarkerLayer (clearLayer) {
        if (markerLayer) {

            if (clearLayer === true) {
                markerLayer.clearLayers();
            }

            if ( leafletMap && !leafletMap.hasLayer(markerLayer)) {
                markerLayer.addTo(leafletMap);
            }

        } else {
            markerLayer = L.layerGroup([]);

            if (leafletMap) {
                markerLayer.addTo(leafletMap);
            }
        }
    }

    function addMarkersToMap(options) {

        if (markerData instanceof Array && markerData.length > 0) {
            var markersData = markerData.slice(0);
            var i = 0, marker;

            var dataCnt = markersData.length;

            for (i; i < dataCnt; i += 1) {
                marker = _markerRenderFn({
                    markerData: markersData[i],
                    _map: _map,
                    options: options
                });
                marker.addTo(markerLayer);

            }

            if (markersData[i - 1].zoomToMarker === true) {
                leafletMap.fitBounds(L.latLngBounds([marker.getLatLng()]), {maxZoom: 12});
            }
        } else {
            WB.notif.options({
              message: 'No Data found',
              type: 'warning'
            }).show();
            console.log('No Marker data found');
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

        addMarkersToMap(options);
        return _map;
    };

    _map.getMapBounds = function () {
        var bounds = leafletMap.getBounds();
        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];
    };

    _map.initMapSearch = function (options) {
        // callBack, parentId
    // init search box
        var searchResults = [];

        var searchParent = document.getElementById(options.parentId || 'geo-search-wrap');
        var field = $('<select name="search"></select>');

        $(searchParent).append(field);

        _searchField = field.selectize({
            placeholder: 'Begin typing to search',
            plugins: ["clear_button"],
            valueField: 'id',
            labelField: 'place_name',
            searchField: ['place_name'],
            options: [],
            items: null,
            create: false,
            render: {
                option: renderMapSearchOption
            },
            load: function (query, callback) {
                if (!query) {
                    return callback();
                }

                var apiConf = _.get(WB.controller, 'mapConfig.tileLayerDef.mapbox');

                var queryString = query.trim().replace(' ', '+') + '.json?access_token=' + apiConf.token;
// TODO
                $.ajax({
                    url: apiConf.searchApi + queryString,
                    type: 'GET',
                    dataType: 'json',
                    error: function () {
                        callback();
                    },
                    success: function (response) {
                        // response format is bound to api...
                        searchResults = response.features;

                        callback(searchResults);
                    }
                });

                return true;
            },
            onChange: function (id) {
                if (!id) {
                    return false;
                }
                // TODO review behaviour when none selected
                var result = _.find(searchResults, function (place) {
                    return place.id === id;
                });

                if (result === undefined) {
                    return false;
                }

                if (result.bbox !== undefined) {
                    leafletMap.fitBounds(
                        L.latLngBounds(
                            L.latLng(result.bbox[1], result.bbox[0]), // southWest
                            L.latLng(result.bbox[3], result.bbox[2]) // northEast
                        ));
                } else {
                    leafletMap.setView([result.center[1], result.center[0]], 18);
                }

                return true;
            }
        });

        return _map;
    };

    _map.clearSearchField = function () {
       _searchField[0].selectize.clear();

        return _map;
    };

    function renderMapSearchOption (place, escape) {
        return '<div><span class="place">' + escape(place.place_name) + '</span></div>';
    }


    /**
     * Init Map Tile layers from tile configuration
     *
     * will initialise layer instances, handling default leaflet layers and bing plugin layer
     *
     * @param layerOpts
     * @returns {{layers: Array, baseLayers: {}}}
     */
    function initTileLayers(layerOpts, enableLayers) {

        var baseLayers = {};
        var layerConf;

        enableLayers.forEach(function (layerName) {
            layerConf = layerOpts[layerName];

            if (!layerConf.initType || layerConf.initType === 'default') {
                baseLayers[layerConf.label] = L.tileLayer(
                    layerConf.mapOpts.url,
                    layerConf.mapOpts.options
                );

            } else if (layerConf.initType === 'custom') {
                // currently only bing layer here
                baseLayers[layerConf.label] = L.tileLayer.bing(layerConf.key);

            } else {
                console.log('Could not initialize map layers.');
            }
        });

        return baseLayers;
    }

    return _map;
}
