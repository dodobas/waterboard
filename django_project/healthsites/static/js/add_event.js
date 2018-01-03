L.Icon.Default.imagePath = 'static/healthsites/css/images/leaflet/';

const DEFAULT_ICON_OPTIONS = {
        iconUrl: 'static/healthsites/css/images/add-new-2x.png',
        iconAnchor: [46, 65],
        iconSize: [92, 92],
        popupAnchor: [0, -92]
    };

function update_new_event_marker(lat, lng) {
    show_dashboard();
    remove_new_marker();

    var map = WB.storage.getItem('map');
    var eventMarker = WB.storage.setItem('eventMarker', new L.marker([lat, lng], {
        id: 'uni',
        draggable: 'true',
        icon: L.icon(DEFAULT_ICON_OPTIONS)
    }));

    eventMarker.setZIndexOffset(999999);

    eventMarker.on('dragend', function (e) {
        set_long_lat_form(this.getLatLng());
       // this.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    eventMarker.on('click', function (event) {

    });
    eventMarker.addTo(map);

    // change button state
    $("#add_button").show();
    $("#update_button").hide();
    reset_form();
}

function remove_new_marker() {
    var eventMarker = WB.storage.getItem('eventMarker');
    if (eventMarker) {
        var map = WB.storage.getItem('map');
        map.removeLayer(eventMarker);
    }
    WB.storage.setItem('eventMarker', null);
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
