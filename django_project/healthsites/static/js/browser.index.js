// base water board module
var WB = (function (module) {

    module.mapHandler = Object.assign({}, module, {mapHandler: {}});
//
    if (!L) {
        throw new Error('Could not load leaflet');
    }

//     // TODO refactor later
//
// // L.Control, CircleControl
    module.mapHandler.addNewControlToExtended = function (parentControl, name, options) {
        parentControl[name] = parentControl.extend({
            options: options
        });

        return parentControl;
    };
    return module;
}(WB || {}));

function addControlToLeaflet() {

    L.Control = L.Control.extend({
        options: {
            position: 'topright',
            callback: null,
            kind: '',
            html: ''
        },
        onAdd: function (map) {
            var $container = $('<div class="leaflet-control leaflet-bar"></div>');

            var $link = $('<a href="#" class="leaflet-control-command control-off leaflet-control-command-new" title="Create a ' + this.options.kind + ' Geofence"></a>');

            $link.html(this.options.html);

            $link.on('click', this.options, function (e) {
                e.preventDefault();
                e.stopPropagation();
                add_marker_from_control(map.getCenter());

                return false;
            });

            $container.html($link);

            return $container[0];
        }
    });
};


function toggleLayers(leafletMap, name, showGroup) {

    let layers = {
        'Assessments': 'assessmentsGroupShown',
        'Enriched Healthsites': 'healthsitesGroupShown'
    };

    if (layers[name]) {
        WB.storage.setItem(layers[name], showGroup);
    }

    get_event_markers(leafletMap);
}

var globalVars = {
    markers: [],
    ndx: '',
    selectedMarker: null,
    allData: [],
    uncheckedStatistic: [],
    timeRange: [new Date(2015, 0, 1), new Date(2016, 11, 31)],

    assessmentChart: null,
    countryChart: null,
    datacaptorChart: null,
    timelineChart: null,

    assessmentTimelineChart: null,
    assessmentsGroup: null,
    assessmentsGroupShown: true,
    healthsitesGroup: null,
    healthsitesGroupShown: true,
    enrichedGroup: null,
    monthNames: [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ],
    hcidMarkerUrl: '/static/healthsites/css/images/gray-marker-icon-2x.png',
    defaultMapConf: {
        editable: true,
        zoomControl: false
    },
    overallAssessmentIcons: {
        '1': "/static/healthsites/css/images/red-marker-icon-2x.png",
        '2': "/static/healthsites/css/images/orange-marker-icon-2x.png",
        '3': "/static/healthsites/css/images/yellow-marker-icon-2x.png",
        '4': "/static/healthsites/css/images/lightgreen-marker-icon-2x.png",
        '5': "/static/healthsites/css/images/green-marker-icon-2x.png"
    },
    mapLayers: {
        "healthsitesGroup": null,
        "assessmentsGroup": null,
        "enrichedGroup": null
    }
};


function SimpleStorage(storage) {
    this.storage = storage || {};
}

SimpleStorage.prototype = {
    setItem: function (key, val) {
        this.storage[key] = val;
        return this.storage[key];
    },
    getItem: function (key) {
        return WB.utils.getNestedProperty(this.storage, key);
    },
    removeItem: function (key) {
        delete this.storage[key];
    },
    setStorage: function (storage) {
        this.storage = storage || {};
    },
    addArrayItem: function (key, item) {
        var arr = (this.storage[key] || []).slice(0);
        arr[arr.length] = item;

        this.storage[key] = arr;
    }
};


WB.globals = WB.globals || {};
WB.storage = new SimpleStorage(globalVars);


// TODO move away from GLOBAL scope
// Variables


function set_offset() {
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



function setMapViewport (leafletMap, context, defaultMapConf) {
    if (leafletMap) {
        if ('bounds' in context) {
            leafletMap.fitBounds(context['bounds']);
        } else if (('lat' in context) && ('lng' in context)) {
            leafletMap.setView([context['lat'], context['lng']], 11);
        } else {
            leafletMap.setView([14.3, 38.3], 6);
        }

        return leafletMap;
    }

    if ('bounds' in context) {
        return L.map('map', defaultMapConf).fitBounds(context['bounds']);
    } else if (('lat' in context) && ('lng' in context)) {
        return L.map('map', defaultMapConf).setView([context['lat'], context['lng']], 11);
    }
    return L.map('map', defaultMapConf).setView([14.3, 38.3], 6);
}

function show_map(context) {

    console.log('safdafasdf');
    if (!context) {
        context = {};
    }


    $('#navigationbar').css('height', window.innerHeight * 0.1);
    $('#map').css('height', window.innerHeight * 0.9);

    const defaultMapConf = WB.storage.getItem('defaultMapConf');

    var map = WB.storage.getItem('map');

    var leafletMap = setMapViewport(map, context, defaultMapConf);

    leafletMap = WB.storage.setItem('map', leafletMap);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletMap);

    return init_map(leafletMap);
}


