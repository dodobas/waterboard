/*global WB*/

// WB api endpoint calls - move all ax calls here to have them on same place
// TODO update global usages
// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place
import {prepareFormResponseData} from '../components/form/wbForm.utils';

import initUpdateFeature from '../components/pages/updateFeaturePage';
import initCreateFeature from '../components/pages/createFeaturePage';

import {wbXhr} from "../api.utils";

/**
 * Filter dashboard data based on filters
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function axFilterDashboardData({data}) {
    wbXhr({
        url: '/data/',
        data: data,
        success: function (resp) {
            WB.controller.updateDashboards(resp);
        },
        method: 'POST',
        errorFn: (err) => {
            WB.notif.options({
                message: 'Could not Fetch Dashboard data.',
                type: 'danger'
            }).show()
        }
    });
}

/**
 * Fetch map marker data on dashboards page
 *
 * On success will
 *    set new marker data in map controller
 *    clear current marker layer
 *    add new markers
 * @param data
 */
function axGetMapData({data}) {
    wbXhr({
        url: '/dashboard-mapdata/',
        data: data,
        success: function (resp) {
            WB.controller.map
                .markerData(resp)
                .clearLayer(true)
                .renderMarkers({
                    iconIdentifierKey: 'functioning'
                });
        },
        method: 'POST',
        errorFn: function (request, error) {
            WB.notif.options({
                message: 'Could not Fetch Map Data',
                type: 'danger'
            }).show()
        }
    });
}

// globalErrors: [], formErrors: {ave_dist_from_near_village: ["Enter a number."]}}
/**
 * Error callback handler, used in feature CRUD requests
 *
 * Helper function to parse, concat and show error messages
 *
 * Currently 2 types of error messages:
 *  - global: will be shown in notification
 *  - form: will be visible in form
 *
 * @param error ajax response
 * @private
 */
const _showApiResponseErrorAttributeMessages = (error) => {
    let errMsgs = JSON.parse(error.responseText);

    console.log('errMsgs', errMsgs);

    let {formErrors, globalErrors} = errMsgs;

    let formErrorsKeys = Object.keys(formErrors);

    if (formErrorsKeys.length > 0) {
        let prepared = formErrorsKeys.reduce(function (acc, val) {
            acc[val] = {
                errorText: formErrors[val].join(' ')
            };

            return acc;
        }, {});

        // TODO - colorize tab / form group
        WB.FeatureFormInstance.isFormValid = false;
        WB.FeatureFormInstance.errors = prepared;
        WB.FeatureFormInstance.showServerErrorMessages();
    }

    if (globalErrors.length > 0) {
        WB.notif.options({
            message: globalErrors.join('\n'),
            type: 'danger'
        }).show();
    }
};


/**
 * Create new feature
 * UUID in data is set on form data get (axGetEmptyFeatureForm)
 * @param data
 */
function axCreateFeature({data, feature_uuid}) {

    wbXhr({
        url: `/api/v1/create-feature/${feature_uuid}/`,
        data: data,
        isMultipart: true,
        success: function (resp) {
            // replace does not keep the originating page in the session history
            window.location.replace(`/feature-by-uuid/${resp.feature_data.feature_uuid}/`);
        },
        method: 'POST',
        errorFn: _showApiResponseErrorAttributeMessages
    });
}


/**
 * Update Feature
 * - on Feature update form update submit
 * - backend returns HTML
 * @param featureUUID
 * @param data
 */
function axUpdateFeature({data, feature_uuid}) {

    wbXhr({
        url: `/api/v1/update-feature/${feature_uuid}/`,
        data: data,
        isMultipart: true,  // multipart formdata POST works when ContentType is not set, uses FormData serializer when sending
        success: function (response) {

            // simply reload the page
            window.location.replace(`/feature-by-uuid/${response.feature_data.feature_uuid}/`);
        },
        method: 'POST',
        errorFn: _showApiResponseErrorAttributeMessages
    });
}


/**
 * Delete feature, returns 204 on success
 *
 * @param feature_uuid
 */
function axDeleteFeature({feature_uuid}) {
    wbXhr({
        url: `/api/v1/delete-feature/${feature_uuid}/`,
        success: function (resp) {
//            console.log('[axDeleteFeature DELETE success]', resp);
            WB.notif.options({
                message: 'Water Point Successfully Deleted.',
                type: 'success'
            }).show();

            window.location.replace('/table-report/');

        },
        method: 'DELETE',
        errorFn: _showApiResponseErrorAttributeMessages
    });
}


