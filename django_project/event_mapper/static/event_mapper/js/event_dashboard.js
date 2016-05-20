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

// Variables
var INCIDENT_CODE = 1;
var ADVISORY_CODE = 2;
var selected_marker = null;
var ndx;
var dateFormat;
var markers = [];

// filtering variable
var all_data = [];
var unchecked_statistic = [];
var time_range = [new Date(2015, 0, 1), new Date(2016, 11, 31)];
// chart
var timeline_chart;
var assessment_chart;
var datacaptor_chart;
var type_chart;

function normalize_json_string(string) {
    return string.replace(/\n/g, '<br>').slice(6, -6)
}

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

function on_click_marker(marker) {
    $('#download_button').hide();
    reset_all_markers(marker);
    var is_selected = marker.options.event_selected;
    if (is_selected) {
        set_icon(marker, false);
        show_dashboard();
        render_statistic();
        selected_marker = null;
    } else {
        set_icon(marker, true);
        show_detail(marker.data);
        selected_marker = marker;
        map.panTo(new L.LatLng(marker._latlng.lat, marker._latlng.lng));
        if (marker.options.id) {
            $('#download_button').show();
            $('#download_button').attr("href", "/download_assessment_report/" + marker.options.id);
        }
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

function show_dashboard() {
    $('#event_dashboard').show();
    $('#event_detail').hide();
    if (selected_marker) {
        set_icon(selected_marker, false);
        selected_marker = null;
    }
    if (markers_control) {
        if (!markers_control.isEventsControlChecked()) {
            if ($('#side_panel').is(":visible")) {
                toggle_side_panel();
            }
        }
    }
}

function show_detail(data) {
    if (!$('#side_panel').is(":visible")) {
        toggle_side_panel();
    }
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

    if (!$('#side_panel').is(":visible")) {
        toggle_side_panel();
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

function control_on_click(control) {
    if ($(control).hasClass("leaflet-control-command-unchecked")) {
        $(control).removeClass("leaflet-control-command-unchecked");
        if (control.title == "Healthsites") {
            show_healthsites_markers();
        } else {
            if (!$('#side_panel').is(":visible")) {
                toggle_side_panel();
            }
            show_event_markers();
        }
    } else {
        $(control).addClass("leaflet-control-command-unchecked");
        if (control.title == "Healthsites") {
            hide_healthsites_markers();
        } else {
            if ($('#side_panel').is(":visible")) {
                toggle_side_panel();
            }
            hide_event_markers();
        }
    }
    get_event_markers();
}

function updatePeriodReport() {
    var start = time_range[0];
    var end = time_range[1];
    var filters = timeline_chart.filters();
    if (filters.length > 0) {
        if (filters[0].length == 2) {
            start = filters[0][0];
            end = filters[0][1];
        }
    }
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
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
    var time = document.getElementById('time');
    document.getElementById('time').innerHTML = "<i>Period selected: <b>" + startStr + "</b> - <b>" + endStr + "</b></i>";
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
    // additional info
    var overal_assessment = event_context['properties']['overal_assessment'];
    var healthsite_type = event_context['properties']['healthsite_type'];

    // Draw event marker
    if (event_category == 1) {
        raw_active_icon = raw_incident_icon;
    } else if (event_category == 2) {
        raw_active_icon = raw_advisory_icon;
    }
    if (overal_assessment == 1) {
        raw_active_icon = "/static/event_mapper/css/images/red-marker-icon-2x.png";
    } else if (overal_assessment == 2) {
        raw_active_icon = "/static/event_mapper/css/images/orange-marker-icon-2x.png";
    } else if (overal_assessment == 3) {
        raw_active_icon = "/static/event_mapper/css/images/yellow-marker-icon-2x.png";
    } else if (overal_assessment == 4) {
        raw_active_icon = "/static/event_mapper/css/images/lightgreen-marker-icon-2x.png";
    } else if (overal_assessment == 5) {
        raw_active_icon = "/static/event_mapper/css/images/green-marker-icon-2x.png";
    }

    var latlng = L.latLng(lat, lng);
    var is_selected = is_selected_marker(latlng, event_place_name);
    if (is_selected) {
        event_icon = create_big_icon(raw_active_icon);
    } else {
        event_icon = create_icon(raw_active_icon);
    }

    var is_rendered = false;
    if (event_icon) {
        // render marker
        event_marker = L.marker(
            latlng,
            {
                id: event_id,
                icon: event_icon,
                event_selected: false,
                event_raw_active_icon: raw_active_icon,
                zIndexOffset: 100000
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
            event_reported_by: event_reported_by,
            event_overal_assessment: overal_assessment,
            event_healthsite_type: healthsite_type
        };
        if (is_selected) {
            event_marker.options.event_selected = true;
        }
        if (is_event_in_show(event_marker)) {
            event_marker.addTo(map);
            is_rendered = true;
        }

        // get the list number
        date = new Date(dateFormat.parse(event_date_time));
        month = d3.time.month(date);
        all_data.push({
            "overal": overal_assessment,
            "type": healthsite_type,
            "data_captor": event_reported_by,
            "month": month,
            "number": 1
        });

    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id}).addTo(map);
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });
    // Add to markers
    markers[event_id] = event_marker;
    // if it is selected, add to selected marker variable
    var is_selected = is_selected_marker(latlng, event_place_name);
    if (is_selected) {
        selected_marker = event_marker;
    }
    return {"marker": event_marker, "is_rendered": is_rendered};
}

function get_event_markers() {
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
    bbox = JSON.stringify(bbox);
    $.ajax({
        type: 'POST',
        url: '/show_event',
        data: {
            bbox: bbox,
        },
        dataType: 'json',
        success: function (json) {
            clear_event_markers();
            // resetting data
            all_data = [];
            all_data.push({
                "overal": 1,
                "type": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overal": 2,
                "type": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overal": 3,
                "type": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overal": 4,
                "type": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overal": 5,
                "type": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            var num_incident = 0;
            var num_advisory = 0;
            var events = json['events']['features'];
            var rendered_count = 0;
            var min_value = new Date();
            var max_value = 0;

            // check the control
            for (var i = 0; i < events.length; i++) {
                var output = add_event_marker(events[i]);
                // checking other properties
                if (events[i]['properties']['category'] == INCIDENT_CODE) {
                    num_incident++;
                } else if (events[i]['properties']['category'] == ADVISORY_CODE) {
                    num_advisory++;
                }
                if (output.is_rendered) {
                    rendered_count += 1;
                }
                var marker_date = new Date(dateFormat.parse(output.marker.data.event_date_time));
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
            if (timeline_chart) {
                timeline_chart.x(d3.time.scale().domain([start_date, end_date])).round(d3.time.month.round)
                    .xUnits(d3.time.months);
                timeline_chart.redraw();
            } else {
                time_range = [start_date, end_date];
            }
            $('#num_events').text(rendered_count);
            render_statistic();
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}

function is_event_in_show(marker) {
    if (markers_control) {
        if (!markers_control.isEventsControlChecked()) {
            return false
        }
    }
    // by time
    if (timeline_chart) {
        var filters = timeline_chart.filters();
        if (filters.length > 0) {
            if (filters[0].length == 2) {
                var min_date = filters[0][0];
                var max_date = filters[0][1];
                var event_date = new Date(dateFormat.parse(marker.data.event_date_time));
                if (!(event_date >= min_date && event_date <= max_date)) {
                    return false
                }
            }
        }
    }

    var assess_identifier = "assess_" + marker.data.event_overal_assessment;
    var type_identifier = "type_" + marker.data.event_healthsite_type;
    var datacaptor_identifier = "datacaptor_" + marker.data.event_reported_by;

    var is_checked = true;
    if ($.inArray(assess_identifier, unchecked_statistic) > -1 || $.inArray(type_identifier, unchecked_statistic) > -1 || $.inArray(datacaptor_identifier, unchecked_statistic) > -1) {
        is_checked = false;
    }
    return is_checked;
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
    var showing_markers = 0;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            if (is_event_in_show(markers[i])) {
                map.removeLayer(markers[i]);
                map.addLayer(markers[i]);
                showing_markers += 1;
            } else {
                map.removeLayer(markers[i]);
            }
        }
    }
    $('#num_events').text(showing_markers);
}

function resize_graph() {
    set_size_graph(assessment_chart, $("#overall_assessment_chart"));
    set_size_graph(type_chart, $("#type_chart"));
    set_size_graph(datacaptor_chart, $("#data_captor_chart"));
    set_size_graph(timeline_chart, $("#visualization"));
}
function render_statistic() {
    try {
        if (!ndx) {
            ndx = crossfilter(all_data);
        } else {
            try {
                var assessment_chart_filters = assessment_chart.filters();
                var type_chart_filters = type_chart.filters();
                var datacaptor_chart_filters = datacaptor_chart.filters();
                var timeline_chart_filters = timeline_chart.filters();
                assessment_chart.filter(null);
                type_chart.filter(null);
                datacaptor_chart.filter(null);
                timeline_chart.filter(null);
                ndx.remove();
                assessment_chart_filters.forEach(function (item) {
                    assessment_chart.filter(item);
                });
                type_chart_filters.forEach(function (item) {
                    type_chart.filter(item);
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
        // OVERAL ASSESSMENT
        // -------------------------------------------------------
        if (!assessment_chart) {
            assessment_chart = dc.rowChart("#overall_assessment_chart");
            // render chart
            var colorScale = d3.scale.ordinal().range(['#FF807F', '#FFCB7F', '#FFFF7F', '#D1FC7F', '#A1E37F']);
            var categoriesDim = ndx.dimension(function (d) {
                return d.overal;
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
        if (!type_chart) {
            var categoriesDim = ndx.dimension(function (d) {
                return d.type;
            });
            var categoriesValue = categoriesDim.group().reduceSum(function (d) {
                return d.number;
            });
            type_chart = dc.pieChart("#type_chart");
            type_chart
                .width(150).height(150)
                .dimension(categoriesDim).group(categoriesValue).on("postRedraw", function () {
                    graph_filters($("#type_chart"));
                }
            );
            set_size_graph(type_chart, $("#type_chart"));
            type_chart.render();
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
            datacaptor_chart = dc.pieChart("#data_captor_chart");
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
            timeline_chart = dc.barChart("#visualization");
            timeline_chart
                .width($("#side_panel").width()).height(119)
                .dimension(categoriesDim).group(categoriesValue).on("filtered", function () {
                updatePeriodReport();
            }).on("postRedraw", function () {
                show_event_markers();
            });
            timeline_chart.x(d3.time.scale().domain(time_range)).round(d3.time.month.round)
                .xUnits(d3.time.months);
            timeline_chart.margins({top: 10, right: 0, bottom: 30, left: -1})
            timeline_chart.yAxis().ticks(0);
            timeline_chart.render();
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
    assessment_chart.redraw();
    type_chart.redraw();
    datacaptor_chart.redraw();
    timeline_chart.redraw();
    if (graph == assessment_chart) {
        graph_filters($("#overall_assessment_chart"));
    } else if (graph == type_chart) {
        graph_filters($("#type_chart"));
    } else if (graph == datacaptor_chart) {
        graph_filters($("#data_captor_chart"));
    }
}

function set_size_graph(graph, parent) {
    var parent_width = parent.width();
    var parent_height = parent.height() - 1;
    //graph.legend(dc.legend().x(190).y(30));
    graph.height(parent_height);
    graph.width(parent_width);
}

function graph_filters(graph) {
    var id = $(graph).attr('id');
    var identifier = "";
    if (id == "overall_assessment_chart") {
        identifier = "assess_";
    } else if (id == "type_chart") {
        identifier = "type_";
    } else if (id == "data_captor_chart") {
        identifier = "datacaptor_";
    }
    // check the checked filtered
    var rects = graph.find('g.row');
    for (var i = 0; i < rects.length; i++) {
        var textContent = rects[i].textContent.substr(1);
        var label = textContent.split(":")[0];
        var rect = $(rects[i]).find('rect');
        if (rect) {
            var rect_class = $(rect).attr('class');
            if (rect_class) {
                var deselect = rect_class.indexOf("deselected") > -1;
                if (deselect) {
                    unchecked_statistic.remove(identifier + label);
                    unchecked_statistic.push(identifier + label);
                } else {
                    unchecked_statistic.remove(identifier + label);
                }
            } else {
                unchecked_statistic.remove(identifier + label);
            }
        }
    }
    var pies = graph.find('g.pie-slice');
    for (var i = 0; i < pies.length; i++) {
        var label = pies[i].textContent.split(":")[0];
        var deselect = $(pies[i]).attr('class').indexOf("deselected") > -1;
        if (deselect) {
            unchecked_statistic.remove(identifier + label);
            unchecked_statistic.push(identifier + label);
        } else {
            unchecked_statistic.remove(identifier + label);
        }
    }
    show_event_markers();
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
        'event_place_name': data['name'],
        'event_killed': latlng,
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
    if (markers_control) {
        if (markers_control.isHealthsitesControlChecked()) {
            mrk.addTo(map);
        }
    } else {
        mrk.addTo(map);
    }
    healthsites_markers.push(mrk);
    // check selected marker to be save to variable
    var is_selected = is_selected_marker(latlng, data['name']);
    if (is_selected) {
        selected_marker = mrk;
    }
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