function init_map(map, options) {

    addControlToLeaflet();

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

    return map;
}


function toggle_side_panel() {
    'use strict';
    var map_div = $('#map');
    var side_panel = $('#side_panel');

    var map = WB.storage.getItem('map');

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
}


/**
 * Created by ismailsunni on 5/9/15.
 */
Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// --------------------------------------------------------------------
// UI FUNCTION
// --------------------------------------------------------------------
function init_collapsing_table() {
    var maintitle = $('.detail-title-row').parent();
    maintitle.nextAll().hide();

    var rowtitle = $('.detail-subtitle-row').parent();
    rowtitle.show();
    rowtitle.addClass('rowtitle closed');
    rowtitle.children('.detail-subtitle-row').append('<i class="fa fa-angle-down" aria-hidden="true"></i>');
    rowtitle.click(function () {
        $(this).nextUntil(rowtitle).slideToggle(0);
        $(this).toggleClass('open closed');
        if ($(this).hasClass('closed')) {
            $(this).children('.detail-subtitle-row').append('<i class="fa fa-angle-down" aria-hidden="true"></i>');
            $(this).children().find('.fa-angle-up').remove();
        }
        else {
            $(this).children('.detail-subtitle-row').append('<i class="fa fa-angle-up" aria-hidden="true"></i>');
            $(this).children().find('.fa-angle-down').remove();
        }
    });
}

function show_dashboard() {
    $("#overall-assessments-timeline").hide();
    $('#event_dashboard').show();
    $('#event_detail').hide();

    var selected_marker = WB.storage.getItem('selectedMarker');

    if (selected_marker) {
        set_icon(selected_marker, false);
        WB.storage.setItem('selectedMarker', null)
    }
    resize_graph();
}

function show_detail(marker) {
    var data = marker.data;

    $('#event_dashboard').hide();
    $('#event_detail').show();

    // force show it
    if (!$('#side_panel').is(":visible")) toggle_side_panel();

    var $detail_table = $('#detail-table');
    $detail_table.text("");

    // main info rendering
    if (data.name) $detail_table.append('<tr><td style="width: 200px">Name</td><td><b>' + data.name + '</b></td></tr>');
    if (data.country) $detail_table.append('<tr><td>Country</td><td><b>' + data.country + '</b></td></tr>');
    if (data.data_captor) $detail_table.append('<tr><td>Data Captor</td><td><b>' + data.data_captor + '</b></td></tr>');
    if (data.created_date) $detail_table.append('<tr><td>Created</td><td><b>' + new Date(data.created_date) + '</b></td></tr>');
    if (data.overall_assessment) $detail_table.append('<tr><td>Overall Assessment</td><td><b>' + data.overall_assessment + '</b></td></tr>');

    // assessment info rendering
    if (data.assessment) {
        var group, assessment_html = "";
        Object.keys(data.assessment).sort().forEach(function (key) {
            var keys = key.split("/");
            if (group != keys[0]) {
                group = keys[0];
                assessment_html += '<tr><td class="detail-subtitle-row" colspan="2"><b>' + group + '</b></td></tr>';
            }
            var value = data.assessment[key]["option"] ? data.assessment[key]["option"] : data.assessment[key]["value"];
            var description = data.assessment[key]["description"];
            if (value == "") {
                value = "-";
            }
            assessment_html += '<tr><td>' + keys[1] + '</td><td title="' + description + '"><b>' + value + '</b></td></tr>';
        });
        if (assessment_html != "") {
            $detail_table.append('<tr><td class="detail-title-row" colspan="2"><b>Assessment</b></td></tr>');
            $detail_table.append(assessment_html);
        }
        $("#overall-assessments-timeline").show();
        overall_assessments(data['assessment_id']);
    } else {
        $("#overall-assessments-timeline").hide();
    }

    init_collapsing_table();
}

function map_clicked() {
    show_dashboard();
    var selected_marker = WB.storage.getItem('selectedMarker');

    if (selected_marker) {
        on_click_marker(selected_marker);
    }
}

function on_click_marker(marker) {
    var $download_excell_button = $('#download-assessment-excell');
    var $download_csv_button = $('#download-assessment-csv');
    $download_excell_button.hide();
    $download_csv_button.hide();

    const leafletMap = WB.storage.getItem('map');
    reset_all_markers(marker);
    var is_selected = marker.options.event_selected;
    if (is_selected) {
        set_icon(marker, false);
        show_dashboard();
        render_statistic();

        WB.storage.setItem('selectedMarker', null);
    } else {
        set_icon(marker, true);
        WB.storage.setItem('selectedMarker', marker);

        show_detail(marker);

        leafletMap.panTo(new L.LatLng(marker._latlng.lat, marker._latlng.lng));
        if (marker.options.id) {
            $download_excell_button.show();
            $download_excell_button.attr("href", "/download_assessment_report/" + marker.options.id);
            $download_csv_button.show();
            $download_csv_button.attr("href", "/download_assessment_csv/" + marker.options.id);
        }
    }
}

