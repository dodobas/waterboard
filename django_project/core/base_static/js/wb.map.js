var WB = WB || {};




/**
 * Create leaflet marker, attach dragend event
 *
 * Does not add the marker to map
 *
 * @param geometry
 * @param positionIcon
 * @param options
 * @returns {*}
 */

function createFeatureByUUidMarker(conf) {

    var opts = conf.markerData;

    var marker = L.marker(
        opts.geometry, {
            draggable:  opts.draggable === true,
            icon: L.divIcon({
                className: 'map-marker',
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-pin"></i>'
            })
        }).bindPopup((opts.data || {})._feature_uuid || '');

    marker.on('dragend', function (e) {
        var coord = marker.getLatLng();

        WB.FeatureForm.setFormFieldValues({
            _latitude: coord.lat,
            _longitude: coord.lng
        });

    });

    return marker;
}

/**
 * Create Markers on Dashboard page map
 * Markers are colored based on functioning group
 *
 * @param opts
 * @returns {*}
 */
function createDashBoardMarker(conf) {

    var opts = conf || {};
//  options.iconIdentifierKey, marker options
    var markerData = opts.markerData;
    var iconIdentifierKey = opts.options.iconIdentifierKey;

    var fnc = {
        'Yes': 'functioning-yes',
        'No': 'functioning-no',
        'Unknown': 'functioning-unknown'
    };

    var coords = L.latLng(markerData.lat, markerData.lng);
    var popupContent = '<a target="_blank" href="/feature-by-uuid/' + markerData.feature_uuid + '">' + markerData.name + '</a><br/>YLD:' + markerData.yield + '<br/>SWL:' + markerData.static_water_level;

    if (markerData.count !== undefined) {
        return L.marker(coords, {
            icon: L.divIcon({
                className: 'marker-cluster',
                iconSize: [40, 40],
                html: '<div><span><b>' + Humanize.humanize(markerData.count) + '</b></span></div>'
            }),
            draggable: false
        }).on('click', function (e) {
            // TODO: hacky, but seems to work, on click zoom to the center point
            this._map.fitBounds(L.latLngBounds([this.getLatLng()]), {
                maxZoom: this._map.getZoom() + 1
            });
        });

    } else {
        return L.marker(coords, {
            icon: L.divIcon({
                className: 'map-marker ' + fnc[markerData[iconIdentifierKey]],
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-pin"></i>'
            }),
            draggable: false
        }).bindPopup(popupContent);
    }


}

function wbMap(conf) {
    var options = conf || {};
    var initialMapView = options.initialMapView || [14.3, 38.3];
    var leafletConf = options.leafletConf || {
        zoom: 6
    };
    var markerLayer;

    var _layerConf;
    var markerData = [];
    var leafletMap = null; // options.tileLayerDef;


    function _map(parentId) {
        leafletMap = L.map(parentId, leafletConf).setView(initialMapView, leafletConf.zoom);

        L.control.layers(_layerConf).addTo(leafletMap);

    }

    // {MapBox: e, Google Satellite: e, Bing Layer: e}
    // get / set layer configurations
    _map.layerConf = function (layerConf) {

        if (!arguments.length) {
            return _layerConf;
        }
        _layerConf = initTileLayers(layerConf || DEFAULT_TILELAYER_DEF);

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

    // create / remove / clear map markers layer
    _map.handleMarkerLayer = function (clearLayer, addToMap) {
        if (markerLayer) {

            if (clearLayer === true) {
                markerLayer.clearLayers();
            }

            if (addToMap === true && leafletMap && !leafletMap.hasLayer(markerLayer)) {
                markerLayer.addTo(leafletMap);
            }

        } else {
            markerLayer = L.layerGroup([]);

            if (addToMap === true && leafletMap) {
                markerLayer.addTo(leafletMap);
            }
        }

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

    /**
     * render markers based on marker data
     * calls set markerRenderer function with marker data and options as arguments
     *
     * @param options any custom data provided at init
     * @returns {_map}
     */
    _map.renderMarkers = function (options) {

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
            console.log('No Marker data found');
        }
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
        var search_field = $('<select name="search"></select>');

        $(searchParent).append(search_field);

        search_field.selectize({
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

                var apiConf = WB.utils.getNestedProperty(WB.controller, 'mapConfig.tileLayerDef.withUrl.mapbox');

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
                console.log('===> id', id, searchResults);
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


    function renderMapSearchOption (place, escape) {
        return '<div><span class="place">' + escape(place.place_name) + '</span></div>';
    }


    /**
     * Init Map Tile layers from tile configuration
     *
     * will add created layers to leaflet layers (actual map)
     * will add created layers to baselayers used as control on map
     *
     * @param layerOpts
     * @returns {{layers: Array, baseLayers: {}}}
     */
    function initTileLayers(layerOpts) {
        var withUrl = layerOpts.withUrl;

        var baseLayers = Object.keys(withUrl).reduce(function (acc, cur, i) {
            acc[withUrl[cur].label] = L.tileLayer(
                withUrl[cur].mapOpts.url,
                withUrl[cur].mapOpts.options
            );
            return acc;
        }, {});

        // the bing layer is a leaflet plugin
        var bing = layerOpts.externalLayers.bingLayer;
        baseLayers[bing.label] = L.tileLayer.bing(bing.key);

        return baseLayers;
    }

    return _map;
}
/*
*
*  this.map = wbMap(this.mapConfig)
            .layerConf(this.mapConfig.tileLayerDef)
            .leafletConf({
                zoom: 6,
                editable: true
            }, 'MapBox')
            .markerRenderer(createDashBoardMarker)
            .initMapSearch({
                parentId: 'geo-search-wrap'
            });

        // render
        this.map(this.mapConfig.mapId);
* */
