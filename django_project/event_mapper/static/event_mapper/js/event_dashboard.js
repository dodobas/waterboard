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

var is_dashboard_enable = true;

// Variables
var INCIDENT_CODE = 1;
var ADVISORY_CODE = 2;
var selected_marker = null;
var ndx;
var markers = [];

// filtering variable
var all_data = [];
var unchecked_statistic = [];
var time_range = [new Date(2015, 0, 1), new Date(2016, 11, 31)];
// chart
var timeline_chart;
var assessment_chart;
var datacaptor_chart;
var country_chart;

// groups of markers
var healthsites_group = null;
var assessments_group = null;

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
        var big_icon = create_big_icon(target.options.raw_icon);
        target.setIcon(big_icon)
    } else {
        var normal_icon = create_icon(target.options.raw_icon);
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
    var healthsites_markers = healthsites_group.getLayers();
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
    if (!is_dashboard_enable) {
        if ($('#side_panel').is(":visible")) {
            toggle_side_panel();
        }
    }
}

function show_detail(data) {
    if (!$('#side_panel').is(":visible")) {
        toggle_side_panel();
    }
    $('#event_dashboard').hide();
    $('#event_detail').show();
    $('#detail-table').text("");
    if (data.name) {
        $('#detail-table').append('<tr><td style="width: 200px">Name</td><td><b>' + data.name + '</b></td></tr>');
    }
    if (data.country) {
        $('#detail-table').append('<tr><td>Country</td><td><b>' + data.country + '</b></td></tr>');
    }
    if (data.data_captor) {
        $('#detail-table').append('<tr><td>Data Captor</td><td><b>' + data.data_captor + '</b></td></tr>');
    }
    if (data.created_date) {
        $('#detail-table').append('<tr><td>Created</td><td><b>' + new Date(data.created_date) + '</b></td></tr>');
    }
    if (data.overall_assessment) {
        $('#detail-table').append('<tr><td>Overall Assessment</td><td><b>' + data.overall_assessment + '</b></td></tr>');
    }
    // create assessment
    if (data.assessment) {
        var group = "";
        var assessment_html = ""
        Object.keys(data.assessment).sort().forEach(function (key) {
            var keys = key.split("/");
            if (group != keys[0]) {
                group = keys[0];
                assessment_html += '<tr><td class="detail-subtitle-row" colspan="2"><b>' + group + '</b></td></tr>';
            }
            var value = data.assessment[key]["option"];
            var description = data.assessment[key]["description"];
            if (value == "") {
                value = "-";
            }
            assessment_html += '<tr><td>' + keys[1] + '</td><td title="' + description + '"><b>' + value + '</b></td></tr>';
        });
        if (assessment_html != "") {
            $('#detail-table').append('<tr><td class="detail-title-row" colspan="2"><b>Assessment</b></td></tr>');
            $('#detail-table').append(assessment_html);
        }
    }

    if (!$('#side_panel').is(":visible")) {
        toggle_side_panel();
    }
    init_collapsing_table();
}

