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


/**
 * Init "default" wb map marker
 * @param conf
 * @returns {*}
 */
function initMapMarker({
    geometry, draggable, riseOnHover, icon, markerClass, popupContent, dragend, onClick
}) {

    var marker = L.marker(
        geometry, {
            draggable: draggable === true,
            riseOnHover: riseOnHover === true,
            icon: icon || L.divIcon({
                className: 'map-marker ' + (markerClass || ''),
                iconSize: [32, 32],
                html: '<i class="fa fa-fw fa-map-marker"></i>'
            })
        });

    if (popupContent) {
        marker.bindPopup(popupContent);
    }

    if (dragend instanceof Function) {
        marker.on('dragend', dragend);
    }

    if (onClick instanceof Function) {
        marker.on('click', onClick);
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
    const {markerData, options} = conf;

    const {
        woreda, tabiya, kushet, yield, static_water_level, feature_uuid, name, count, lat, lng, unique_id
    } = markerData;

    const coords = L.latLng(lat, lng);

    if (count !== undefined) {

        const clusterIcon = L.divIcon({
            className: 'marker-icon',
            html: `<span><b>${WB.utils.humanize.humanize(count)}</b></span>`,
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

    }

    const popupContent = `<a target="_blank" href="/feature-by-uuid/${feature_uuid}">
    ${name}</a><br/>
        UID: ${unique_id}</a><br/>
        W: ${woreda}<br/>
        T: ${tabiya}<br/>
        K: ${kushet}<br/>
        YLD: ${yield}<br/>
        SWL: ${static_water_level}`;


    return initMapMarker({
        draggable: false,
        geometry: coords,
        markerClass: _.get(markerData, options.iconIdentifierKey, '').toLowerCase(),
        popupContent: popupContent
    });


}
