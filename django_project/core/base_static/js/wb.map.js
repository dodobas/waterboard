var WB = WB || {};
WB.globals = WB.globals || {};



var globalVars = {
    selectedMarker: null,
    hcidMarkerUrl: '/static/healthsites/css/images/gray-marker-icon-2x.png',
    defaultMapConf: {
        editable: true,
        zoomControl: false
    },
};

WB.storage = new SimpleStorage(globalVars);


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


    var LeafIcon = L.Icon.extend({
        options: {
            shadowUrl: 'leaf-shadow.png',
            iconSize: [38, 95],
            shadowSize: [50, 64],
            iconAnchor: [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor: [-3, -76]
        }
    });

    var positionIcon = new LeafIcon({
        iconUrl: '/static/healthsites/css/images/gray-marker-icon-2x.png'
    });

    var marker = L.marker(geometry, {
        icon: positionIcon,
        draggable: 'true'
    }).bindPopup("Sample.").addTo(leafletMap);

    marker.on('dragend', function (e) {

       var newPosition = this.getLatLng();
        console.log('[marker dragend]', this, marker);
        console.log('[marker position]', newPosition);
    });


    return leafletMap;

}