function is_selected_marker(latlng, place_name) {
    if (selected_marker) {
        if (selected_marker._latlng.lat == latlng.lat && selected_marker._latlng.lng == latlng.lng && selected_marker.data.name == place_name) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


function show_side_panel() {
    if (!$('#side_panel').is(":visible")) {
        toggle_side_panel();
    }
}
function hide_side_panel() {
    if ($('#side_panel').is(":visible")) {
        toggle_side_panel();
    }
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

function init_collapsing_table() {
    var rowtitle = $('.detail-subtitle-row').parent();
    var maintitle = $('.detail-title-row').parent();
    maintitle.nextAll().hide();
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

// --------------------------------------------------------------------
// ASSESSMENT
// --------------------------------------------------------------------
function add_event_marker(event_context) {
    // Variables
    var event_icon;
    var event_marker;
    var event_id = event_context['id'];
    var lat = event_context['healthsite']['geometry'][1];
    var lng = event_context['healthsite']['geometry'][0];
    var assessment_name = event_context['healthsite']['name'];
    var country = event_context['healthsite']['country'];
    var data_captor = event_context['data_captor'];
    var created_date = event_context['created_date'];
    var overall_assessment = event_context['overall_assessment'];

    var raw_icon;
    if (overall_assessment == 1) {
        raw_icon = "/static/event_mapper/css/images/red-marker-icon-2x.png";
    } else if (overall_assessment == 2) {
        raw_icon = "/static/event_mapper/css/images/orange-marker-icon-2x.png";
    } else if (overall_assessment == 3) {
        raw_icon = "/static/event_mapper/css/images/yellow-marker-icon-2x.png";
    } else if (overall_assessment == 4) {
        raw_icon = "/static/event_mapper/css/images/lightgreen-marker-icon-2x.png";
    } else if (overall_assessment == 5) {
        raw_icon = "/static/event_mapper/css/images/green-marker-icon-2x.png";
    }

    var latlng = L.latLng(lat, lng);
    var is_selected = is_selected_marker(latlng, assessment_name);
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
                icon: event_icon,
                event_selected: false,
                raw_icon: raw_icon,
                zIndexOffset: 100000
            }
        );
        event_marker.data = {
            latlng: latlng,
            name: assessment_name,
            data_captor: data_captor,
            country: country,
            overall_assessment: overall_assessment,
            created_date: created_date,
            assessment: event_context['assessment']
        };
        if (is_selected) {
            event_marker.options.event_selected = true;
        }
        // get the list number)
        if (typeof(d3) !== "undefined") {
            var date = new Date(created_date);
            var month = d3.time.month(date);
            all_data.push({
                "overall_assessment": overall_assessment,
                "country": country,
                "data_captor": data_captor,
                "month": month,
                "number": 1
            });
        }

    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id});
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });
    // if it is selected, add to selected marker variable
    var is_selected = is_selected_marker(latlng, assessment_name);
    if (is_selected) {
        selected_marker = event_marker;
    }
    // Add to markers
    markers[event_id] = event_marker;
    if (is_event_in_show(event_marker)) {
        assessments_group.addLayer(event_marker);
    }
    return event_marker;
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
                "overall_assessment": 1,
                "country": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overall_assessment": 2,
                "country": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overall_assessment": 3,
                "country": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overall_assessment": 4,
                "country": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            all_data.push({
                "overall_assessment": 5,
                "country": "",
                "data_captor": "",
                "month": 0,
                "number": 0
            });
            var events = json;
            var min_value = new Date();
            var max_value = 0;

            // check the control
            for (var i = 0; i < events.length; i++) {
                var marker = add_event_marker(events[i]);
                var marker_date = new Date(marker.data.created_date);
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
            render_statistic();
        },
        errors: function () {
            console.log('Ajax failed');
        }
    })
}

function is_event_in_show(marker) {
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

    var assess_identifier = "assess_" + marker.data.overall_assessment;
    var country_identifier = "country_" + marker.data.country;
    var datacaptor_identifier = "datacaptor_" + marker.data.data_captor;

    var is_checked = true;
    if ($.inArray(assess_identifier, unchecked_statistic) > -1 || $.inArray(country_identifier, unchecked_statistic) > -1 || $.inArray(datacaptor_identifier, unchecked_statistic) > -1) {
        is_checked = false;
    }
    return is_checked;
}

function clear_event_markers() {
    assessments_group.clearLayers();
    markers = [];
}

function filtering() {
    assessments_group.clearLayers();
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            if (is_event_in_show(markers[i])) {
                assessments_group.addLayer(markers[i]);
            }
        }
    }
    $('#num_events').text(assessments_group.getLayers().length);
}

function resize_graph() {
    set_size_graph(assessment_chart, $("#overall_assessment_chart"));
    set_size_graph(country_chart, $("#country_chart"));
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
        // overall ASSESSMENT
        // -------------------------------------------------------
        if (!assessment_chart) {
            assessment_chart = dc.rowChart("#overall_assessment_chart");
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
            country_chart = dc.pieChart("#country_chart");
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
                filtering();
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
    //graph.legend(dc.legend().x(190).y(30));
    graph.height(parent_height);
    graph.width(parent_width);
}

function graph_filters(graph) {
    var id = $(graph).attr('id');
    var identifier = "";
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
    filtering();
}
// --------------------------------------------------------------------
// HEALTHSITES
// --------------------------------------------------------------------
var healthsite_marker_url = '/static/event_mapper/css/images/gray-marker-icon-2x.png';
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
                var latlng = L.latLng(data['geometry'][1], data['geometry'][0]);
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
        raw_icon: healthsite_marker_url
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
        'country': data['country'],
        'count': data['count'],
        'name': data['name'],
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
    // check selected marker to be save to variable
    var is_selected = is_selected_marker(latlng, data['name']);
    if (is_selected) {
        selected_marker = mrk;
    }
    healthsites_group.addLayer(mrk);
    return mrk;
}

function clear_healthsites_markers() {
    healthsites_group.clearLayers();
}