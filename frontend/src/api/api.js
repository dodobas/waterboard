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
        data:data,
        success: function (resp) {
            WB.controller.updateDashboards(resp);
        },
        method: 'POST',
        errorFn: (err) => {
            console.log('err', err);

            //
            WB.notif.options({
                message: 'Could not Fetch Dashboard data.',
                type: 'danger'
            }).show()}
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

/**
 * Helper function to parse, concat and show errormessages
 *
 * {"***": [msg1, msg2]}
 *
 * @param error (HTTPResponse)
 * @private
 */
const _showApiResponseErrorGlobalMessages = (error) => {
    console.log('_showApiResponseErrorGlobalMessages', error);
    let errMsgs = JSON.parse(error.responseText);

    WB.notif.options({
        message: errMsgs['***'].join('\n'),
        type: 'danger'
    }).show();
};



// {"total_errors": 2, "beneficiaries": ["Enter a whole number."], "ave_dist_from_near_village": ["Enter a number."]}
const _showApiResponseErrorAttributeMessages = (error) => {
    console.log('_showApiResponseErrorGlobalMessages', error);
    let errMsgs = JSON.parse(error.responseText);

    let errKeys = Object.keys(errMsgs);



    let errs = errKeys.filter((errKey) => {
        return errKey !== 'total_errors';
    });


    let prepared = errs.reduce(function (acc, val) {
        acc[val] = {
            errorText: errMsgs[val].join(' ')
        };

        return acc;
    }, {});

    WB.FeatureFormInstance.isFormValid = false;
    WB.FeatureFormInstance.errors = prepared;
    WB.FeatureFormInstance.showServerErrorMessages();



/*
    WB.notif.options({
        message: errMsgs['***'].join('\n'),
        type: 'danger'
    }).show();*/
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
        errorFn: _showApiResponseErrorGlobalMessages
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
            // let {featureData, attributeGroups, attributeAttributes} = prepareFormResponseData(response);

            // WB.FeatureFormInstance.updateFormData({
            //     data: featureData,
            //     fieldGroups: attributeGroups,
            //     fields: attributeAttributes
            // });
             // WB.notif.options({
             //     message: 'Water Point Successfully Updated.',
             //     type: 'success'
             // }).show();
             //

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
        errorFn: _showApiResponseErrorGlobalMessages
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


function axGetTableReportsData () {
    wbXhr({
        url: `/table-data/`,
        success: function (response) {
            WB.TableEvents.setBodyData(response, true);
        },
        method: 'POST',
        errorFn: function (e) {
            console.log('ERR:', e);
         }
    });
}
//
// WBLib.api.axFilterTableReportsData(JSON.stringify({
//     "offset": 0,
//     "limit": 25,
//     "search": "a search string",
//     "filter": [
//         {"zone": ["central"]},
//         {"woreda": ["ahferon", "adwa"]}
//     ],
//     "order": [
//         {"zone": "asc"},
//         {"fencing_exists": "desc"}
//     ],
// }))
//
// WBLib.api.axFilterTableReportsData(JSON.stringify({
//     "offset": 0,
//     "limit": 25,
//     "search": "",
//     "filter": [],
//     "order": [],
// }))
function axFilterTableReportsData (data) {
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
    axGetTableReportsData,
    axDeleteAttachment,
    axFilterTableReportsData
};

export default api;