// --------------------------------------------------------------------
// DASHBOARD FUNCTION
// --------------------------------------------------------------------
function create_icon(raw_event_icon) {
    return L.icon({
        iconUrl: raw_event_icon,
        iconAnchor: [21, 42],
        iconSize: [42, 42],
        popupAnchor: [0, -42]
    });
}

function create_big_icon(raw_event_icon) {
    return L.icon({
        iconUrl: raw_event_icon,
        iconAnchor: [28, 56],
        iconSize: [56, 56],
        popupAnchor: [0, -56]
    });
}

function is_selected_marker(id, type) {
    var selectedMarker = WB.storage.getItem('selectedMarker');

    if (selectedMarker && selectedMarker.options.id == id && selectedMarker.options.type == type) {
        return true;
    }

    return false;

}

function reset_all_markers(marker) {
    var hcidMarkerUrl = WB.storage.getItem('hcidMarkerUrl');
    var markers = WB.storage.getItem('markers');
    var healthsitesGroup = WB.storage.getItem('mapLayers.healthsitesGroup');

    // change the markers for default
    for (var i = 0; i < markers.length; i++) {
        if (markers[i] && marker != markers[i]) {
            set_icon(markers[i], false);
            markers[i].options.event_selected = false;
        }
    }
    var healthsites_markers = healthsitesGroup.getLayers();

    for (var i = 0; i < healthsites_markers.length; i++) {
        if (healthsites_markers[i] && healthsites_markers[i].data['count'] === 1) {
            if (marker != healthsites_markers[i]) {

                healthsites_markers[i].setIcon(create_icon(hcidMarkerUrl));
                healthsites_markers[i].options.event_selected = false;
            }
        }
    }
}

function set_icon(target, selected) {
    var icon = selected ? create_big_icon(target.options.raw_icon) : create_icon(target.options.raw_icon);

    target.setIcon(icon);

    target.options.event_selected = selected;
}


function updatePeriodReport() {
    var time_range = WB.storage.getItem('timeRange');

    var start = time_range[0];
    var end = time_range[1];

    var timeline_chart = WB.storage.getItem('timelineChart');

    var filters = timeline_chart.filters();
    if (filters.length > 0) {
        if (filters[0].length == 2) {
            start = filters[0][0];
            end = filters[0][1];
        }
    }
    start = new Date(start);
    end = new Date(end);
    var startDay = start.getDate();
    var startMonthIndex = start.getMonth();
    var startYear = start.getFullYear();
    var endDay = end.getDate();
    var endMonthIndex = end.getMonth();
    var endYear = end.getFullYear();

    var startStr = startDay + ' ' + monthNames[startMonthIndex] + ' ' + startYear;
    var endStr = endDay + ' ' + monthNames[endMonthIndex] + ' ' + endYear;

    document.getElementById('time').innerHTML = "<i>Period selected: <b>" + startStr + "</b> - <b>" + endStr + "</b></i>";
}


function filtering() {
    var assessmentsGroup = WB.storage.getItem('mapLayers.assessmentsGroup');
    var enrichedGroup = WB.storage.getItem('mapLayers.enrichedGroup');

    assessmentsGroup.clearLayers();
    enrichedGroup.clearLayers();

    var markers = WB.storage.get('markers');

    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            if (is_event_in_show(markers[i])) {
                var enriched = markers[i]['data']['enriched'];
                if (enriched) {
                    enrichedGroup.addLayer(markers[i]);
                } else {
                    assessmentsGroup.addLayer(markers[i]);
                }
            }
        }
    }
    $('#num_events').text(assessmentsGroup.getLayers().length + enrichedGroup.getLayers().length);
}

function resize_graph() {
    var assessment_chart = WB.storage.getItem('assessmentChart');
    var country_chart = WB.storage.getItem('countryChart');
    var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    var timeline_chart = WB.storage.getItem('timelineChart');
    var assessment_timeline_chart = WB.storage.getItem('assessmentTimelineChart');

    set_size_graph(assessment_chart, $("#overall_assessment_chart"));
    set_size_graph(country_chart, $("#country_chart"));
    set_size_graph(datacaptor_chart, $("#data_captor_chart"));
    set_size_graph(timeline_chart, $("#visualization"));
    set_size_graph(assessment_timeline_chart, $("#overall-assessments-timeline-chart"));
}

