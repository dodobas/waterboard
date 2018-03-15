// base water board module
var WB = (function (module) {
//
//      module.mapHandler = Object.assign({}, module, {mapHandler: {}});
// //
//     if (!L) {
//         throw new Error('Could not load leaflet');
//     }
//
// //     // TODO refactor later
//     module.mapHandler.addControlToLeaflet = function () {
//
//          L.Control = L.Control.extend({
//             options: {
//                 position: 'topright',
//                 callback: null,
//                 kind: '',
//                 html: ''
//             },
//             onAdd: function (map) {
//                 var $container = $('<div class="leaflet-control leaflet-bar"></div>');
//
//                 var $link = $('<a href="#" class="leaflet-control-command control-off leaflet-control-command-new" title="Create a ' + this.options.kind + ' Geofence"></a>');
//
//                 $link.html(this.options.html);
//
//                 $link.on('click', this.options, function (e) {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     add_marker_from_control(map.getCenter());
//
//                     return false;
//                 });
//
//                 $container.html($link);
//
//                 return $container[0];
//             }
//         });
//     };
// //
// // // L.Control, CircleControl
//     module.mapHandler.addNewControlToExtended = function (parentControl, name, options) {
//         parentControl[name] = parentControl.extend({
//             options: options
//         });
//
//         return parentControl;
//     };
    return module;
} (WB || {}));

WB.globals = WB.globals || {};

// TODO move away from GLOBAL scope
// Variables

function show_map(context) {

    if (!context) {
        context = {};
    }


    $('#navigationbar').css('height', window.innerHeight * 0.1);
    $('#map').css('height', window.innerHeight * 0.9);

    const defaultMapConf = {
        editable: true,
        zoomControl: false
    };


    if ('bounds' in context) {
        if (WB.globals.map) {
            WB.globals.map.fitBounds(context['bounds']);
        } else {
            WB.globals.map = L.map('map', defaultMapConf).fitBounds(context['bounds']);
        }
    } else if (('lat' in context) && ('lng' in context)) {
        if (WB.globals.map) {
            WB.globals.map.setView([context['lat'], context['lng']], 11);
        } else {
            WB.globals.map = L.map('map', defaultMapConf).setView([context['lat'], context['lng']], 11);

        }
    }
    else {
        if (WB.globals.map) {
            WB.globals.map.setView([14.3, 38.3], 6);
        } else {
            WB.globals.map = L.map('map', defaultMapConf).setView([14.3, 38.3], 6);
        }
    }

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(WB.globals.map);

    init_map(WB.globals.map);
}


function init_map(map, options) {

    WB.mapHandler.addControlToLeaflet();

     new L.Control.Zoom({position: 'topright'}).addTo(map);

    WB.mapHandler.addNewControlToExtended(L.Control, 'MarkerControl', {
            position: 'topright',
            callback: null,
            kind: 'marker',
            html: ''
        });
    map.addControl(new L.Control.MarkerControl());

    if (options && options.showControls === true) {
        WB.mapHandler.addNewControlToExtended(L.Control, 'CircleControl', {
            position: 'topright',
            callback: map.editTools.startCircle,
            kind: 'circle',
            html: '⬤'
        });

        WB.mapHandler.addNewControlToExtended(L.Control, 'PolygonControl', {
            position: 'topright',
            callback: map.editTools.startPolygon,
            kind: 'polygon',
            html: '▰'
        });

        WB.mapHandler.addNewControlToExtended(L.Control, 'PolylineControl', {
            position: 'topright',
            callback: map.editTools.startPolyline,
            kind: 'line',
            html: '\\/\\'
        });


        map.addControl(new L.Control.CircleControl());
        map.addControl(new L.Control.PolygonControl());
        map.addControl(new L.Control.PolylineControl());

    }
}

function set_offset() {
    // 'use strict';
    // var  navbar_height, map, content, content_offset, map_h;
    //
    // navbar_height = $('.navbar').height();
    //
    // map = $('#map');
    // content = $('#content');
    //
    // map_h = $(window).height() - navbar_height;
    //
    // if (map.length) {
    //     map.offset({top: navbar_height});
    //     map.css('height', map_h);
    // }
    // if (content.length) {
    //     content_offset = content.offset();
    //     content.offset({top: navbar_height, left: content_offset.left});
    //     $('.side-panel').css('height', map_h);
    // }
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
        WB.globals.map.invalidateSize();
    } else { /* show */
        $("#hide_toogle").show();
        $("#show_toogle").hide();
        side_panel.addClass('col-lg-5');
        side_panel.show();
        map_div.removeClass('col-lg-12');
        map_div.addClass('col-lg-7');
        WB.globals.map.invalidateSize();
    }
    $(".ripple").removeClass("ripple-on");
}
