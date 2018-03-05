var WB = WB || {};
WB.globals = WB.globals || {};


var globalVars = {
    selectedMarker: null,
    defaultMapConf: {
        editable: true,
        zoomControl: false,
        zoom: 6
    },
};

WB.storage = new SimpleStorage(globalVars);


const DEFAULT_MAP_CONF = {
    editable: true,
    zoomControl: false,
    zoom: 6
};

// # TODO add tokens ?access_token='
const DEFAULT_TILELAYER_DEF = {
        // TODO: replace ACCESS_TOKEN with one provided by the company
        externalLayers: {
            bingLayer: {
                label: 'Bing Layer',
                key: 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
            }
        },
        withUrl: {
            googleSatLayer: {
                label: 'Google Satellite',
                mapOpts: {
                    url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                    options: {
                        maxZoom: 20,
                        subdomains:['mt0','mt1','mt2','mt3']
                    }
                }

            },
            mapbox: {
                label: 'MapBox',
                mapOpts: {
                    url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFrc2hhayIsImEiOiJ5cHhqeHlRIn0.Vi87VjI1cKbl1lhOn95Lpw',
                    options: {
                        attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }
                }
            },
            osmLayer: {
                label: 'OSM',
                mapOpts: {
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    options: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }
                }
            },
            googleLayer: {
                label: 'Google Streets',
                mapOpts: {
                    url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                    options: {
                        maxZoom: 20,
                        subdomains:['mt0','mt1','mt2','mt3']
                    }
                }

            }
        }
    };

function getCoordFromMapBounds(map) {
    const bounds = map.getBounds();
    return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()]
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
function initTileLayers (layerOpts) {
    let initial = {
        layers: [],
        baseLayers: {}
    };

    const withUrl = layerOpts.withUrl;

    const layers = Object.keys(withUrl).reduce((acc, cur, i) => {
        acc.baseLayers[withUrl[cur].label] = acc.layers[i] = L.tileLayer(
            withUrl[cur].mapOpts.url,
            withUrl[cur].mapOpts.options
        );
        return acc;
    }, initial);

    const bing = layerOpts.externalLayers.bingLayer;

    layers.layers[layers.length] = layers.baseLayers[`${bing.label}`] =  L.tileLayer.bing(`${bing.key}`);

    return layers;
}

// WB.globals.map.setView([14.3, 38.3], 6);
/**
 * Leaflet map initializer
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
function showMap(options) {

    const {
        mapId = 'featureMapWrap',
        initialMapView = [14.3, 38.3],
        mapConf = DEFAULT_MAP_CONF,
        zoom = 6,
        tileLayerDef
    } = options;

//    L.WbDivIcon = initDivIconClass({});

    const {layers, baseLayers} = initTileLayers(tileLayerDef || DEFAULT_TILELAYER_DEF);

    let leafLetConf = Object.assign({}, mapConf, {layers: layers[0]});

    // only add the first layer to the map, when adding all layers, leaflet will create requests for all layers (we don't want that)
    const leafletMap = L.map(mapId, leafLetConf).setView(initialMapView, zoom);

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

    // init layer control for all tile layers
    L.control.layers(baseLayers).addTo(leafletMap);

    // Map on moveend event handler
    if (options.mapOnMoveEndHandler && options.mapOnMoveEndHandler instanceof Function) {
         leafletMap.on('dragend', function () {
             options.mapOnMoveEndHandler(this);
         });
    }

    return leafletMap;
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

function addMarkerToMap({geometry, leafletMap, data, draggable, zoomToMarker}) {

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
        const {lat, lng} = marker.getLatLng();

        let featuresForm = WB.storage.getItem('featuresForm');

        featuresForm.setFormFieldValues({
            _latitude: lat,
            _longitude: lng,
        });

    });

    if (zoomToMarker === true) {
        leafletMap.fitBounds(L.latLngBounds([geometry]), {maxZoom: 12});
    }
    return marker;
}

const createDashBoardMarker = ({marker, iconIdentifierKey}) => {

    const fnc = {
        'Yes': 'functioning-yes',
        'No': 'functioning-no',
        'Unknown': 'functioning-unknown'
    };

    const popupContent = `<a target="_blank" href="/feature-by-uuid/${marker.feature_uuid}">${marker.name}</a><br/>YLD: ${marker.yield}<br/>SWL: ${marker.static_water_level}`;

    return L.marker(L.latLng(marker.lat, marker.lng), {
        icon: L.divIcon({
        className: 'map-marker ' + fnc[marker[iconIdentifierKey]],
        iconSize: [32,32],
        html:'<i class="fa fa-fw fa-map-pin"></i>'
    }),
        draggable: false
    }).bindPopup(popupContent);
};

function ashowMap(options) {

    let {
        mapId = 'featureMapWrap',
        initialMapView = [14.3, 38.3],
        mapConf = DEFAULT_MAP_CONF,
        zoom = 6,
        tileLayerDef
    } = options;

    let featureMarkers;

    const {layers, baseLayers} = initTileLayers(tileLayerDef || DEFAULT_TILELAYER_DEF);

    let leafLetConf = Object.assign({}, mapConf, {layers: layers[0]});

    // only add the first layer to the map, when adding all layers, leaflet will create requests for all layers (we don't want that)
    let leafletMap = null;

    function renderMap () {
        leafletMap = L.map(mapId, leafLetConf).setView(initialMapView, zoom);
    }
    function addZoomControl () {
        new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);
    }
    function addLayersToMap () {
        // init layer control for all tile layers
        L.control.layers(baseLayers).addTo(leafletMap);
    }
    function initEvents () {
        // Map on moveend event handler
        if (options.mapOnMoveEndHandler && options.mapOnMoveEndHandler instanceof Function) {
             leafletMap.on('dragend', function () {
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
        const {markersData, addToMap, clearLayer, iconIdentifierKey} = options;

        _handleLayers(clearLayer, addToMap);

        let i = 0, marker;

        const dataCnt = markersData.length;

        for (i; i < dataCnt; i += 1) {
            marker = createDashBoardMarker({
                marker: markersData[i], iconIdentifierKey
            });
            marker.addTo(featureMarkers);

        }

        return featureMarkers;
    }

    function _getCoord() {
        const bounds = leafletMap.getBounds();
        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()]
    }
    function _init () {
        renderMap();
        addZoomControl();
        addLayersToMap();
        initEvents();
    }

    _init ();
    return {
        leafletMap,
        init: _init,
        createMarkersOnLayer: _createMarkersOnLayer,
        getCoord: _getCoord

    };
}
