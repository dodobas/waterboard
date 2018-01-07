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

    var defaultMapConf = WB.storage.getItem('defaultMapConf');

    var leafletMap = L.map(mapId, defaultMapConf).setView(geometry, zoom);


    leafletMap = WB.storage.setItem(mapId, leafletMap);

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
        iconUrl: '/static/healthsites/css/images/gray-marker-icon-2x.png',
    });

    L.marker(geometry, {icon: positionIcon}).bindPopup("Sample.").addTo(leafletMap);

}
