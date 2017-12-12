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


var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];
// Variables
var markers = [];
var ndx;
var selected_marker = null;

// filtering variable
var all_data = [];
var unchecked_statistic = [];
var time_range = [new Date(2015, 0, 1), new Date(2016, 11, 31)];

// chart
var assessment_chart;
var country_chart;
var datacaptor_chart;
var timeline_chart;
var assessment_timeline_chart;

// groups of markers
var assessments_group = null;
var is_assessments_group_shown = true;
var healthsites_group = null;
var is_healthsites_group_shown = true;
var enriched_group = null;


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
    if (selected_marker) {
        set_icon(selected_marker, false);
        selected_marker = null;
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
            var value = data.assessment[key]["option"];
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
    if (selected_marker) {
        on_click_marker(selected_marker);
    }
}

function on_click_marker(marker) {
    var $download_excell_button = $('#download-assessment-excell');
    var $download_csv_button = $('#download-assessment-csv');
    $download_excell_button.hide();
    $download_csv_button.hide();
    reset_all_markers(marker);
    var is_selected = marker.options.event_selected;
    if (is_selected) {
        set_icon(marker, false);
        show_dashboard();
        render_statistic();
        selected_marker = null;
    } else {
        set_icon(marker, true);
        selected_marker = marker;
        show_detail(marker);
        map.panTo(new L.LatLng(marker._latlng.lat, marker._latlng.lng));
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
    if (selected_marker) {
        if (selected_marker.options.id == id && selected_marker.options.type == type) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function reset_all_markers(marker) {
    // change the markers for default
    for (var i = 0; i < markers.length; i++) {
        if (markers[i] && marker != markers[i]) {
            set_icon(markers[i], false);
            markers[i].options.event_selected = false;
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

function set_icon(target, selected) {
    let icon = selected ? create_big_icon(target.options.raw_icon) : create_icon(target.options.raw_icon);

    target.setIcon(icon);

    target.options.event_selected = selected;
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


function filtering() {
    assessments_group.clearLayers();
    enriched_group.clearLayers();
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            if (is_event_in_show(markers[i])) {
                var enriched = markers[i]['data']['enriched'];
                if (enriched) {
                    enriched_group.addLayer(markers[i]);
                } else {
                    assessments_group.addLayer(markers[i]);
                }
            }
        }
    }
    $('#num_events').text(assessments_group.getLayers().length + enriched_group.getLayers().length);
}

function resize_graph() {
    set_size_graph(assessment_chart, $("#overall_assessment_chart"));
    set_size_graph(country_chart, $("#country_chart"));
    set_size_graph(datacaptor_chart, $("#data_captor_chart"));
    set_size_graph(timeline_chart, $("#visualization"));
    set_size_graph(assessment_timeline_chart, $("#overall-assessments-timeline-chart"));
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
        // OVERALL ASSESSMENT
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
        var label = rects[i].textContent.split(":")[0];
        label = label.substr(label.length / 2);
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

        // render graph
        assessment_timeline_chart = dc.lineChart("#overall-assessments-timeline-chart");
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

// --------------------------------------------------------------------
// ASSESSMENT
// --------------------------------------------------------------------
function add_event_marker(event_context) {
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

        if (is_selected)  event_marker.options.event_selected = true;
    } else {
        event_marker = L.marker(
            [lat, lng], {id: event_id});
    }
    event_marker.on('click', function (evt) {
        on_click_marker(evt.target);
    });
    // create popup
    {
        var html = "<center><b>" + assessment_name + "</b></center>";
        var popup = L.popup()
            .setContent(html);
        var options =
        {
            'closeButton': false,
            'closeOnClick': false,
            'keepInView': false
        };
        event_marker.bindPopup(popup, options);
        event_marker.on('mouseover', function (e) {
            event_marker.openPopup();
        });
        // don't make hover if it is focused marker'
        event_marker.on('mouseout', function (e) {
            event_marker.closePopup();
        });
    }

    // if it is selected, add to selected marker variable
    if (is_selected_marker(event_id, 'assessment')) {
        selected_marker = event_marker;
    }
    // Add to markers
    markers[event_id] = event_marker;
    if (is_event_in_show(event_marker)) {
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
        if (enriched) {
            enriched_group.addLayer(event_marker);
        } else {
            assessments_group.addLayer(event_marker);
        }
    }
    return event_marker;
}

function get_event_markers() {
    // get boundary
    var map_boundaries = map.getBounds();
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
    if (marker.data.enriched && !is_healthsites_group_shown) {
        return false;
    } else if (!marker.data.enriched && !is_assessments_group_shown) {
        return false;
    }
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
    enriched_group.clearLayers();
    markers = [];
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
                    if (is_selected_marker(data['id'], 'healthsite')) {
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
        id: data['id'],
        type: 'healthsite',
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
            map.fitBounds(bounds);
        }
    });
    // check selected marker to be save to variable
    var is_selected = is_selected_marker(data['id'], 'healthsite');
    if (is_selected) {
        selected_marker = mrk;
    }
    healthsites_group.addLayer(mrk);
    return mrk;
}

function clear_healthsites_markers() {
    healthsites_group.clearLayers();
}
