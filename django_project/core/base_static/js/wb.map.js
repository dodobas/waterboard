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
            label: 'Google',
            mapOpts: {
                url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                options: {
                    maxZoom: 20,
                    subdomains:['mt0','mt1','mt2','mt3']
                }
            }

        },
    };
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
function createMarker(geometry, positionIcon, options) {

    var marker = L.marker(geometry, {
        icon: positionIcon,
        draggable: 'true'
    }).bindPopup("Sample.");

    if (options && options.data) {
        marker.data = options.data;
    }

    marker.on('dragend', function (e) {

        var newPosition = this.getLatLng();
        console.log('[marker dragend]', this, marker);
        console.log('[marker position]', newPosition);

        // if (dragEndCb) {
        //     dragEndCb()
        // }
    });

    return marker;
}

function getCoordFromMapBounds(map) {
    const bounds = map.getBounds();
    return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()]
}


/**
 * Init custom div icon, used as marker
 * @param options
 */
function initDivIconClass(options) {
    var template = options.template || '<div class="wb-div-icon-marker"><i class="fa fa-map-marker fa-3x" aria-hidden="true"></i></div>';

    return L.DivIcon.extend({
        options: {
            className: 'wp-map-point',
            divText: 'not set',
            div: '',
            html: ''
        },

        createIcon: function () {
            var wrapDiv = document.createElement('div');
            wrapDiv.innerHTML = template;

            return wrapDiv;
        }
    });

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
    return Object.keys(layerOpts).reduce((acc, cur, i) => {
        acc.baseLayers[layerOpts[cur].label] = acc.layers[i] = L.tileLayer(
            layerOpts[cur].mapOpts.url,
            layerOpts[cur].mapOpts.options
        );
        return acc;
    }, {
        layers: [],
        baseLayers: {}
    });
}

// WB.globals.map.setView([14.3, 38.3], 6);
/**
 * Leaflet map initializer
 *
 * Will init tile layers and add tile control
 * Will add Zoom control
 * Will attach ecent handlers
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

    L.WbDivIcon = initDivIconClass({});

    const {layers, baseLayers} = initTileLayers(tileLayerDef || DEFAULT_TILELAYER_DEF);

    // only add the first layer to the map, when adding all layers, leaflet will create requests for all layers (we don't want that)
    const leafletMap = L.map(
        mapId,
        Object.assign({}, mapConf, {layers: layers[0]})
    ).setView(initialMapView, zoom);

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

    // init layer control for all tile layers
    L.control.layers(baseLayers).addTo(leafletMap);

    // Map on moveend event handler
    if (options.mapOnMoveEndHandler && options.mapOnMoveEndHandler instanceof Function) {
         leafletMap.on('moveend', function () {
             options.mapOnMoveEndHandler(this);
         });
    }

    return leafletMap;
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
function createMarkersOnLayer({markersData, leafletMap, layerGroup, addToMap, clearLayer}) {
    let featureMarkers;

    if (layerGroup) {

        if (clearLayer === true) {
            layerGroup.clearLayers()
        }

        if (addToMap === true && leafletMap && !leafletMap.hasLayer(layerGroup)) {
            layerGroup.addTo(leafletMap);
        }

        featureMarkers = layerGroup;
    } else {
        featureMarkers = L.layerGroup([]);

        if (addToMap === true && leafletMap) {
            featureMarkers.addTo(leafletMap);
        }
    }

    var i = 0;

    var dataCnt = markersData.length;

    for (i; i < dataCnt; i += 1) {
        var marker = markersData[i];

        L.marker(L.latLng(marker.lat, marker.lng), {
            // icon: new L.WbDivIcon(),
            draggable: false
        }).bindPopup(marker.feature_uuid).addTo(featureMarkers);
    }

    return featureMarkers;
}

function addMarkerToMap({geometry, leafletMap, data, dragendCB}) {

    var marker = L.marker(L.latLng(geometry), {
            draggable: false
        }).bindPopup(data._feature_uuid).addTo(leafletMap);

    if (data) {
        marker.data = data;
    }

    if (dragendCB) {
        marker.on('dragend', function (e) {
            dragendCB(this);
        });
    }
    return marker;
}
