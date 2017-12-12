// base water board module
var WB = (function (module, leaflet) {

    module.mapHandler = Object.assign({}, module, {mapHandler: {}});

    if (leaflet === false) {
        throw new Error('Could not load leaflet');
    }

    // TODO refactor later
    module.mapHandler.addEditControlToLeaflet = function () {

         leaflet.EditControl = L.Control.extend({
            options: {
                position: 'topright',
                callback: null,
                kind: '',
                html: ''
            },
            onAdd: function (map) {
                var self = this;
                var $container = $('<div class="leaflet-control leaflet-bar"></div>');

                var $link = $('<a href="#" title="Create a ' + this.options.kind + ' Geofence"></a>');

                $link.html(this.options.html);

                console.log(this, this.options);

                $link.on('click', this.options, function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var layer = e.data.callback.call(map.editTools);

                    if (self.options.kind === 'circle') {
                        add_marker_from_control(map.getCenter());
                    }

                    console.log('asd', this);
                    return false;
                });

                $container.html($link);

                return $container[0];
            }
        });
        return leaflet;
    };

// L.EditControl, CircleControl
    module.mapHandler.addNewControlToExtended = function (parentControl, name, options) {
        parentControl[name] = parentControl.extend({
            options: options
        });

        return parentControl;
    };
    console.log('is ok');

    return module;
} (WB || {}, L || false));

WB.globals = WB.globals || {};

// TODO move away from GLOBAL scope
// Variables
var map;

function show_map(context) {
    'use strict';
    $('#navigationbar').css('height', window.innerHeight * 0.1);
    $('#map').css('height', window.innerHeight * 0.9);
    if ('bounds' in context) {
        if (map) {
            map.fitBounds(context['bounds']);
        } else {
            map = L.map('map', {
                editable: true,
                zoomControl: false
            }).fitBounds(context['bounds']);
            init_map(map);
        }
    } else if (('lat' in context) && ('lng' in context)) {
        if (map) {
            map.setView([context['lat'], context['lng']], 11);
        } else {
            map = L.map('map', {
                editable: true,
                zoomControl: false
            }).setView([context['lat'], context['lng']], 11);
            init_map(map);
        }
    }
    else {
        if (map) {
            map.setView([33.3, 44.3], 6);
        } else {
            map = L.map('map', {
                editable: true,
                zoomControl: false
            }).setView([33.3, 44.3], 6);
            init_map(map);
        }
    }

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
}




function init_map(map) {
    new L.Control.Zoom({position: 'topright'}).addTo(map);

    const leaflet = WB.mapHandler.addEditControlToLeaflet();

    WB.mapHandler.addNewControlToExtended(leaflet.EditControl, 'CircleControl', {
            position: 'topright',
            callback: map.editTools.startCircle,
            kind: 'circle',
            html: '<p>O</p>'
        });

    WB.mapHandler.addNewControlToExtended(leaflet.EditControl, 'PolygonControl', {
        position: 'topright',
        callback: map.editTools.startPolygon,
        kind: 'polygon',
        html: '<p>▰</p>'
    });

    WB.mapHandler.addNewControlToExtended(leaflet.EditControl, 'PolylineControl', {
        position: 'topright',
        callback: map.editTools.startPolyline,
        kind: 'line',
        html: '<p>L</p>'
    });

    map.addControl(new leaflet.EditControl.CircleControl());
    map.addControl(new leaflet.EditControl.PolygonControl());
    map.addControl(new leaflet.EditControl.PolylineControl());


}

function set_offset() {
    'use strict';
    var navbar, navbar_height, map, content, content_offset, win_h, map_h;

    navbar = $('.navbar');
    navbar_height = navbar.height();
    map = $('#map');
    content = $('#content');
    win_h = $(window).height();
    map_h = win_h - navbar_height;

    if (map.length) {
        map.offset({top: navbar_height});
        map.css('height', map_h);
    }
    if (content.length) {
        content_offset = content.offset();
        content.offset({top: navbar_height, left: content_offset.left});
        $('.side-panel').css('height', map_h);
    }
}

function toggle_side_panel() {
    'use strict';
    var map_div = $('#map');
    var side_panel = $('#side_panel');
    /* hide */
    if (side_panel.is(":visible")) {
        $("#hide_toogle").hide();
        $("#show_toogle").show();
        side_panel.removeClass('col-lg-5');
        side_panel.hide();
        map_div.removeClass('col-lg-7');
        map_div.addClass('col-lg-12');
        map.invalidateSize();
    } else { /* show */
        $("#hide_toogle").show();
        $("#show_toogle").hide();
        side_panel.addClass('col-lg-5');
        side_panel.show();
        map_div.removeClass('col-lg-12');
        map_div.addClass('col-lg-7');
        map.invalidateSize();
    }
    $(".ripple").removeClass("ripple-on");
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
