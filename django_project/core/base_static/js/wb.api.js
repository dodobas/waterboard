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
function axFilterTabyiaData (opts) {
    WB.utils.ax({
        method: 'POST',
        url: '/data/',
        data: opts.data,
        successCb: opts.successCb,
        errorCb: opts.errorCb
    });
}

/**
 * Filter fencing data
 *
 * data for tabyia: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 * data for fencing: {coord: [-180, -90, 180, 90], fencing: 'No'},
 *
 * @param data
 * @param successCb
 */


/**
 * Fetch changeset for feature
 * - on row click on Feature by uuid page
 * @param featureUUID
 * @param changesetId
 * @param successCb
 */
function axGetFeatureChangesetByUUID (opts) {
    if (!opts.featureUUID || !opts.changesetId) {
        throw new Error('Feature UUID or chengeset id not provided.');
    }
    WB.utils.ax({
        method: 'GET',
        url: ['/feature-by-uuid/', opts.featureUUID, '/', opts.changesetId + '/'].join(''),
        successCb: opts.successCb
    });
}

/**
 * Update Feature
 * - on Feature update form update submit
 * @param featureUUID
 * @param data
 * @param successCb
 */
function axUpdateFeature (opts) {
    WB.utils.ax({
        url: '/update-feature/' + opts.data._feature_uuid,
        method: 'POST',
        data: opts.data,
        successCb: opts.successCb,
        errCb: opts.errCb
    });
}
