// TODO - handle / refactor  globals at some point
// leaflet global - L is included in page includes
// general idea is to use those globals from the global scope and to not include in build process


/**
 * Init Map Tile layers from tile configuration
 *
 * will initialise layer instances, handling default leaflet layers and bing plugin layer
 *
 * @param layerOpts
 * @param enabledLayerNames
 * @returns {{layerLabel: L.tileLayer}}
 */
export function initTileLayers(layerOpts, enabledLayerNames) {

    return (enabledLayerNames || []).reduce((acc, layerName) => {

        let {initType, label, mapOpts, key} = layerOpts[layerName];

        if (!initType || initType === 'default') {
            acc[label] = L.tileLayer(
                mapOpts.url,
                mapOpts.options
            );

        } else if (initType === 'custom') {
            // currently only bing layer here
            acc[label] = L.tileLayer.bing(key);

        } else {
            console.log('Could not initialize map layers.');
        }

        return acc;
    }, {});

}


/**
 *
 * @param clearLayer
 * @param markerLayer
 * @param leafletMap
 */
export function initMarkerLayer(clearLayer, markerLayer, leafletMap) {

    // HANDLE EXISTING LAYER - CLEAR / ADD LAYER TO MAP

    if (markerLayer) {

        clearLayer === true && markerLayer.clearLayers();

        leafletMap && !leafletMap.hasLayer(markerLayer) && markerLayer.addTo(leafletMap);

        return markerLayer;

    }

    // CREATE AND ADD NEW LAYER TO MAP

    if (leafletMap) {
        const newMarkerLayer = L.layerGroup([]);

        newMarkerLayer.addTo(leafletMap);

        return newMarkerLayer;
    }
}


// todo refactor - es6
export function selectizeSearch(options) {

    const {
        parentId = 'geo-search-wrap',
        urlFnc,
        leafletMap
    } = options;

    let searchResults = [];

    var searchParent = $(`#${parentId}` || '#geo-search-wrap');

    let field = $('<select name="search"></select>');

    searchParent.append(field);

    return field.selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        valueField: 'id',
        labelField: 'place_name',
        searchField: ['place_name'],
        options: [],
        items: null,
        create: false,

        load: function (query, callback) {
            if (!query) {
                return callback();
            }
            $.ajax({
                url: urlFnc(query),
                type: 'GET',
                dataType: 'json',
                error: function () {
                    callback();
                },
                success: function (response) {
                    // response format is bound to api...
                    searchResults = response.features;

                    callback(searchResults);
                }
            });

            return true;
        },
        onChange: function (id) {
            if (!id) {
                return false;
            }
            // TODO review behaviour when none selected
            var result = _.find(searchResults, function (place) {
                return place.id === id;
            });

            if (result === undefined) {
                return false;
            }

            if (result.bbox !== undefined) {
                leafletMap.fitBounds(
                    L.latLngBounds(
                        L.latLng(result.bbox[1], result.bbox[0]), // southWest
                        L.latLng(result.bbox[3], result.bbox[2]) // northEast
                    ));
            } else {
                leafletMap.setView([result.center[1], result.center[0]], 18);
            }

            return true;
        }
    });

}


/**
 * Render markers using markerRenderFn with markerData and options as arguments on leaflet
 * map instance
 * Zoom to last marker
 *
 * @param options
 * @param markerData
 * @param markerRenderFn
 * @param markerLayer
 * @param leafletMap
 */
export function addMarkersToMap({options, markerData, markerRenderFn, markerLayer, leafletMap}) {

    if (markerData instanceof Array && markerData.length > 0) {
        let marker;

        _.forEach(markerData, (data) => {
            marker = markerRenderFn({
                markerData: data,
                options: options
            });
            marker.addTo(markerLayer);
        });

        //if (markerData[markerData.length - 1].zoomToMarker === true && marker) {
        if (marker && marker.zoomToMarker === true) {
            leafletMap.fitBounds(L.latLngBounds([marker.getLatLng()]), {maxZoom: 12});
        }
    } else {
        WB.notif.options({
            message: 'No Data found',
            type: 'warning'
        }).show();
    }
}





/**
 * Init "default" wb map marker
 * @param conf
 * @returns {*}
 */
export function initMapMarker({
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
export function createFeatureByUUidMarker(conf) {

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
export function createDashBoardMarker(conf) {
    const {markerData, options} = conf;

    // yield is a reserved word... will fail if taken
    const {
        woreda, tabiya, kushet, static_water_level, feature_uuid, name, count, lat, lng, unique_id
    } = markerData;

    const coords = L.latLng(lat, lng);

    if (count !== undefined) {

        const clusterIcon = L.divIcon({
            className: 'marker-icon',
            html: `<span><b>${WBLib.utils.humanize.humanize(count)}</b></span>`,
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
        YLD: ${markerData.yield}<br/>
        SWL: ${static_water_level}`;


    return initMapMarker({
        draggable: false,
        geometry: coords,
        markerClass: _.get(markerData, options.iconIdentifierKey, '').toLowerCase(),
        popupContent: popupContent
    });


}
