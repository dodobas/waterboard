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



function createMarker(geometry, positionIcon, dragEndCb) {

    var marker = L.marker(geometry, {
        icon: positionIcon,
        draggable: 'true'
    }).bindPopup("Sample.");

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

function initDivIconClass() {
    return L.DivIcon.extend({
        options: {
            className: 'wp-map-point',
            divText: 'not set',
            div: '',
            html: ''
        },

        createIcon: function () {
            var template = '<div class="wb-div-icon-marker"><i class="fa fa-map-marker fa-3x" aria-hidden="true"></i></div>';
            var wrapDiv = document.createElement('div');

            wrapDiv.innerHTML = template;

            return wrapDiv;
        }
    });

  //  return DivIcon;
}

function showMap(options) {

    var mapId = options.mapId || 'featureMapWrap';
    var geometry = options.data.geometry;
    var zoom = options.zoom || 6;
    var mapConf = options.mapConf;

    var leafletMap = L.map(mapId, mapConf).setView(geometry, zoom);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletMap);

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

    var DivIcon = initDivIconClass();

    var marker = createMarker(
        geometry,
        new DivIcon()
    );
    marker.addTo(leafletMap);

    return leafletMap;

}
