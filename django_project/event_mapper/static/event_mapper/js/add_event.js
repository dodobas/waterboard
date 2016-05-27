/**
 * Created by ismailsunni on 5/9/15.
 */

L.Icon.Default.imagePath = 'static/event_mapper/css/images/leaflet/';
var new_event_marker;

function update_new_event_marker(lat, lng) {
    remove_new_marker();
    new_event_marker = new L.marker([lat, lng], {id: 'uni', draggable: 'true'});

    new_event_marker.on('dragend', function (event) {
        var new_event_marker = event.target;
        var position = new_event_marker.getLatLng();
        set_long_lat_form(position);
        new_event_marker.setLatLng(position, {id: 'uni', draggable: 'true'});
    });
    new_event_marker.on('click', function (event) {

    });
    new_event_marker.addTo(map);

    var context = {
        'lat': lat, 'lng': lng
    };
    show_map(context);
    // change button state
    $("#add_button").removeClass('button-disabled');
    $("#add_button").prop('disabled', false);
    $("#update_button").removeClass('button-disabled');
    $("#update_button").prop('disabled', true);
    $("#id_name").val("");
    $('.alert').remove();
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

function set_long_lat_form(latlng) {
    $('#id_longitude').val(latlng.lat);
    $('#id_latitude').val(latlng.lng);
}

function reset_form() {
    $("input[type!='submit']").val("");
    $("option").removeAttr("selected");
}

function autofill_form(data) {
    reset_form();
    // autofill form
    $("input[name='name']").val(data['name']);
    $("input[name='latest_data_captor']").val(data['data_captor']);
    var date = ""
    if (data.created_date) {
        date = new Date(data.created_date);
    }
    $("input[name='latest_update']").val(date);
    var cleaned_data = {};
    Object.keys(data).forEach(function (key) {
        if (key.indexOf("assessment-") >= 0) {
            var value = data[key];
            var key = key.replace("assessment-", "").replace("_", " ");
            var keys = key.split("/");
            if (keys.length > 1) {
                var group = keys[0];
                var key = keys[1];
                if (!cleaned_data[group]) {
                    cleaned_data[group] = {}
                }
                cleaned_data[group][key] = value;

            }
        }
    });
    $('h3[role="tab"]').each(function () {
        // get group
        var group = $(this).text();
        // get all value
        var tab_panel = $('#' + $(this).attr('aria-controls'));
        var inputs = $(tab_panel).find('input');
        for (var i = 0; i < inputs.length; i++) {
            var key = $(inputs[i]).attr("name");
            if (cleaned_data[group] && cleaned_data[group][key]) {
                $(inputs[i]).val(cleaned_data[group][key]);
            }
        }
        var inputs = $(tab_panel).find('select');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var key = $(inputs[i]).attr("name");
            if (cleaned_data[group] && cleaned_data[group][key]) {
                var value = cleaned_data[group][key];
                var values = value.split(',');
                for (var j = 0; j < values.length; j++) {
                    var option = $(input).find("option[value='" + values[j] + "']");
                    $(option).prop('selected', true);
                }
            }
        }
    });
}