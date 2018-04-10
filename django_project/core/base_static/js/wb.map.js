var WB = WB || {};


/**
 * Init Map Tile layers from tile configuration
 *
 * will add created layers to leaflet layers (actual map)
 * will add created layers to baselayers used as control on map
 *
 * @param layerOpts
 * @returns {{layers: Array, baseLayers: {}}}
 */
function initTileLayers (layerOpts) {
    var initial = {
        layers: [],
        baseLayers: {} // used for controls
    };

    var withUrl = layerOpts.withUrl;

    var layers = Object.keys(withUrl).reduce( function (acc, cur, i) {
        acc.baseLayers[withUrl[cur].label] = acc.layers[i] = L.tileLayer(
            withUrl[cur].mapOpts.url,
            withUrl[cur].mapOpts.options
        );
        return acc;
    }, initial);

    // the bing layer is a leaflet plugin
    var bing = layerOpts.externalLayers.bingLayer;

    layers.layers[layers.layers.length] = L.tileLayer.bing(bing.key);
    layers.baseLayers[bing.label] = L.tileLayer.bing(bing.key);

    console.log('layers', layers);
    return layers;
}

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

function addMarkerToMap(opts) {
    var geometry = opts.geometry;
    var leafletMap = opts.leafletMap;
    var data = opts.data;
    var draggable = opts.draggable;
    var zoomToMarker = opts.zoomToMarker;

    var marker = L.marker(
        geometry, {
            draggable: draggable,
            icon: L.divIcon({
                className: 'map-marker',
                iconSize: [32,32],
                html:'<i class="fa fa-fw fa-map-pin"></i>'
            }),
        }).bindPopup(data._feature_uuid).addTo(leafletMap);

    marker.on('dragend', function (e) {
       var coord = marker.getLatLng();

        WB.FeatureForm.setFormFieldValues({
            _latitude: coord.lat,
            _longitude: coord.lng
        });

    });

    if (zoomToMarker === true) {
        leafletMap.fitBounds(L.latLngBounds([geometry]), {maxZoom: 12});
    }
    return marker;
}

/**
 * Create Markers on Dashboard page map
 * Markers are colored based on functioning group
 *
 * @param opts
 * @returns {*}
 */
function createDashBoardMarker(opts) {

    var marker = opts.marker;
    var iconIdentifierKey = opts.iconIdentifierKey;

    var fnc = {
        'Yes': 'functioning-yes',
        'No': 'functioning-no',
        'Unknown': 'functioning-unknown'
    };

    var popupContent = '<a target="_blank" href="/feature-by-uuid/' + marker.feature_uuid + '">' + marker.name + '</a><br/>YLD:' + marker.yield +'<br/>SWL:' + marker.static_water_level;

    if (marker.count) {
        return L.marker(L.latLng(marker.lat, marker.lng), {
            icon: L.divIcon({
                className: 'marker-cluster',
                iconSize: [40, 40],
                html:'<div><span><b>'+Humanize.humanize(marker.count)+'</b></span></div>'
            }),
            draggable: false
        }).on('click', function (e) {
            // TODO: hacky, but seems to work, on click zoom to the center point
            e.target._map.fitBounds(L.latLngBounds([e.latlng]), {maxZoom: e.target._map.getZoom() + 1});
        });

    } else {
        return L.marker(L.latLng(marker.lat, marker.lng), {
            icon: L.divIcon({
                className: 'map-marker ' + fnc[marker[iconIdentifierKey]],
                iconSize: [32,32],
                html:'<i class="fa fa-fw fa-map-pin"></i>'
            }),
            draggable: false
        }).bindPopup(popupContent);
    }


}

function geoSearch () {

}


function wbMap (options) {

    var initialMapView = options.initialMapView || [14.3, 38.3];
    var leafletConf = options.leafletConf || WB.Storage.getItem('defaultMapConf');
    var zoom =options.zoom || 6;

    var leafletMap = null;
    var _layerConf = null; // options.tileLayerDef;

    function _map (parentId) {
        leafletMap = L.map(parentId, leafletConf).setView(initialMapView, zoom);

        new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

        L.control.layers(_layerConf.baseLayers).addTo(leafletMap);
    }

    _map.layerConf = function (layerConf) {

        if (!arguments.length) {
            return _layerConf;
        }
        _layerConf = initTileLayers(layerConf || DEFAULT_TILELAYER_DEF);

        return _map;
    };


    _map.leafletConf = function (mapConf) {
        if (!arguments.length) {
            return leafletConf;
        }
        leafletConf = mapConf;

        return _map;
    };

    _map.leafletMap = function () {
        return leafletMap;
    };

    return _map;
}
/**
 * TODO transform to class again...
 * Wb leaflet map wrapper
 *
 * Will init tile layers and add tile control
 * Will add Zoom control
 * Will attach event handlers
 *
 * mapId            - parent id on wich the map will be appended
 * initialMapView   - lat lng for the initial map.setView()
 * mapConf          - leaflet map options
 * zoom             - zoom lvl TODO add to mapConf on fnc call
 * tileLayerDef     - tile layer to be used on leaflet - google, osm, mapbox...
 *
 * @param options
 * @returns {leafletMap}
 */
