// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place

/**
 * Filter tabyia (group) data
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function axGetTabyiaData ({data, successCb}) {
    WB.utils.ax({
        method: 'GET',
        url: '/data/',
        data,
        successCb
    });
}

/**
 * Fetch changeset for feature
 * - on row click on Feature by uuid page
 * @param featureUUID
 * @param changesetId
 * @param successCb
 */
function axGetFeatureChangesetByUUID ({featureUUID, changesetId, successCb}) {
    if (!featureUUID || !changesetId) {
        throw new Error('Feature UUID or chengeset id not provided.');
    }
    WB.utils.ax({
        method: 'GET',
        url: `/feature-by-uuid/${featureUUID}/${changesetId}/`,
        successCb
    });
}

/**
 * Update Feature
 * - on Feature update form update submit
 * @param featureUUID
 * @param data
 * @param successCb
 */
function axUpdateFeature ({data, successCb}) {
    WB.utils.ax({
        url: `/update-feature/${data._feature_uuid}`,
        method: 'POST',
        data,
        successCb
    });
}