/**
 * Endpoint to filter attribute options and fills returned options
 *
 * @param query
 * @param name
 * @param selectizeCb
 */
function axFilterAttributeOption(query, name, selectizeCb) {
    wbXhr({
        url: `/attributes/filter/options?attributeOptionsSearchString=${query}&attributeKey=${name}`,
        success: function ({attribute_options}) {
            selectizeCb(attribute_options);
        },
        method: 'GET'
    });

}


/**
 * Get feature form data and configuration based on uuid, used on feature_by_uuid page
 * @param conf
 */
function axGetFeatureByUUIDData(conf) {

    wbXhr({
        url: `/api/v1/feature/${conf.feature_uuid}/`,
        success: function (response) {

            let prepared = prepareFormResponseData(response);

            initUpdateFeature(Object.assign({}, conf, prepared));
        },
        method: 'GET'
    });

}

/**
 * Fetch empty WB form configuration and data
 * @param conf
 * @param successCb (optional)  - on form definition fetch success callback
 */

function axGetEmptyFeatureForm(conf) {

    wbXhr({
        url: `/api/v1/create-feature`,
        success: function (response) {

            let prepared = prepareFormResponseData(response);

            initCreateFeature(Object.assign({}, conf, prepared));
        },
        method: 'GET'
    });

}


/**
 * Fetch changeset for feature
 * - used on row click on Feature by uuid page to fetch changeset data
 *
 * @param featureUUID
 * @param changesetId
 * @param successCb
 */
function axGetFeatureChangesetByUUID({feature_uuid, changeset_id}) {
    if (!feature_uuid || !changeset_id) {
        throw new Error('Feature UUID or changeset id not provided.');
    }

    wbXhr({
        url: `/api/v1/feature/${feature_uuid}/${changeset_id}/`,
        success: function (response) {

            let prepared = prepareFormResponseData(response);

            WB.showFeatureChangesetModal(prepared);
        },
        method: 'GET',
        errorFn: function (e) {
            console.log(e);
            WB.notif.options({
                message: 'Could not Fetch Change Sets',
                type: 'danger'
            }).show();
        }
    });
}

// WBLib.api.axFilterTableReportsData(JSON.stringify({
//     "offset": 0,
//     "limit": 25,
//     "search": "",
//     "filter": [],
//     "order": [],
// }))
function axFilterTableReportsData(data) {
    wbXhr({
        url: `/api/v1/tablereport/`,
        data: data,
        success: function (response) {
            WB.TableEvents.setBodyData(response, true);
        },
        method: 'POST',
        errorFn: function (e) {
            console.log(e);
        }
    });
}

/**
 * Fetch table report data export permissions
 *    [{"key": "csv", "label": "CSV", "url": "/export/csv"}, {"key": "xlsx", "label": "XLSX", "url": "/export/xlsx"}]
 */
function axFetchTableReporstDataExportPermissions(successCB) {

    wbXhr({
        url: `/api/v1/export/`,
        method: 'GET',
        success: function (response) {
            console.log('exportbtn perm', response);

            if (successCB instanceof Function) {
                successCB(response)
            }
        },
        errorFn: function (e) {
            console.log('Could not fetch export permissions', e);
        }
    });
}

/**
 * Delete attachment, returns 204 on success
 *
 * @param attachment_uuid
 */
function axDeleteAttachment({attachment_uuid}) {
    wbXhr({
        method: 'DELETE',
        url: `/api/v1/delete-attachment/${attachment_uuid}/`,
        success: function (resp) {
            WB.notif.options({
                message: 'Attachment Successfully Deleted.',
                type: 'success'
            }).show();
            // replace does not keep the originating page in the session history
            window.location.reload()

        },
        errorFn: error => {
            console.log('ERR', error);
            return error;
        }
    });
}

const api = {
    axGetMapData,
    axUpdateFeature,
    axDeleteFeature,
    axGetFeatureChangesetByUUID,
    axFilterDashboardData,
    axFilterAttributeOption,
    axGetFeatureByUUIDData,
    axGetEmptyFeatureForm,
    axCreateFeature,
    // axGetTableReportsData,
    axDeleteAttachment,
    axFilterTableReportsData,
    axFetchTableReporstDataExportPermissions
};

export default api;
