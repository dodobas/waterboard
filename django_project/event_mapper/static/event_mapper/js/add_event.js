/**
 * Created by ismailsunni on 5/9/15.
 */

L.Icon.Default.imagePath = 'static/event_mapper/css/images/leaflet/';
var new_event_marker;
var notes_seen = false;

function show_hide_killed(radio_button) {
    var killed_input = $('#id_killed');
    var killed_field = $("label[for=id_killed]");
    var injured_input = $('#id_injured');
    var injured_field = $("label[for=id_injured]");
    var detained_input = $('#id_detained');
    var detained_field = $("label[for=id_detained]");
    if (radio_button.value == '1') {
        // Incident, show all
        killed_input.show();
        killed_field.show();
        injured_input.show();
        injured_field.show();
        detained_input.show();
        detained_field.show();
    }
    else if (radio_button.value == '2') {
        // Advisory, hide all
        killed_input.hide();
        killed_field.hide();
        injured_input.hide();
        injured_field.hide();
        detained_input.hide();
        detained_field.hide();
    }
}

function update_incident_advisory() {
    $('input:radio[name=category]').change(function () {
        show_hide_killed(this);
    });
}

function place_name_autocomplete() {
    $("#id_place_name").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://gd.geobytes.com/AutoCompleteCity",
                dataType: "jsonp",
                data: {
                    q: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        minLength: 3,
        select: function (event, ui) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': $('#id_place_name').val()},
                function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var lat = results[0].geometry.location.lat();
                        var lng = results[0].geometry.location.lng();

                        set_latitude_form(lat);
                        set_longitude_form(lng);

                        update_new_event_marker(lat, lng);
                    } else {
                        alert("Something got wrong with location " +
                            "autocomplete." + status);
                    }
                });
        },
        open: function () {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function () {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });
}

function update_new_event_marker(lat, lng) {
    if (new_event_marker) {
        map.removeLayer(new_event_marker);
    }
    new_event_marker = new L.marker([lat, lng], {id: 'uni', draggable: 'true'})
        .bindPopup('<a href="http://localhost:49362/api/v1/healthsites/facility/add?geom=' + lat + ',' + lng + '">Add this to healthsites</a>');

    new_event_marker.on('dragend', function (event) {
        var new_event_marker = event.target;
        var position = new_event_marker.getLatLng();
        set_long_lat_form(position);
        get_city_from_latlang(position.lat, position.lng);
        new_event_marker.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    new_event_marker.addTo(map);

    var context = {
        'lat': lat, 'lng': lng
    };
    show_map(context);
    new_event_marker.openPopup();
}

function add_marker_from_draw(layer) {
    var lat = layer.getLatLng().lat;
    var lng = layer.getLatLng().lng;
    update_new_event_marker(lat, lng);
    set_latitude_form(lat);
    set_longitude_form(lng);
    get_city_from_latlang(lat, lng);
}

function set_longitude_form(longitude) {
    longitude = wrap_number(longitude, -180, 180);
    $('#id_longitude').val(longitude);
}

function set_latitude_form(latitude) {
    latitude = wrap_number(latitude, -90, 90);
    $('#id_latitude').val(latitude);
}

function set_long_lat_form(latlng) {
    set_latitude_form(latlng.lat);
    set_longitude_form(latlng.lng);
}

function show_hide_form(state) {
    $('#add_even_form').children().each(function (index, element) {
        if ($(element)[0].nodeName == 'DIV') {
            if (state === 'hide') {
                $(element).hide();
            } else if (state === 'show') {
                $(element).show();
            } else {
                $(element).show();
            }
        }
    });
}

function toggle_notes() {
    if (notes_seen) {
        // Show all fields
        show_hide_form('show');
        // Show / hides killed
        update_incident_advisory();
        // Hide notes
        show_hide_notes('hide');

    } else {
        // Hide all fields
        show_hide_form('hide');
        // Show notes
        show_hide_notes('show');
    }
    notes_seen = !notes_seen;
}

function show_hide_notes(state) {
    var div_id_notes = $('#div_id_notes');
    var toggle_button = $('#toggle_notes_button');
    if (state === 'hide') {
        div_id_notes.hide();
        toggle_button.val('Add Notes');
    } else if (state == 'show') {
        div_id_notes.show();
        toggle_button.val('Back');
    }
}

function get_city_from_latlang(latitude, longitude) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(latitude, longitude);
    var id_place_name = $('#id_place_name');
    var message;

    geocoder.geocode({
        'latLng': latlng
    }, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (result[0]) {
                var address = result[0].formatted_address;
                id_place_name.val(address);
            } else {
                message = 'Please write manually, geocoder failure due to ' + status;
                id_place_name.val('');
                $(id_place_name).attr('placeholder', message);
            }
        } else {
            message = 'Please write manually, geocoder failure due to ' + status;
            id_place_name.val('');
            $(id_place_name).attr('placeholder', message);
        }

    });
}