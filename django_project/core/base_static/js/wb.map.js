var WB = WB || {};
WB.globals = WB.globals || {};


var globalVars = {
    selectedMarker: null,
    defaultMapConf: {
        editable: true,
        zoomControl: false,
        zoom: 6
    },
};

WB.storage = new SimpleStorage(globalVars);


/**
 * Create leaflet marker, attach dragend event
 *
 * Does not add the marker to map
 *
 * @param geometry
 * @param positionIcon
 * @param options
 * @returns {*}
 */
function createMarker(geometry, positionIcon, options) {

    var marker = L.marker(geometry, {
        icon: positionIcon,
        draggable: 'true'
    }).bindPopup("Sample.");

    if (options && options.data) {
        marker.data = options.data;
    }

    marker.on('dragend', function (e) {

        var newPosition = this.getLatLng();
        console.log('[marker dragend]', this, marker);
        console.log('[marker position]', newPosition);

        // if (dragEndCb) {
        //     dragEndCb()
        // }
    });

    return marker;
}

/**
 * Init custom div icon, used as marker
 * @param options
 */
function initDivIconClass(options) {
    var template = options.template || '<div class="wb-div-icon-marker"><i class="fa fa-map-marker fa-3x" aria-hidden="true"></i></div>';

    return L.DivIcon.extend({
        options: {
            className: 'wp-map-point',
            divText: 'not set',
            div: '',
            html: ''
        },

        createIcon: function () {
            var wrapDiv = document.createElement('div');
            wrapDiv.innerHTML = template;

            return wrapDiv;
        }
    });

}


function initLayers (layerOpts) {

    var layers = [];
    var baseLayers = {};

    var layer, conf;
    Object.keys(layerOpts).forEach(function (layerName) {
        conf = layerOpts[layerName];
        layer = L.tileLayer(conf.mapOpts.url, conf.mapOpts.options);

        layers[layers.length] = layer;
        baseLayers[conf.label] = layer;
    });

    return {
        layers: layers,
        baseLayers: baseLayers
    };
}

// # TODO add tokens ?access_token='
var DEFAULT_LAYERS = {
        osmLayer: {
            label: 'OSM',
            mapOpts: {
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            }
        },
        googleLayer: {
            label: 'Google',
            mapOpts: {
                url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                options: {
                    maxZoom: 20,
                    subdomains:['mt0','mt1','mt2','mt3']
                }
            }

        },
        mapbox: {
            label: 'MapBox',
            mapOpts: {
                url: 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png',
                options: {
                    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            }

        }
    };
// WB.globals.map.setView([14.3, 38.3], 6);
function showMap(options) {

    var mapId = options.mapId || 'featureMapWrap';
    var geometry = options.data._geometry || [14.3, 38.3];

    var mapConf = options.mapConf;
    var zoom = mapConf.zoom || 6;
    var layers = options.layers || DEFAULT_LAYERS;

    L.WbDivIcon = initDivIconClass({});

    var initiatedLayers = initLayers(layers);

    // only add the first layer to the map, when adding all layers, leaflet will create requests for all layers (we don't want that)
    mapConf.layers = initiatedLayers.layers[0];

    var leafletMap = L.map(mapId, mapConf).setView(geometry, zoom);

    new L.Control.Zoom({position: 'topright'}).addTo(leafletMap);

    // init layer control for all layers
    L.control.layers(initiatedLayers.baseLayers).addTo(leafletMap);

    leafletMap.on('moveend', function (e){

        console.log('#################3', e);
        console.log('##############', this);

        const bounds = this.getBounds();
        var coord = [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];

        // TODO add from conf
         $.ajax({
            type: 'GET',
            url: '/data/',
            data: {coord: coord},
            success: function (data) {
                console.log(data);

                var tabya = JSON.parse(data.group_cnt || '{}');

                console.log(tabya);
                a = tabya;

                // group_cnt
                //     var beneficiariesData = chartData.beneficiaries.data.map(
                //     (i) => Object.assign({}, i, {group: chartData.beneficiaries.groups[i.filter_group].label})
                // );
                // var beneficiariesColumns = _.map(chartData.beneficiaries.groups, i => i.label);
                //
                var beneficiariesBarChart = barChartHorizontal({
                    data: tabya,
                  //  columns: beneficiariesColumns,
                    parentId: 'beneficiariesBarChart',
                    height: 340,
                    svgClass: 'pie',
                    valueField: 'cnt',
                    labelField: 'group',
                    barClickHandler: function (d) {
                        console.log(d);
                        console.log(this);

                                    console.log('[clicked bar]', d);

                        $.ajax({
                            type: 'GET',
                            url: '/data/',
                            data: {tabiya: d.group, coord},
                            success: function (data) {
                                var map_data = JSON.parse(data.map_features);
                                console.log(data);
                                //map_features

                                var layer = WB.storage.getItem('featureMarkers');
                                layer.clearLayers();
                                for (var i=0,count=map_data.length; i < count; i++) {
                                  var marker = map_data[i];

                                  L.marker(L.latLng(marker.lat, marker.lng), {
                                    // icon: new L.WbDivIcon(),
                                    draggable: false
                                  }).bindPopup(marker.feature_uuid).addTo(featureMarkers);
                                }
                            }
                        })
                    }
                });
                // console.log('chart_data', chart_data);
            },
            error: function (err) {
                throw new Error(err);
            },

        })


    });
    return leafletMap;
}


function addMarkerToMap(geometry, leafletMap, options) {
    var marker = createMarker(
        geometry,
        new L.WbDivIcon(),
        options
    );
    marker.addTo(leafletMap);

    return marker;
}
