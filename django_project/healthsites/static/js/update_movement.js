/**
 * Created by ismailsunni on 5/13/15.
 */


var current_region;
var risk_level_colors = ['white', 'lime', 'yellow', 'red', 'black'];

function update_current(region_name, risk_level, movement_state){
    $('#current_region').text(region_name);
    $('#current_risk_level').text(risk_level);
    $('#current_movement_state').text(movement_state);
}

function add_current_region_geojson(geojson_data, risk_level_id){
    if (current_region){
        map.removeLayer(current_region);
    }

    current_region = L.geoJson(geojson_data, {
        style: function () {
            return {
                weight: 3,
                fillColor: risk_level_colors[risk_level_id - 1],
                color: 'blue',
                dashArray: '1'
            }
        }
    });
    current_region.addTo(map);
}

function add_provinces(provices){
    var province_select = $('#id_province');
    province_select.empty();
    var option = new Option("Entire Country", '0');
    province_select.append(option);
    $.each(provices, function(index, province){
        var option = new Option(province[1], province[0]);
        province_select.append(option);
    });
    province_select.parent().parent().show();
}

function set_dropdown_color(){
    $('select[id=id_risk_level]').children().each(function (){

        $(this).attr('style', 'background-color:' + risk_level_colors[$(this).val() - 1] + ';');
    });
    var risk_level = $('#id_risk_level');
    risk_level.on('change', function() {
        risk_level.attr('style', 'background-color:' + risk_level_colors[risk_level.val() - 1] + ';');
    });
}

function set_chosen_risk_level_color(){
    var risk_level = $('#id_risk_level');
    risk_level.attr('style', 'background-color:' + risk_level_colors[risk_level.val() - 1] + ';');
}

function id_region_change(){
    console.log('id_region_change');
    $('#success_panel').hide();
    $('#error_panel').hide();
    var id_region = $('#id_region');
    $.ajax({
            type: 'POST',
            url: '/get_country/',
            data: {'country_id': $('option:selected', id_region).val()},
            dataType: 'json',
            success: function(json){
                console.log('Ajax success for id_region_change');
                update_movement_view(json);
                add_provinces(json['provinces']);
            },
            error: function(xhr, errmsg, err){
                console.log(xhr.status + ": " + xhr.responseText);
            }
        }
    );
}

function province_drop_down_change(){
    console.log('province_drop_down_change');
    $('#success_panel').hide();
    $('#error_panel').hide();
    var id_province = $('#id_province');
    if ($('option:selected', id_province).val() == 0){
        $('#id_region').change();
    } else {
        $.ajax({
            type: 'POST',
            url: '/get_province/',
            data: {'province_id': $('option:selected', id_province).val()},
            dataType: 'json',
            success: function (json) {
                console.log('Ajax success for province_drop_down_change');
                update_movement_view(json);
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }
}

function update_movement_view(json){
    if (json['province_name']){
        $('#current_region').text(json['country_name'] + ' - ' + json['province_name']);
    }else{
        $('#current_region').text(json['country_name']);
    }
    $('#current_risk_level').text(json['risk_level_label']);
    $('#current_movement_state').text(json['movement_state_label']);

    $('#id_region').val(json['country_id']);
    $('#id_province').val(json['province_id']);
    $('#id_risk_level').val(json['risk_level_id']);
    $('#id_movement_state').val(json['movement_state_id']);
    $('#id_notified_immediately').prop(
        'checked', json['notified_immediately']);
    $('#id_notes').val(json['notes']);

    add_current_region_geojson(
        jQuery.parseJSON(json['polygon']),
        jQuery.parseJSON(json['risk_level_id']) );
    context = {
        'bounds': [
            [
                json['polygon_extent'][1],
                json['polygon_extent'][0]
            ],
            [
                json['polygon_extent'][3],
                json['polygon_extent'][2]
            ]
        ]
    };
    show_map(context);
    set_chosen_risk_level_color();
}