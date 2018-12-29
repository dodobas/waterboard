// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place
import * as wbFormUtils from '../components/form/wbForm.utils';

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
            console.log('resp', resp);
            WB.controller.updateDashboards(resp)
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
 * Fetch changeset for feature
 * - used on row click on Feature by uuid page to fetch changeset data
 *
 * @param featureUUID
 * @param changesetId
 * @param successCb
 */
function axGetFeatureChangesetByUUID({featureUUID, changesetId, successCb}) {
    if (!featureUUID || !changesetId) {
        throw new Error('Feature UUID or changeset id not provided.');
    }

    wbXhr({
        url: `/api/feature/${featureUUID}/${changesetId}/`,
        success: function (response) {
            console.log("AAAAAA", response);
            let prepared = _prepareFormResponseData(response);

             console.log("prepared", prepared);
            WB.historytable.showModalForm(prepared);
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
        data:data,
        success: function (resp) {
            console.log('[axUpdateFeature success]', resp);
            // show modal and do not close
            /* LoadingModal.show();

             WB.notif.options({
                 message: 'Water Point Successfully Updated.',
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
 * Create new feature
 * UUID in data is set on form data get (axGetEmptyFeatureForm)
 * @param data
 */
function axCreateFeature({data}) {

    wbXhr({
        url: `/api/create-feature/`,
        data:data,
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
 * Endpoint to filter attribute options and fills returned options
 *
 * @param query
 * @param name
 * @param selectizeCb
 */
function axFilterAttributeOption(query, name, selectizeCb) {
    wbXhr({
        url: `/attributes/filter/options?attributeOptionsSearchString=${query}&attributeKey=${name}`,
        success: function (response) {
            selectizeCb(response.attribute_options);
        },
        method: 'GET'
    });

}

/**
 * Feature form prepare function
 * Prepares fetched WB form data and configuration
 * @param responseData
 * @private
 */
function _prepareFormResponseData(responseData) {
     const conf = {};

        let {feature_data, attribute_groups, attribute_attributes} = responseData;

        conf.attributeGroups = wbFormUtils.prepareAttributesAttributeData(
            attribute_attributes,
            attribute_groups
        );

        conf.featureData = feature_data;

        return conf;
}

/**
 * Get feature form data and configuration based on uuid, used on feature_by_uuid page
 * @param conf
 * @param successCb (optional) - on feature fetch success callback
 */
function axGetFeatureByUUIDData(conf, successCb) {

    const successFn = successCb || function (response) {

        let prepared = _prepareFormResponseData(response);

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

        let prepared = _prepareFormResponseData(response);

        initCreateFeature(Object.assign({}, conf, prepared));
    };

    wbXhr({
        url: `/api/create-feature`,
        success: successFn,
        method: 'GET'
    });

}

const api = {
    axGetMapData,
    axUpdateFeature,
    axGetFeatureChangesetByUUID,
    axFilterDashboardData,
    axFilterAttributeOption,
    axGetFeatureByUUIDData,
    axGetEmptyFeatureForm,
    axCreateFeature,
    prepareFormResponseData: _prepareFormResponseData

};

export default api;