function render_statistic() {

    var assessment_chart = WB.storage.getItem('assessmentChart');
    var country_chart = WB.storage.getItem('countryChart');
    var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    var timeline_chart = WB.storage.getItem('timelineChart');
    var all_data = WB.storage.getItem('allData');

    var ndx = WB.storage.getItem('ndx');
    try {
        if (!ndx) {
            ndx = crossfilter(all_data);
        } else {
            try {
                var assessment_chart_filters = assessment_chart.filters();
                var country_chart_filters = country_chart.filters();
                var datacaptor_chart_filters = datacaptor_chart.filters();
                var timeline_chart_filters = timeline_chart.filters();

                assessment_chart.filter(null);
                country_chart.filter(null);
                datacaptor_chart.filter(null);
                timeline_chart.filter(null);
                ndx.remove();
                assessment_chart_filters.forEach(function (item) {
                    assessment_chart.filter(item);
                });
                country_chart_filters.forEach(function (item) {
                    country_chart.filter(item);
                });
                datacaptor_chart_filters.forEach(function (item) {
                    datacaptor_chart.filter(item);
                });
                timeline_chart_filters.forEach(function (item) {
                    timeline_chart.filter(item);
                });
                ndx.add(all_data);
            }
            catch (err) {
                ndx = crossfilter(all_data);
            }
        }
        // -------------------------------------------------------
        // OVERALL ASSESSMENT
        // -------------------------------------------------------
        if (!assessment_chart) {
            assessment_chart = WB.storage.setItem('assessmentChart', dc.rowChart("#overall_assessment_chart"));
            // render chart
            var colorScale = d3.scale.ordinal().range(['#FF807F', '#FFCB7F', '#FFFF7F', '#D1FC7F', '#A1E37F']);
            var categoriesDim = ndx.dimension(function (d) {
                return d.overall_assessment;
            });
            var categoriesValue = categoriesDim.group().reduceSum(function (d) {
                return d.number;
            });
            assessment_chart
                .width(300).height(150).elasticX(true)
                .dimension(categoriesDim).group(categoriesValue).on("postRedraw", function () {
                    graph_filters($("#overall_assessment_chart"));
                }
            );
            assessment_chart.colors(colorScale);
            assessment_chart.xAxis().scale(assessment_chart.x()).ticks(4).tickSubdivide(0);
            assessment_chart.margins({top: 25, right: 20, bottom: 30, left: 20});

            set_size_graph(assessment_chart, $("#overall_assessment_chart"));
            assessment_chart.render();
        }

        // -------------------------------------------------------
        // TYPE
        // -------------------------------------------------------
        // render chart
        if (!country_chart) {
            var categoriesDim = ndx.dimension(function (d) {
                return d.country;
            });
            var categoriesValue = categoriesDim.group().reduceSum(function (d) {
                return d.number;
            });
            country_chart = WB.storage.setItem('countryChart', dc.pieChart("#country_chart"));
            country_chart
                .width(150).height(150)
                .dimension(categoriesDim).group(categoriesValue).on("postRedraw", function () {
                    graph_filters($("#country_chart"));
                }
            );

            set_size_graph(country_chart, $("#country_chart"));
            country_chart.render();
        }

        // -------------------------------------------------------
        // DATA CAPTOR
        // -------------------------------------------------------
        // render chart
        if (!datacaptor_chart) {
            var categoriesDim = ndx.dimension(function (d) {
                return d.data_captor;
            });
            var categoriesValue = categoriesDim.group().reduceSum(function (d) {
                return d.number;
            });
            datacaptor_chart = WB.storage.setItem('datacaptorChart', dc.pieChart("#data_captor_chart"));
            datacaptor_chart
                .width(150).height(150)
                .dimension(categoriesDim).group(categoriesValue).on("postRedraw", function () {
                    graph_filters($("#data_captor_chart"));
                }
            );
            set_size_graph(datacaptor_chart, $("#data_captor_chart"));
            datacaptor_chart.render();
        }

        // -------------------------------------------------------
        // TIMELINE
        // -------------------------------------------------------
        // render chart
        if (!timeline_chart) {
            var categoriesDim = ndx.dimension(function (d) {
                return d.month;
            });
            var categoriesValue = categoriesDim.group().reduceSum(function (d) {
                return d.number;
            });
            var timeline_chart = WB.storage.setItem('timelineChart', dc.barChart("#visualization"));

            timeline_chart
                .width($("#side_panel").width()).height(119)
                .dimension(categoriesDim).group(categoriesValue).on("filtered", function () {
                updatePeriodReport();
            }).on("postRedraw", function () {
                filtering();
            });
            var time_range = WB.storage.getItem('timeRsange');

            timeline_chart.x(d3.time.scale().domain(time_range)).round(d3.time.month.round)
                .xUnits(d3.time.months);
            timeline_chart.margins({top: 10, right: 0, bottom: 30, left: -1})
            timeline_chart.yAxis().ticks(0);



            timeline_chart.render();
            WB.storage.setItem('timelineChart', timeline_chart);
            set_size_graph(timeline_chart, $("#visualization"));
        }

        // -------------------------------------------------------
        // RENDER ALL CHART
        // -------------------------------------------------------
        dc.redrawAll();
    }
    catch (err) {
    }
}

