var WB = WB || {};
WB.globals = WB.globals || {};


var globalVars = {
    selectedMarker: null,
    defaultMapConf: {
        editable: true,
        zoomControl: false
    },
};

WB.storage = new SimpleStorage(globalVars);


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

function initLayer (opts) {
    return L.tileLayer(opts.url, opts.options);
}

var DEFAULT_LAYERS = {
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

        }
    };

function showMap(options) {

    var mapId = options.mapId || 'featureMapWrap';
    var geometry = options.data._geometry;
    var zoom = options.zoom || 6;
    var mapConf = options.mapConf;
    var layers = options.layers || DEFAULT_LAYERS;

    L.WbDivIcon = initDivIconClass({});

    // mapConf.layers = [osmLayer, googleLayer];
    mapConf.layers = [];
    var baseLayers = {};

    var l, conf;
    Object.keys(layers).forEach(function (layerName) {
        conf = layers[layerName];
        l = initLayer(conf.mapOpts);

        mapConf.layers[mapConf.layers.length] = l;
        baseLayers[conf.label] = l;


    });

    var leafletMap = L.map(mapId, mapConf).setView(geometry, zoom);

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);


    L.control.layers(baseLayers).addTo(leafletMap);

    return leafletMap;
}


function addMarkerToMap(geometry, leafletMap, options) {
    var marker = createMarker(
        geometry,
        new L.WbDivIcon(),
        options
    );
    marker.addTo(leafletMap);

    return marker;
}
