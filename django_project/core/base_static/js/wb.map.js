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

    // layerDefinitions.layers[layerDefinitions.layers.length] = L.tileLayer.bing(bing.key);
    baseLayers[bing.label] = L.tileLayer.bing(bing.key);

    return baseLayers;
    /*return {
        activeLayer: baseLayers[layerOpts.initialActiveLayer || 'MapBox'],
        baseLayers: baseLayers
    };*/
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
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-pin"></i>'
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

    var popupContent = '<a target="_blank" href="/feature-by-uuid/' + marker.feature_uuid + '">' + marker.name + '</a><br/>YLD:' + marker.yield + '<br/>SWL:' + marker.static_water_level;

    if (marker.count) {
        return L.marker(L.latLng(marker.lat, marker.lng), {
            icon: L.divIcon({
                className: 'marker-cluster',
                iconSize: [40, 40],
                html: '<div><span><b>' + Humanize.humanize(marker.count) + '</b></span></div>'
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
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-pin"></i>'
            }),
            draggable: false
        }).bindPopup(popupContent);
    }


}

function geoSearch() {

}


function wbMap(options) {
    console.log('options asda', options);
    var initialMapView = options.initialMapView || [14.3, 38.3];
    var leafletConf = options.leafletConf || WB.Storage.getItem('defaultMapConf');
    var zoom = options.zoom || 6;

    var markerLayer, baseLayers, layers, initialActiveLayer;

    var _layerConf = {
        activeLayer: null,
        baseLayers: null
    };
    var markerData;
    var leafletMap = null; // options.tileLayerDef;

    function _map(parentId) {
        leafletMap = L.map(parentId, leafletConf).setView(initialMapView, zoom);

        new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

        L.control.layers(_layerConf.baseLayers).addTo(leafletMap);
    }

    // {MapBox: e, Google Satellite: e, Bing Layer: e}
    // set layer configurations
    _map.layerConf = function (layerConf) {

        if (!arguments.length) {
            return _layerConf;
        }
        _layerConf = initTileLayers(layerConf || DEFAULT_TILELAYER_DEF);

        return _map;
    };

    _map.mapOnMoveEnd = function (mapOnMoveEndHandler) {
        if (mapOnMoveEndHandler && mapOnMoveEndHandler instanceof Function) {
            leafletMap.on('moveend', function () {
                mapOnMoveEndHandler(this);
            });
        } else {
            console.log('Provided mapOnMoveEndHandler callback is not a function.');
        }
    };

    // leaflet map options getter / setter
    // will add active layer to map config
    /**
     *
     * @param mapConf leaflet map instance configuration
     * @param activeLayer layer name which will be added to map conf
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
                markerLayer.clearLayers()
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

    _map.renderMarkers = function (options) {
        var markersData = markerData.slice(0);

        var i = 0, marker;

        var dataCnt = markersData.length;

        for (i; i < dataCnt; i += 1) {
            marker = createDashBoardMarker({
                marker: markersData[i],
                iconIdentifierKey: options.iconIdentifierKey
            });
            marker.addTo(markerLayer);

        }

        return _map;
    };

    _map.getMapBounds = function () {
        var bounds = leafletMap.getBounds();
        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];
    };

    _map.initMapSearch = function (options) {
        // callBack, parentId
console.log('initMapSearch',  this.map);

    // init search box
        var searchParent = document.getElementById(options.parentId || 'geo-search-wrap');
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
    };

    return _map;
}