function reset_graph(graph) {
    graph.filter(null);

    var assessment_chart = WB.storage.getItem('assessmentChart');
    var country_chart = WB.storage.getItem('countryChart');
    var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    var timeline_chart = WB.storage.getItem('timelineChart');


    assessment_chart.redraw();
    country_chart.redraw();
    datacaptor_chart.redraw();
    timeline_chart.redraw();

    if (graph == assessment_chart) {
        graph_filters($("#overall_assessment_chart"));
    } else if (graph == country_chart) {
        graph_filters($("#country_chart"));
    } else if (graph == datacaptor_chart) {
        graph_filters($("#data_captor_chart"));
    }
}

function reset_all_graph() {

        var assessment_chart = WB.storage.getItem('assessmentChart');
    var country_chart = WB.storage.getItem('countryChart');
    var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    var timeline_chart = WB.storage.getItem('timelineChart');
  //  var assessment_timeline_chart = WB.storage.getItem('assessmentTimelineChart');

    assessment_chart.filter(null);
    country_chart.filter(null);
    datacaptor_chart.filter(null);
    timeline_chart.filter(null);

    assessment_chart.redraw();
    country_chart.redraw();
    datacaptor_chart.redraw();
    timeline_chart.redraw();

    graph_filters($("#overall_assessment_chart"));
    graph_filters($("#country_chart"));
    graph_filters($("#data_captor_chart"));
}

function set_size_graph(graph, parent) {
    var parent_width = parent.width();
    var parent_height = parent.height() - 1;
    graph.height(parent_height);
    graph.width(parent_width);
}

function graph_filters(graph) {

    var id = $(graph).attr('id');
    var identifier = "";

    var unchecked_statistic = WB.storage.getItem('uncheckedStatistic');

    if (id == "overall_assessment_chart") {
        identifier = "assess_";
    } else if (id == "country_chart") {
        identifier = "country_";
    } else if (id == "data_captor_chart") {
        identifier = "datacaptor_";
    }
    // check the checked filtered
    var rects = graph.find('g.row');

    for (var i = 0; i < rects.length; i++) {
        var label = rects[i].textContent.split(":")[0];
        label = label.substr(label.length / 2);
        var rect = $(rects[i]).find('rect');
        if (rect) {
            var rect_class = $(rect).attr('class');
            unchecked_statistic.remove(identifier + label);

            if (rect_class) {
                var deselect = rect_class.indexOf("deselected") > -1;


                if (deselect) {

                    WB.storage.addArrayItem('uncheckedStatistic', identifier + label);
                    // unchecked_statistic.push(identifier + label);
                }
            }
        }
    }
    var pies = graph.find('g.pie-slice');

    for (var i = 0; i < pies.length; i++) {
        var label = pies[i].textContent.split(":")[0];
        var deselect = $(pies[i]).attr('class').indexOf("deselected") > -1;

        unchecked_statistic.remove(identifier + label);
        if (deselect) {
            WB.storage.addArrayItem('uncheckedStatistic', identifier + label);
        }
    }
    filtering();
}

function overall_assessments(assessment_id) {
    $.ajax({
        url: "/healthsites/overall-assessments",
        data: {assessment_id: assessment_id},
        success: function (data) {
            renderOverallAssessments(data);
        },
        error: function (request, error) {

        }
    })
}

