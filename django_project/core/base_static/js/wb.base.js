// WB SPECIFIC HELPER FUNCTIONS
// wrappers, callbacks, templates


var WB = WB || {};

function initAccordion(conf) {
    var accordion = $(conf.selector);
    accordion.accordion(conf.opts);

    return accordion;
}

/**
 * Table row click callback used on dashboards and table reports page
 *
 * Opens feature by uuid page based on clicked row UUID
 */
function tableRowClickHandlerFn(row) {
    if (!row.feature_uuid) {
        throw new Error('No Row UUID found');
    }

    var win = window.open('/feature-by-uuid/' + row.feature_uuid, '_blank');

    win.focus();
}

/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
function timestampColumnRenderer(data, type, row, meta) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
}


function getFormAsDomObject(data, title) {

    var formStr = '<div class="panel panel-primary">' +
        '<div class="panel-heading panel-heading-without-padding">' +
        '<h4>' + (title || '') +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button></h4>' +
        '</div>' +
        '<div class="panel-body" >' +
        WB.utils.trim(data) +
        '</div>' +
        '</div>';

    console.log('ffffff', formStr);
    return $(formStr);
}

function getOverlayTemplate () {
      <!-- History Modal -->
    return '<div id="wb-overlay" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="wb-overlay-spinner">' +
            '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>' +
            '<span class="sr-only">Loading...</span>' +
        '</div>' +
    '</div>';
}


/**
 * Init "default" wb map marker
 * @param conf
 * @returns {*}
 */
function initMapMarker(conf) {

    var marker = L.marker(
        conf.geometry, {
            draggable: conf.draggable === true,
            riseOnHover: conf.riseOnHover === true,
            icon: conf.icon || L.divIcon({
                className: 'map-marker ' + (conf.markerClass || ''),
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-marker"></i>'
            })
        });

    if (conf.popupContent) {
        marker.bindPopup(conf.popupContent);
    }

    if (conf.dragend instanceof Function) {
        marker.on('dragend', conf.dragend);
    }

    if (conf.onClick instanceof Function) {
        marker.on('click', conf.onClick);
    }
    return marker;
}

/**
 * Create feature by uuid map marker
 *
 * Updates features form lat, lon on dragend
 */
function createFeatureByUUidMarker(conf) {

    var opts = conf.markerData;

    return initMapMarker({
        draggable: opts.draggable === true,
        geometry: opts.geometry,
        popupContent: (opts.data || {})._feature_uuid || '',
        dragend: function (e) {
           var coord = this.getLatLng();
            var coordDecimals = 7;
            WB.FeatureForm.setFormFieldValues({
                latitude: parseFloat(coord.lat).toFixed(coordDecimals),
                longitude:  parseFloat(coord.lng).toFixed(coordDecimals)
            });

        }
    });

}

// MAP FNCS - used in wb.map.js

/**
 * Create Markers on Dashboard page map
 * Markers are colored based on functioning group
 *
 * iconIdentifierKey
 *  - represents the marker data key which holds the group (yes, no, unknown) used for marker coloring on dashboard page
 *  - the marker key will be appended to marker class
 * @param opts
 * @returns {*}
 */
function createDashBoardMarker(conf) {
    var opts = conf || {};
    var markerData = opts.markerData;
    var iconIdentifierKey = opts.options.iconIdentifierKey;

    var coords = L.latLng(markerData.lat, markerData.lng);

    if (markerData.count !== undefined) {

        var clusterIcon = L.divIcon({
            className: 'marker-icon',
            html: '<span><b>' + WB.utils.humanize.humanize(markerData.count) + '</b></span>',
            iconAnchor: [24, 59],
            iconSize: [48, 59]

        });

        return initMapMarker({
            draggable: false,
            icon: clusterIcon,
            geometry: coords,
            riseOnHover: true,
            onClick: function (e) {
                // TODO: hacky, but seems to work, on click zoom to the center point
                this._map.fitBounds(L.latLngBounds([this.getLatLng()]), {
                    maxZoom: this._map.getZoom() + 1
                });
            }
        });
    } else {
        var popupContent = '<a target="_blank" href="/feature-by-uuid/' + markerData.feature_uuid + '">' + markerData.name + '</a><br/>' +
            'UID:' + markerData.unique_id + '<br/>' +
            'W:' + markerData.woreda + '<br/>' +
            'T:' + markerData.tabiya + '<br/>' +
            'K:' + markerData.kushet + '<br/>' +
            'YLD:' + markerData.yield + '<br/>' +
            'SWL:' + markerData.static_water_level;

        return initMapMarker({
            draggable: false,
            geometry: coords,
            markerClass: _.get(markerData, iconIdentifierKey, '').toLowerCase(),
            popupContent: popupContent
        });

    }
}

