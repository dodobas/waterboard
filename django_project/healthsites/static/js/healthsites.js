/**
 * Created by meomancer on 25/04/16.
 */

var showing_detail = false;
var healthsite_marker_url = '/static/images/healthsite-marker.png';

function show_healthsites_marker() {
    // get boundary
    var bbox = map.getBounds().toBBoxString();
    exit_healthsite_detail();
    $.ajax({
        type: 'GET',
        url: '/healthsites/cluster',
        data: {
            'bbox': bbox,
            'zoom': map.getZoom(),
            'iconsize': '48, 46',
        },
        dataType: 'json',
        success: function (json) {
            clear_markers();
            if (typeof json != 'undefined') {
                for (var i = json.length - 1; i >= 0; i--) {
                    var data = json[i];

                    // check if marker was clicked and remove it
                    var latlng = L.latLng(data['geom'][1], data['geom'][0]);
                    // check if a marker is a cluster marker
                    if (data['count'] > 1) {
                        var myIcon = L.divIcon({
                            className: 'marker-icon',
                            html: data['count'],
                            iconAnchor: [24, 59],
                            iconSize: [48, 59]
                        });
                    } else {
                        var myIcon = create_icon(healthsite_marker_url);
                    }
                    render_marker(latlng, myIcon, data);
                }
            }
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}
function render_marker(latlng, myIcon, data) {
    var mrk = new L.Marker(latlng, {icon: myIcon});
    if (data['count'] == 1) {
        if (typeof data['name'] != "undefined" && data['name'] != "") {
            //    window.location.href = "/map#!/locality/" + evt.target.data['uuid'];"
            var html = "";
            html = "<center><b>" + data['name'] + "</b></center>";
            var popup = L.popup()
                .setContent(html);
            var options =
            {
                'closeButton': false,
                'closeOnClick': false,
                'keepInView': false
            }
            mrk.bindPopup(popup, options);
            mrk.on('mouseover', function (e) {
                mrk.openPopup();
            });
            // don't make hover if it is focused marker'
            mrk.on('mouseout', function (e) {
                mrk.closePopup();
            });
        }
    }
    mrk.data = {
        'latlng': latlng,
        'uuid': data['uuid'],
        'bbox': data['minbbox'],
        'count': data['count'],
        'name': data['name'],
    }
    mrk.on('click', function (evt) {
        if (evt.target.data['count'] === 1) {
            show_healthsites_detail(evt, evt.target.data['uuid']);
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
    // add marker to the layer
    mrk.addTo(map);
    markers.push(mrk);
    return mrk;
}


function show_healthsites_detail(evt, uuid) {
    // change the marker
    for (var i = 0; i < markers.length; i++) {
        if (markers[i] && markers[i].data['count'] === 1) {
            var icon = create_icon(healthsite_marker_url);
            markers[i].setIcon(icon)
        }
    }
    var big_icon = create_big_icon(healthsite_marker_url);
    evt.target.setIcon(big_icon)

    // show details
    showing_detail = true;
    render_healthsite_detail(evt.target.data);
}

function render_healthsite_detail(data) {
    if (showing_detail) {
        $("input[name='name']").val(data['name']);
    }
}

function exit_healthsite_detail() {
    showing_detail = false;
    $("input[name='name']").val("");
}
