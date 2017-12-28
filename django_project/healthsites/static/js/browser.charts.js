
function resize_graph() {
      var  assessment_chart = WB.storage.getItem('assessmentChart');
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

     var all_data = WB.storage.getItem('allData')

    var  assessment_chart = WB.storage.getItem('assessmentChart');
    var country_chart = WB.storage.getItem('countryChart');
    var datacaptor_chart = WB.storage.getItem('datacaptorChart');
    var timeline_chart = WB.storage.getItem('timelineChart');
    var all_data = WB.storage.getItem('allData');

    var ndx = WB.storage.getItem('ndx');
    try {
        if (!ndx) {

            ndx = crossfilter(all_data);
            WB.storage.setItem('ndx', ndx);
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
                WB.storage.setItem('ndx', ndx);
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
            var timeline_chart = dc.barChart("#visualization");
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