function renderOverallAssessments(list) {
    if (list && list.length > 0) {
        // using dc
        var ndx = crossfilter(list);

        WB.storage.setItem('ndx', ndx);

        list.forEach(function (d) {
            d.created_date = new Date(d.created_date);
        });

        var dateDim = ndx.dimension(function (d) {
            return d.created_date;
        });
        var hits = dateDim.group().reduceSum(function (d) {
            return d.overall_assessment;
        });

        // find max and min date
        var minDate = (new Date(dateDim.bottom(1)[0].created_date)).getTime();
        var maxDate = (new Date(dateDim.bottom(1)[0].created_date)).getTime();
        var default_range = 24 * 60 * 60 * 1000;
        if (maxDate - minDate < default_range) {
            var new_range = default_range - (maxDate - minDate) / 2;
            maxDate = maxDate + new_range;
            minDate = minDate - new_range;
        } else {
            maxDate += 60 * 60 * 1000;
            minDate -= 60 * 60 * 1000;
        }
    // var assessment_chart = WB.storage.getItem('assessmentChart');
    // var country_chart = WB.storage.getItem('countryChart');
    // var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    // var timeline_chart = WB.storage.getItem('timelineChart');
    // var assessment_timeline_chart = WB.storage.getItem('assessmentTimelineChart');
        // render graph
        var assessment_timeline_chart = WB.storage.setItem('assessmentTimelineChart', dc.lineChart("#overall-assessments-timeline-chart"));

        assessment_timeline_chart
            .elasticX(true)
            .width($("#side_panel").width()).height(200)
            .dimension(dateDim).group(hits)
            .y(d3.scale.linear().domain([1, 5]))
            .x(d3.time.scale().domain([new Date(minDate), new Date(maxDate)]))
            .colors(['#FF807F', '#FFCB7F', '#FFFF7F', '#D1FC7F', '#A1E37F']).colorDomain([0, 4])
            .xAxisLabel('date').yAxisLabel('overall assessment').brushOn(false);
        assessment_timeline_chart.yAxis().ticks(5);
        assessment_timeline_chart.render();

        set_size_graph(assessment_timeline_chart, $("#overall-assessments-timeline-chart"));
    } else {
        $("#overall-assessments-timeline").show();
    }
}

function createMarker(event_context) {
    // Variables
    var event_icon;
    var event_marker;
    var event_id = event_context['id'];

    var assessment_name = event_context['name'];
    var country = event_context['country'];
    var created_date = event_context['created_date'];
    var data_captor = event_context['data_captor'];
    var lat = event_context['geometry'][1];
    var lng = event_context['geometry'][0];
    var overall_assessment = event_context['overall_assessment'];
    var enriched = event_context['enriched'];

    var raw_icon = WB.storage.getItem('overallAssessmentIcons')[overall_assessment] || {};

    var latlng = L.latLng(lat, lng);

    var is_selected = is_selected_marker(event_id, 'assessment');

    if (is_selected) {
        event_icon = create_big_icon(raw_icon);
    } else {
        event_icon = create_icon(raw_icon);
    }

    //return;
    if (event_icon) {
        // render marker
        event_marker = L.marker(
            latlng,
            {
                id: event_id,
                type: 'assessment',
                icon: event_icon,
                event_selected: false,
                raw_icon: raw_icon,
                zIndexOffset: 100000
            }
        );
        event_marker.data = {
            assessment_id: event_id,
            assessment: event_context['assessment'],
            country: country,
            created_date: created_date,
            data_captor: data_captor,
            latlng: latlng,
            name: assessment_name,
            overall_assessment: overall_assessment,
            enriched: enriched
        };

        if (is_selected) {
            event_marker.options.event_selected = true;
        }
    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id});
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });
/*
    var popup = L.popup().setContent(
        "<b>" + assessment_name + "</b>"
    );

    event_marker.bindPopup(popup, {
        'closeButton': false,
        'closeOnClick': false,
        'keepInView': false
    });
    event_marker.on('mouseover', function (e) {
        event_marker.openPopup();
    });
    // don't make hover if it is focused marker'
    event_marker.on('mouseout', function (e) {
        event_marker.closePopup();
    });

    // if it is selected, add to selected marker variable
    if (is_selected) {
        WB.storage.setItem('selectedMarker', event_marker);
    }*/
    // Add to markers

    WB.storage.addArrayItem('markers', event_marker);


    if (is_event_in_show(event_marker)) {
        var layerName = enriched ? 'mapLayers.enrichedGroup' : 'mapLayers.assessmentsGroup';

        console.log('is_event_in_show', event_marker);
       // WB.storage.getItem(layerName).addLayer(event_marker);
    }
    return {
        marker: event_marker
    };
}

