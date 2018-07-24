// TODO - handle / refactor  globals at some point



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
export function initMarkerLayer (clearLayer, markerLayer, leafletMap) {

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
export function selectizeSearch (options) {

    const {
        parentId = 'geo-search-wrap',
        urlFnc,
        leafletMap
    } = options;
    // callBack, parentId
// init search box
    var searchResults = [];

    var searchParent = document.getElementById(parentId || 'geo-search-wrap');

    var field = $('<select name="search"></select>');

    $(searchParent).append(field);

   var _searchField = field.selectize({
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

    return _searchField;
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
