/**
 * Created by ismailsunni on 5/9/15.
 */

L.Icon.Default.imagePath = 'static/event_mapper/css/images/leaflet/';
var new_event_marker;

const DEFAULT_ICON_OPTIONS = {
        iconUrl: 'static/event_mapper/css/images/add-new-2x.png',
        iconAnchor: [46, 65],
        iconSize: [92, 92],
        popupAnchor: [0, -92]
    };


function create_new_event_icon(options = DEFAULT_ICON_OPTIONS) {
    return L.icon(options);
}

function add_new_event_marker(lat, lng, icon) {
    remove_new_marker();

    WB.globals.eventMarker = new L.marker([lat, lng], {id: 'uni', draggable: 'true', icon: icon});

    WB.globals.eventMarker.setZIndexOffset(999999);

    WB.globals.eventMarker.on('dragend', function (event) {
        var new_event_marker = event.target;
        var position = new_event_marker.getLatLng();
        set_long_lat_form(position);
        WB.globals.eventMarker.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    WB.globals.eventMarker.on('click', function (event) {

    });
    WB.globals.eventMarker.addTo(WB.globals.map);
}

function update_new_event_marker(lat, lng) {
    show_dashboard();
    remove_new_marker();

    WB.globals.eventMarker = new L.marker([lat, lng], {id: 'uni', draggable: 'true', icon: create_new_event_icon()});

    WB.globals.eventMarker.setZIndexOffset(999999);

    WB.globals.eventMarker.on('dragend', function (event) {
        var new_event_marker = event.target;
        var position = new_event_marker.getLatLng();
        set_long_lat_form(position);

        WB.globals.eventMarker.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    WB.globals.eventMarker.on('click', function (event) {

    });
    WB.globals.eventMarker.addTo(WB.globals.map);

    // change button state
    $("#add_button").show();
    $("#update_button").hide();
    reset_form();
}

function remove_new_marker() {
    if (new_event_marker) {
        WB.globals.map.removeLayer(new_event_marker);
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