function add_event_marker(event_context) {
    console.log('add_event_marker', event_context);
    // Variables
    var event_icon;
    var event_marker;
    var event_id = event_context['id'];

    var assessment_name = event_context['name'];
    var country = event_context['country'];
    var created_date = event_context['created_date'];
    var data_captor = event_context['data_captor'];
    var lat = event_context['geometry'][1];
    var lng = event_context['geometry'][0];
    var overall_assessment = event_context['overall_assessment'];
    var enriched = event_context['enriched'];

    var raw_icon = WB.storage.getItem('overallAssessmentIcons')[overall_assessment] || {};

    var latlng = L.latLng(lat, lng);

    var is_selected = is_selected_marker(event_id, 'assessment');

    if (is_selected) {
        event_icon = create_big_icon(raw_icon);
    } else {
        event_icon = create_icon(raw_icon);
    }

    if (event_icon) {
        // render marker
        event_marker = L.marker(
            latlng,
            {
                id: event_id,
                type: 'assessment',
                icon: event_icon,
                event_selected: false,
                raw_icon: raw_icon,
                zIndexOffset: 100000
            }
        );
        event_marker.data = {
            assessment_id: event_id,
            assessment: event_context['assessment'],
            country: country,
            created_date: created_date,
            data_captor: data_captor,
            latlng: latlng,
            name: assessment_name,
            overall_assessment: overall_assessment,
            enriched: enriched
        };

        if (is_selected) {
            event_marker.options.event_selected = true;
        }
    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id});
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });

    var popup = L.popup().setContent(
        "<b>" + assessment_name + "</b>"
    );

    event_marker.bindPopup(popup, {
        'closeButton': false,
        'closeOnClick': false,
        'keepInView': false
    });
    event_marker.on('mouseover', function (e) {
        event_marker.openPopup();
    });
    // don't make hover if it is focused marker'
    event_marker.on('mouseout', function (e) {
        event_marker.closePopup();
    });

    // if it is selected, add to selected marker variable
    if (is_selected_marker(event_id, 'assessment')) {
        selected_marker = event_marker;
    }
    // Add to markers

    WB.storage.addArrayItem('markers', event_marker);


    if (is_event_in_show(event_marker)) {
      /*  if (typeof(d3) !== "undefined") {
            var date = new Date(created_date);
            var month = d3.time.month(date);
            WB.storage.addArrayItem('allData', {
                "overall_assessment": overall_assessment,
                "country": country,
                "data_captor": data_captor,
                "month": month,
                "number": 1
            });
        }
*/
        var layerName = enriched ? 'mapLayers.enrichedGroup' : 'mapLayers.assessmentsGroup';

        // WB.storage
        WB.storage.getItem(layerName).addLayer(event_marker);
    }
    return event_marker;
}


