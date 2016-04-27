/**
 * Created by ismailsunni on 5/9/15.
 */

// Variables
var markers = [];
var INCIDENT_CODE = 1;
var ADVISORY_CODE = 2;
var pie_chart;
var selected_marker = null;


function normalize_json_string(string) {
    return string.replace(/\n/g, '<br>').slice(6, -6)
}

function create_icon(raw_event_icon) {
    return L.icon({
        iconUrl: raw_event_icon,
        iconAnchor: [15, 30],
        iconSize: [30, 30],
        popupAnchor: [0, -30]
    });
}

function create_big_icon(raw_event_icon) {
    return L.icon({
        iconUrl: raw_event_icon,
        iconAnchor: [25, 50],
        iconSize: [50, 50],
        popupAnchor: [0, -50]
    });
}
function on_click_marker(marker) {
    reset_all_markers(marker);
    var is_selected = marker.options.event_selected;
    if (is_selected) {
        set_icon(marker, false);
        show_dashboard();
        selected_marker = null;
    } else {
        set_icon(marker, true);
        show_detail(marker.data);
        selected_marker = marker;
    }
}

function map_clicked() {
    show_dashboard();
    if (selected_marker) {
        on_click_marker(selected_marker);
    }
}

function set_icon(target, selected) {
    if (selected) {
        var big_icon = create_big_icon(target.options.event_raw_active_icon);
        target.setIcon(big_icon)
    } else {
        var normal_icon = create_icon(target.options.event_raw_active_icon);
        target.setIcon(normal_icon)
    }
    target.options.event_selected = selected;
}

function reset_all_markers(marker) {
    // change the markers for default
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            if (marker != markers[i]) {
                set_icon(markers[i], false);
                markers[i].options.event_selected = false;
            }
        }
    }
    for (var i = 0; i < healthsites_markers.length; i++) {
        if (healthsites_markers[i] && healthsites_markers[i].data['count'] === 1) {
            if (marker != healthsites_markers[i]) {
                healthsites_markers[i].setIcon(create_icon(healthsite_marker_url));
                healthsites_markers[i].options.event_selected = false;
            }
        }
    }
}

function create_chart(mdata) {
    if (pie_chart) {
        pie_chart.destroy();
    }
    var container = $("#incident_type_chart").get(0).getContext("2d");
    var data = [
        {
            value: mdata['advisory'],
            color: "#C74444",
            highlight: "#FF5A5E",
            label: "Advisory"
        },
        {
            value: mdata['incident'],
            color: "#EDA44C",
            highlight: "#FFD39E",
            label: "Incident"
        }
    ];
    pie_chart = new Chart(container).Pie(data, {
        animateScale: true,
        animationSteps: 50,
        animationEasing: "linear"
    });
}

function show_dashboard() {
    $('#event_dashboard').show();
    $('#event_detail').hide();
}

function show_detail(data) {
    $('#event_dashboard').hide();
    $('#event_detail').show();
    // reset
    $('#event_detail_category').text("-");
    $('#event_detail_place_name').text("-");
    $('#event_detail_date_time').text("-");
    $('#event_detail_type').text("-");
    $('#event_detail_perpetrator').text("-");
    $('#event_detail_victim').text("-");
    $('#event_detail_killed').text("-");
    $('#event_detail_injured').text("-");
    $('#event_detail_detained').text("-");
    $('#event_detail_source').text("-");
    $('#event_detail_notes').text("-");
    $('#event_detail_reported_by').text("-");

    // fill values
    if (data.event_category) {
        if (data.event_category == INCIDENT_CODE) {
            $('#event_detail_category').text('Incident');
        } else if (data.event_category == ADVISORY_CODE) {
            $('#event_detail_category').text('Advisory');
        } else {
            $('#event_detail_category').text('N/A');
        }
    }
    if (data.event_place_name) {
        $('#event_detail_place_name').text(data.event_place_name);
    }
    if (data.event_date_time) {
        $('#event_detail_date_time').text(data.event_date_time);
    }
    if (data.event_type) {
        $('#event_detail_type').text(data.event_type);
    }
    if (data.event_perpetrator) {
        $('#event_detail_perpetrator').text(data.event_perpetrator);
    }
    if (data.event_victim) {
        $('#event_detail_victim').text(data.event_victim);
    }
    if (data.event_killed) {
        $('#event_detail_killed').text(data.event_killed);
    }
    if (data.event_injured) {
        $('#event_detail_injured').text(data.event_injured);
    }
    if (data.event_detained) {
        $('#event_detail_detained').text(data.event_detained);
    }
    if (data.event_source) {
        $('#event_detail_source').html(normalize_json_string(data.event_source));
    }
    if (data.event_notes) {
        $('#event_detail_notes').html(normalize_json_string(data.event_notes));
    }
    if (data.event_reported_by) {
        $('#event_detail_reported_by').text(data.event_reported_by);
    }
}

