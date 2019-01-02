/*global WB*/

// WB api endpoint calls - move all ax calls here to have them on same place
// TODO update global usages
// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place
import {prepareFormResponseData}/** as wbFormUtils*/ from '../components/form/wbForm.utils';

import initUpdateFeature from '../components/pages/updateFeaturePage';
import initCreateFeature from '../components/pages/createFeaturePage';

import {wbXhr} from "../utils";

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
 * Create new feature
 * UUID in data is set on form data get (axGetEmptyFeatureForm)
 * @param data
 */
function axCreateFeature({data}) {

    wbXhr({
        url: `/api/create-feature/`,
        data: JSON.stringify(data),
        success: function (resp) {
            console.log('[axCreateFeature success]', resp);
            // TODO
            /* LoadingModal.show();

             WB.notif.options({
                 message: 'Water Point Successfully Created.',
                 type: 'success'
             }).show();*/
        },
        method: 'POST',
        errorFn: error => {
            console.log('ERR', error);
            return error;
        }
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
        url: `/api/update-feature/${feature_uuid}/`,
        data: JSON.stringify(data),
        success: function (response) {
            let {featureData, attributeGroups} = prepareFormResponseData(response);

            WB.FeatureFormInstance.updateFormData({
                data: featureData,
                config: attributeGroups
            });
             WB.notif.options({
                 message: 'Water Point Successfully Updated.',
                 type: 'success'
             }).show();
        },
        method: 'POST',
        errorFn: error => {
            console.log('ERR', error);
            return error;
        }
    });
}


/**
 * Delete feature, returns 204 on success
 *
 * @param feature_uuid
 */
function axDeleteFeature({feature_uuid}) {
    wbXhr({
        url: `/api/delete-feature/${feature_uuid}/`,
        success: function (resp) {
//            console.log('[axDeleteFeature DELETE success]', resp);
            //LoadingModal.show();
             WB.notif.options({
                 message: 'Water Point Successfully Deleted.',
                 type: 'success'
             }).show();
            // replace does not keep the originating page in the session history
            window.location.replace('/table-report/');

        },
        method: 'DELETE',
        errorFn: error => {
            console.log('ERR', error);
            return error;
        }
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

    const successFn = function (response) {

        let prepared = prepareFormResponseData(response);

        initUpdateFeature(Object.assign({}, conf, prepared));
    };

    wbXhr({
        url: `/api/feature/${conf.feature_uuid}/`,
        success: successFn,
        method: 'GET'
    });

}

/**
 * Fetch empty WB form configuration and data
 * @param conf
 * @param successCb (optional)  - on form definition fetch success callback
 */

function axGetEmptyFeatureForm(conf, successCb) {

    const successFn = successCb || function (response) {

        let prepared = prepareFormResponseData(response);

        initCreateFeature(Object.assign({}, conf, prepared));
    };

    wbXhr({
        url: `/api/create-feature`,
        success: successFn,
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
        url: `/api/feature/${feature_uuid}/${changeset_id}/`,
        success: function (response) {

            let prepared = prepareFormResponseData(response);

            WB.HistorytableInstnace.showModalForm(prepared);
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

const api = {
    axGetMapData,
    axUpdateFeature,
    axDeleteFeature,
    axGetFeatureChangesetByUUID,
    axFilterDashboardData,
    axFilterAttributeOption,
    axGetFeatureByUUIDData,
    axGetEmptyFeatureForm,
    axCreateFeature

};

export default api;