function getMarkers(leafletMap) {
    // get boundary
    var map_boundaries = leafletMap.getBounds();
    var west = map_boundaries.getWest();
    var east = map_boundaries.getEast();

    var north = WB.utils.wrapNumber(map_boundaries.getNorth(), -90, 90);
    var south = WB.utils.wrapNumber(map_boundaries.getSouth(), -90, 90);

    var bbox = {
        'ne_lat': north,
        'ne_lng': east > 180 ? 180 : east,
        'sw_lat': south,
        'sw_lng': west < -180 ? -180 : west
    };

    bbox = JSON.stringify(bbox);

    $.ajax({
        type: 'POST',
        url: '/show_event',
        data: {
            bbox: bbox,
            'zoom': leafletMap.getZoom()
        },
        dataType: 'json',
        success: function (json) {
            clear_event_markers(leafletMap);

            var events = json;
            // check the control
            var i = 0;
            var markers = {};
            var created;
            for (i; i < events.length; i += 1) {
                var created = createMarker(events[i]);

                markers[markers.length] = created.marker;
            }
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}


function get_event_markers(leafletMap) {
    console.log('naaaaaaaaaa');

    return;
    // get boundary
    var map_boundaries = leafletMap.getBounds();
    var west = map_boundaries.getWest();
    var east = map_boundaries.getEast();
    var north = WB.utils.wrapNumber(map_boundaries.getNorth(), -90, 90);
    var south = WB.utils.wrapNumber(map_boundaries.getSouth(), -90, 90);
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
    bbox = JSON.stringify(bbox);
    $.ajax({
        type: 'POST',
        url: '/show_event',
        data: {
            bbox: bbox,
        },
        dataType: 'json',
        success: function (json) {
            clear_event_markers(leafletMap);
            // resetting data
            var all_data = [];
            var i = 1;

            for (i; i < 6; i++) {
                all_data[all_data.length] = {
                    "overall_assessment": i,
                    "country": "",
                    "data_captor": "",
                    "month": 0,
                    "number": 0
                }
            }

            WB.storage.setItem('allData', all_data);

            var events = json;
            var min_value = new Date();
            var max_value = 0;

            var time_range = WB.storage.getItem('timeRange');
            // check the control

            var marker, marker_date;
            for (i = 0; i < events.length; i++) {

                marker = add_event_marker(events[i]);
                marker_date = new Date(marker.data.created_date);

                min_value = Math.min(min_value, marker_date);
                max_value = Math.max(max_value, marker_date);
            }

            var default_range = time_range[1] - time_range[0];
            if (max_value - min_value < default_range) {
                var new_range = default_range - (max_value - min_value);
                max_value = max_value + new_range / 2;
                min_value = min_value - new_range / 2;
            }
            max_value += 1000 * 60 * 60 * 24 * 30 * 2;
            min_value -= 1000 * 60 * 60 * 24 * 30 * 2;
            var start_date = new Date(min_value);
            var end_date = new Date(max_value);

            var timeline_chart = WB.storage.getItem('timelineChart');

            if (timeline_chart) {
                timeline_chart.x(d3.time.scale().domain([start_date, end_date])).round(d3.time.month.round)
                    .xUnits(d3.time.months);
                timeline_chart.redraw();
            } else {
                // time_range = [start_date, end_date];
                WB.storage.setItem('timeRange', [start_date, end_date]);
            }
            render_statistic();
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}

function is_event_in_show(marker) {

    if (marker.data.enriched && !WB.storage.getItem('healthsitesGroupShown')) {
        return false;
    } else if (!marker.data.enriched && !WB.storage.getItem('assessmentsGroupShown')) {
        return false;
    } else {

    }

    var timeline_chart = WB.storage.getItem('timelineChart');
    // by time
    if (timeline_chart) {
        var filters = timeline_chart.filters();

        if (filters.length > 0) {
            if (filters[0].length == 2) {
                var min_date = filters[0][0];
                var max_date = filters[0][1];
                var event_date = new Date(marker.data.created_date);
                if (!(event_date >= min_date && event_date <= max_date)) {
                    return false
                }
            }
        }
    }

    var stat = WB.storage.getItem('uncheckedStatistic') || [];

    if (stat.indexOf('assess_identifier') > -1 || stat.indexOf('country_identifier') > -1 ||
        stat.indexOf('datacaptor_identifier') > -1) {
        return false;
    }
    return true;
}

function clear_event_markers() {
    const mapLayers = WB.storage.getItem('mapLayers');

    mapLayers['assessmentsGroup'].clearLayers();
    mapLayers['healthsitesGroup'].clearLayers();

    console.log('mapLayers', mapLayers);
    WB.storage.setItem('markers', []);
}

// --------------------------------------------------------------------
// HEALTHSITES
// --------------------------------------------------------------------

function healthsites_markers_callback (rawData) {
        clearLayerMarkers();

    var hcidMarkerUrl = WB.storage.getItem('hcidMarkerUrl');
    var leafletMap = WB.storage.getItem('map');

    var myIcon, data, latlng;
    for (var i = rawData.length - 1; i >= 0; i--) {
        data = rawData[i];

        // check if marker was clicked and remove it
        latlng = L.latLng(data['geometry'][1], data['geometry'][0]);

        // check if a marker is a cluster marker

        if (data['count'] > 1) {
            myIcon = L.divIcon({
                className: 'marker-icon',
                html: data['count'],
                iconAnchor: [24, 59],
                iconSize: [48, 59]
            });
        } else {
            if (is_selected_marker(data['id'], 'healthsite')) {
                myIcon = create_big_icon(hcidMarkerUrl);
            } else {
                myIcon = create_icon(hcidMarkerUrl);
            }
        }
        render_healthsite_marker(leafletMap, latlng, myIcon, data);
    }
}

function get_healthsites_markers(leafletMap) {
    // get boundary
    var bbox = leafletMap.getBounds().toBBoxString();

    console.log('get_healthsites_markers', bbox);

    $.ajax({
        type: 'GET',
        url: '/healthsites/cluster',
        data: {
            'bbox': bbox,
            'zoom': leafletMap.getZoom(),
            'iconsize': '48, 46'
        },
        dataType: 'json',
        success: function (json) {
            console.log(json);

            healthsites_markers_callback(json);
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}

function render_healthsite_marker(leafletMap, latlng, myIcon, data) {
    var mrk = new L.Marker(latlng, {
        id: data['id'],
        type: 'healthsite',
        icon: myIcon,
        event_selected: false,
        raw_icon: WB.storage.getItem('hcidMarkerUrl')
    });
    if (data['count'] === 1) {
        var html = "<b>" + data['name'] + "</b>";

        var popup = L.popup()
            .setContent(html);

        var options = {
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
        'healthsite_id': data['id'],
        'latlng': latlng,
        'uuid': data['uuid'],
        'bbox': data['minbbox'],
        'country': data['country'],
        'count': data['count'],
        'name': data['name'],
    };
    if (is_selected_marker(data['id'], 'healthsite')) {
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
            leafletMap.fitBounds(bounds);
        }
    });
    // check selected marker to be save to variable
    var is_selected = is_selected_marker(data['id'], 'healthsite');
    if (is_selected) {
        selected_marker = mrk;
    }
    var layers = WB.storage.getItem('mapLayers');
    // healthsitesGroup
    layers.healthsitesGroup.addLayer(mrk);
    return mrk;
}

function clearLayerMarkers(layerName) {
    var layer = WB.storage.getItem('mapLayers.' + layerName);

    if (layer) {
        layer.clearLayers();
    }
}