function ashowMap(options) {

    var mapId = options.mapId || 'featureMapWrap';
    var initialMapView = options.initialMapView || [14.3, 38.3];
    var mapConf = options.mapConf || WB.Storage.getItem('defaultMapConf');
    var zoom =options.zoom || 6;
    var tileLayerDef = options.tileLayerDef;

    var featureMarkers;

    var layerOpts = initTileLayers(tileLayerDef || DEFAULT_TILELAYER_DEF);

    mapConf.layers = layerOpts.layers[0];

    // only add the first layer to the map, when adding all layers, leaflet will create requests for all layers (we don't want that)
    var leafletMap = null;

    function renderMap () {
        leafletMap = L.map(mapId, mapConf).setView(initialMapView, zoom);
    }
    function addZoomControl () {
        new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);
    }
    function addLayersToMap () {
        // init layer control for all tile layers
        L.control.layers(layerOpts.baseLayers).addTo(leafletMap);
    }
    function initEvents () {
        // Map on moveend event handler
        if (options.mapOnMoveEndHandler && options.mapOnMoveEndHandler instanceof Function) {
             leafletMap.on('moveend', function () {
                 options.mapOnMoveEndHandler(this);
             });
        }
    }
    function _handleLayers(clearLayer, addToMap) {
        if (featureMarkers) {

            if (clearLayer === true) {
                featureMarkers.clearLayers()
            }

            if (addToMap === true && leafletMap && !leafletMap.hasLayer(featureMarkers)) {
                featureMarkers.addTo(leafletMap);
            }

        } else {
            featureMarkers = L.layerGroup([]);

            if (addToMap === true && leafletMap) {
                featureMarkers.addTo(leafletMap);
            }
        }
    }

    /**
     * Create leaflet Markers from  marker definitions - markersData
     *
     * @param markersData       - marker definitions {lat:, lng: , draggable: .... other}
     * @param leafletMap        - leaflet map instance
     * @param layerGroup        - if specified markers will be added to this layer group L.layerGroup([])
     * @param addToMap boolean  - if true will add marker layer to leaflet map
     * @param clearLayer boolean - if true will clear provided layer
     * @returns {layerGroup} featureMarkers
     */
    function _createMarkersOnLayer(options) {
        var markersData = options.markersData;
        var addToMap = options.addToMap;
        var clearLayer = options.clearLayer;
        var iconIdentifierKey = options.iconIdentifierKey;

        _handleLayers(clearLayer, addToMap);

        var i = 0, marker;

        var dataCnt = markersData.length;

        for (i; i < dataCnt; i += 1) {
            marker = createDashBoardMarker({
                marker: markersData[i],
                iconIdentifierKey: iconIdentifierKey
            });
            marker.addTo(featureMarkers);

        }

        return featureMarkers;
    }

    function _getCoord() {
        var bounds = leafletMap.getBounds();
        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()]
    }
    function _init () {
        renderMap();
        addZoomControl();
        addLayersToMap();
        initEvents();
    }

    function _initMapSearch () {

// init search box
        var searchParent = document.getElementById('geo-search-wrap');
        var searchResults = [];

        var search_field = $('<select name="search"></select>');
        $(searchParent).append(search_field);

        search_field.selectize({
            placeholder: 'Begin typing to search',
            valueField: 'id',
            labelField: 'place_name',
            searchField: ['place_name'],
            options: [],
            items: null,
            create: false,
            render: {
                option: function (place, escape) {
                    return '<div><span class="place">' + escape(place.place_name) + '</span></div>';
                }
            },
            load: function (query, callback) {
                if (!query) {
                    return callback();
                }

                var apiConf = WB.utils.getNestedProperty(WB.controller, 'mapConfig.tileLayerDef.withUrl.mapbox');

                var queryString =  query.trim().replace(' ', '+') + '.json?access_token=' + apiConf.token;
// TODO
                $.ajax({
                    url: apiConf.searchApi + queryString,
                    type: 'GET',
                    dataType: 'json',
                    error: function () { callback(); },
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
    }
    _init();

    _initMapSearch();
    return {
        leafletMap: leafletMap,
        init: _init,
        createMarkersOnLayer: _createMarkersOnLayer,
        getCoord: _getCoord

    };
}
