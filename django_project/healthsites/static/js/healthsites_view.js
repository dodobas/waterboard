/**
 * Created by meomancer on 12/05/16.
 */


$(document).ready(function () {
    $("#add_even_form").submit(function (event) {
        event.preventDefault();
    });
    $("#add_button").click(function () {
        submitForm("add");
    });
    $("#update_button").click(function () {
        submitForm("update");
    });
});
var csrftoken = getCookie('csrftoken');
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
function serialize_form(jquery_form) {
    var string = "";
    $('h3[role="tab"]').each(function () {
        // get group
        var group = $(this).text();
        // get all value
        var tab_panel = $('#' + $(this).attr('aria-controls'));
        var inputs = $(tab_panel).find('input');
        string += serialize_input_in_group(group, inputs);
        var inputs = $(tab_panel).find('select');
        string += serialize_input_in_group(group, inputs);
    });
    return string;
}
function serialize_input_in_group(group, inputs) {
    var string = ""
    for (var i = 0; i < inputs.length; i++) {
        if (group == "General") {
            string += "&" + $(inputs[i]).attr('name') + "=" + $(inputs[i]).val();
        } else {
            string += "&" + group + "/" + $(inputs[i]).attr('name') + "=" + $(inputs[i]).val();
        }
    }
    return string;
}
function submitForm(method) {
    $('#id_latitude').prop('disabled', false);
    $('#id_longitude').prop('disabled', false);
    $('.error-msg').remove();

    var queryString = serialize_form($('#add_even_form'));
    queryString += "&method=" + method;
    $.ajax({
        url: "/healthsites/update-assessment",
        method: 'POST',
        data: queryString,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        success: function (data) {
            if (data.success) {
                remove_new_marker();
                get_healthsites_markers();
                get_event_markers();
                renderMessages(data.success, data.messages);
            } else {
                if (data.params) {
                    var html = '<span id="error_id_name_1" class="error-msg">This field is required.</span>';
                    for (var i = 0; i < data.params.length; i++) {
                        $("#div_id_" + data.params[i]).append(html);
                    }
                    $("#data-accordion").accordion("refresh");
                } else {
                    renderMessages(data.success, data.messages);
                }
            }
        },
        error: function (request, error) {

        }
    })
    $('#id_latitude').prop('disabled', true);
    $('#id_longitude').prop('disabled', true);
}
function renderMessages(isSuccess, messages) {
    var html = "";
    for (var i = 0; i < messages.length; i++) {
        if (isSuccess) {
            html += '<div class="alert alert-dismissable alert-success">';
        } else {
            html = '<div class="alert alert-dismissable alert-danger">';
        }
        html += '<button type="button" class="close" data-dismiss="alert">×</button>'
        html += messages[i];
        html += '</div>';
    }
    $("#messages_wrapper").html(html);
}