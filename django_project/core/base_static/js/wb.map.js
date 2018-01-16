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

function showMap(options) {

    var mapId = options.mapId || 'featureMapWrap';
    var geometry = options.data._geometry;
    var zoom = options.zoom || 6;
    var mapConf = options.mapConf;



    // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    // }).addTo(leafletMap);



    L.WbDivIcon = initDivIconClass({});

    var openstreetmapAttr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    var leaflet_layer   = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: openstreetmapAttr});

    var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });


    mapConf.layers = [leaflet_layer, googleStreets];
    var leafletMap = L.map(mapId, mapConf).setView(geometry, zoom);
    // var streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

    var baseLayers = {
		"OpenStr": leaflet_layer,
		"Google": googleStreets
	};
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