function is_selected_marker(latlng, place_name) {
    if (selected_marker) {
        if (selected_marker._latlng.lat == latlng.lat && selected_marker._latlng.lng == latlng.lng && selected_marker.data.event_place_name == place_name) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// --------------------------------------------------------------------
// ASSESSMENT
// --------------------------------------------------------------------
function add_event_marker(event_context) {
    // Variables
    var event_icon;
    var event_marker;
    var lat = event_context['geometry']['coordinates'][1];
    var lng = event_context['geometry']['coordinates'][0];
    var event_id = event_context['properties']['id'];
    var event_place_name = event_context['properties']['place_name'];
    var event_category = event_context['properties']['category'];
    var event_date_time = event_context['properties']['date_time'];
    var event_type = event_context['properties']['type'];
    var event_perpetrator = event_context['properties']['perpetrator'];
    var event_victim = event_context['properties']['victim'];
    var event_killed = event_context['properties']['killed'];
    var event_injured = event_context['properties']['injured'];
    var event_detained = event_context['properties']['detained'];
    var event_source = event_context['properties']['source'];
    var event_notes = event_context['properties']['notes'];
    var event_reported_by = event_context['properties']['reported_by'];
    var raw_incident_icon = event_context['properties']['incident_icon'];
    var raw_advisory_icon = event_context['properties']['advisory_icon'];
    var raw_active_icon; // The icon that will be used in the dashboard

    // Draw event marker
    if (event_category == 1) {
        raw_active_icon = raw_incident_icon;
    } else if (event_category == 2) {
        raw_active_icon = raw_advisory_icon;
    }

    var latlng = L.latLng(lat, lng);
    var is_selected = is_selected_marker(latlng, event_place_name);
    if (is_selected) {
        event_icon = create_big_icon(raw_active_icon);
    } else {
        event_icon = create_icon(raw_active_icon);
    }

    if (event_icon) {
        event_marker = L.marker(
            latlng,
            {
                id: event_id,
                icon: event_icon,
                event_selected: false,
                event_raw_active_icon: raw_active_icon
            }
        );
        event_marker.data = {
            event_category: event_category,
            event_place_name: event_place_name,
            event_date_time: event_date_time,
            event_type: event_type,
            event_perpetrator: event_perpetrator,
            event_victim: event_victim,
            event_killed: event_killed,
            event_injured: event_injured,
            event_detained: event_detained,
            event_source: event_source,
            event_notes: event_notes,
            event_reported_by: event_reported_by
        };
        if (is_selected) {
            event_marker.options.event_selected = true;
        }
        if (checkbox_event_is_checked()) {
            event_marker.addTo(map);
        }
    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id}).addTo(map);
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });
    // Add to markers
    markers[event_id] = event_marker;
}

function get_event_markers(items) {
    // get boundary
    var map_boundaries = map.getBounds();
    var west = map_boundaries.getWest();
    var east = map_boundaries.getEast();
    var north = wrap_number(map_boundaries.getNorth(), -90, 90);
    var south = wrap_number(map_boundaries.getSouth(), -90, 90);
    // To handle if the use zoom out, until the lng >180 or < -180
    if (west < -180) {
        west = -180;
    }
    if (east > 180) {
        east = 180;
    }
    var bbox = {
        'ne_lat': north,
        'ne_lng': east,
        'sw_lat': south,
        'sw_lng': west
    };

    // get time
    item = items.get(1);
    var start_time = moment(item.start);
    var end_time = moment(item.end);
    bbox = JSON.stringify(bbox);
    $.ajax({
        type: 'POST',
        url: '/show_event',
        data: {
            bbox: bbox,
            start_time: start_time.toJSON(),
            end_time: end_time.toJSON()
        },
        dataType: 'json',
        success: function (json) {
            clear_event_markers();
            var num_incident = 0;
            var num_advisory = 0;
            var events = json['events']['features'];
            for (var i = 0; i < events.length; i++) {
                add_event_marker(events[i]);
                if (events[i]['properties']['category'] == INCIDENT_CODE) {
                    num_incident++;
                } else if (events[i]['properties']['category'] == ADVISORY_CODE) {
                    num_advisory++;
                }
            }
            $('#num_events').text(events.length);
            var num_events_events = $('#num_events_events');
            if (events.length == 1) {
                num_events_events.text(' Alert');
            } else {
                num_events_events.text(' Alerts');
            }
            var side_panel = $('#side_panel');
            if (!selected_marker) {
                if (side_panel.is(":visible")) {
                    // Only create chart when the side panel is visible
                    create_chart(
                        {
                            advisory: num_advisory,
                            incident: num_incident
                        });
                }
            }
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}

function clear_event_markers() {
    hide_event_markers();
    markers = [];
}

function hide_event_markers() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            map.removeLayer(markers[i]);
        }
    }
}

