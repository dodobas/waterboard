// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place
import * as wbFormUtils from '../components/form/wbForm.utils';

import initUpdateFeature from '../components/pages/updateFeaturePage';
import {wbXhr} from "../utils";

/**
 * Filter dashboard data based on filters
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function axFilterDashboardData({data}, options) {
    wbXhr({
        url: '/data/',
            data:data,
        success: function (resp) {
            console.log('resp', resp);
            WB.controller.updateDashboards(resp, options)
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
 * - RETURNS HTML
 * - on row click on Feature by uuid page
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
        url: `/feature-by-uuid/${featureUUID}/${changesetId}/`,
        success: function (data) {
            WB.historytable.showModalForm(data);
        },
        method: 'GET',
        errorFn: function (e) {
            console.log(e);
            WB.notif.options({
                message: 'Could not Fetch Change Sets',
                type: 'danger'
            }).show();
        },
        isResponseText: true
    });
}


/**
 * Update Feature
 * - on Feature update form update submit
 * - backend returns HTML
 * @param featureUUID
 * @param data
 * @param successCb
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

    /*
    _postFormAsJson({
        //url: '/update-feature/' + data._feature_uuid,
        url: `/api/update-feature/${feature_uuid}/`,
        data,
        isText: true,
        successCb: successCb || function (resp) {
            console.log('success', resp);
            // show modal and do not close
            LoadingModal.show();

            WB.notif.options({
                message: 'Water Point Successfully Updated.',
                type: 'success'
            }).show();

            // TODO: this is a simple way of 'refreshing' data after a successful data update
            //      window.location.reload(true);
        },
        errorCb: errorCb || function (request) {

            console.log('errot', request);
            WB.notif.options({
                message: 'Could not Update Water Point',
                type: 'danger'
            }).show();

            //    WB.FeatureForm.replaceFormMarkup(request.responseText);
            //  WB.FeatureForm.enableForm(true);
            //WB.FeatureForm.showUpdateButton(true);
        }
    });
*/
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
 * Get feature data based on uuid, used on feature_by_uuid page
 * TODO remove hardcoded success callback
 * @param conf
 */
function axGetFeatureByUUIDData(conf) {

    const successFn = function (response) {

        let {feature_data, attribute_groups, attribute_attributes} = response;

        conf.attributeGroups = wbFormUtils.prepareAttributesAttributeData(
            attribute_attributes,
            attribute_groups
        );

        conf.featureData = feature_data;

        console.log('CONF', conf);
        initUpdateFeature(conf);
    };

    wbXhr({
        url: `/api/feature/${conf.feature_uuid}/`,
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
    axGetFeatureByUUIDData
};

export default api;
