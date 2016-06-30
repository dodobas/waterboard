/**
 * Created by ismailsunni on 5/9/15.
 */

L.Icon.Default.imagePath = 'static/event_mapper/css/images/leaflet/';
var new_event_marker;

function create_new_event_icon() {
    return L.icon({
        iconUrl: 'static/event_mapper/css/images/add-new-2x.png',
        iconAnchor: [46, 65],
        iconSize: [92, 92],
        popupAnchor: [0, -92]
    });
}
function update_new_event_marker(lat, lng) {
    show_dashboard();
    remove_new_marker();
    new_event_marker = new L.marker([lat, lng], {id: 'uni', draggable: 'true', icon: create_new_event_icon(),});
    new_event_marker.setZIndexOffset(999999);
    new_event_marker.on('dragend', function (event) {
        var new_event_marker = event.target;
        var position = new_event_marker.getLatLng();
        set_long_lat_form(position);
        new_event_marker.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    new_event_marker.on('click', function (event) {

    });
    new_event_marker.addTo(map);

    // change button state
    $("#add_button").show();
    $("#update_button").hide();
}

function remove_new_marker() {
    if (new_event_marker) {
        map.removeLayer(new_event_marker);
    }
    new_event_marker = null;
}

function add_marker_from_draw(layer) {
    var lat = layer.getLatLng().lat;
    var lng = layer.getLatLng().lng;
    update_new_event_marker(lat, lng);
    set_long_lat_form(layer.getLatLng());
}

function add_marker_from_control(position) {
    map_clicked();
    update_new_event_marker(position.lat, position.lng);
    set_long_lat_form(position);
}

function set_long_lat_form(latlng) {
    $('#id_longitude').val(latlng.lat);
    $('#id_latitude').val(latlng.lng);
}