function show_event_markers() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            map.removeLayer(markers[i]);
            map.addLayer(markers[i]);
        }
    }
}

function checkbox_event_is_checked() {
    if ($("#event-filter").is(':checked')) {
        return true;
    } else {
        return false;
    }
}

// --------------------------------------------------------------------
// HEALTHSITES
// --------------------------------------------------------------------
var healthsite_marker_url = '/static/images/healthsite-marker.png';
var healthsites_markers = [];
function get_healthsites_markers() {
    // get boundary
    var bbox = map.getBounds().toBBoxString();
    $.ajax({
        type: 'GET',
        url: '/healthsites/cluster',
        data: {
            'bbox': bbox,
            'zoom': map.getZoom(),
            'iconsize': '48, 46'
        },
        dataType: 'json',
        success: function (json) {
            clear_healthsites_markers();
            for (var i = json.length - 1; i >= 0; i--) {
                var data = json[i];
                // check if marker was clicked and remove it
                var latlng = L.latLng(data['geom'][1], data['geom'][0]);
                // check if a marker is a cluster marker
                var myIcon;
                if (data['count'] > 1) {
                    myIcon = L.divIcon({
                        className: 'marker-icon',
                        html: data['count'],
                        iconAnchor: [24, 59],
                        iconSize: [48, 59]
                    });
                } else {
                    if (is_selected_marker(latlng, data['name'])) {
                        myIcon = create_big_icon(healthsite_marker_url);
                    } else {
                        myIcon = create_icon(healthsite_marker_url);
                    }
                }
                render_healthsite_marker(latlng, myIcon, data);
            }
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}
function render_healthsite_marker(latlng, myIcon, data) {
    var mrk = new L.Marker(latlng, {
        icon: myIcon,
        event_selected: false,
        event_raw_active_icon: healthsite_marker_url
    });
    if (data['count'] == 1) {
        var html = "<center><b>" + data['name'] + "</b></center>";
        var popup = L.popup()
            .setContent(html);
        var options =
        {
            'closeButton': false,
            'closeOnClick': false,
            'keepInView': false
        };
        mrk.bindPopup(popup, options);
        mrk.on('mouseover', function (e) {
            mrk.openPopup();
        });
        // don't make hover if it is focused marker'
        mrk.on('mouseout', function (e) {
            mrk.closePopup();
        });
    }
    mrk.data = {
        'latlng': latlng,
        'uuid': data['uuid'],
        'bbox': data['minbbox'],
        'count': data['count'],
        'name': data['name'],
        'event_place_name': data['name']
    };
    if (is_selected_marker(latlng, data['name'])) {
        mrk.options.event_selected = true;
    }
    mrk.on('click', function (evt) {
        if (evt.target.data['count'] === 1) {
            on_click_marker(evt.target);
        }
        else {
            var bounds = L.latLngBounds(
                L.latLng(evt.target.data['bbox'][1], evt.target.data['bbox'][2]),
                L.latLng(evt.target.data['bbox'][3], evt.target.data['bbox'][0])
            );
            // zoom to cluster bounds
            map.fitBounds(bounds);
        }
    });
    // add marker to the map
    if (checkbox_healthsites_is_checked()) {
        mrk.addTo(map);
    }
    healthsites_markers.push(mrk);
    return mrk;
}

function clear_healthsites_markers() {
    hide_healthsites_markers();
    healthsites_markers = [];
}

function hide_healthsites_markers() {
    for (var i = 0; i < healthsites_markers.length; i++) {
        if (healthsites_markers[i]) {
            map.removeLayer(healthsites_markers[i]);
        }
    }
}

function show_healthsites_markers() {
    for (var i = 0; i < healthsites_markers.length; i++) {
        if (healthsites_markers[i]) {
            map.removeLayer(healthsites_markers[i]);
            map.addLayer(healthsites_markers[i]);
        }
    }
}

function checkbox_healthsites_is_checked() {
    if ($("#healthsites-filter").length == 0) {
        return true;
    } else {
        if ($("#healthsites-filter").is(':checked')) {
            return true;
        } else {
            return false;
        }
    }
}