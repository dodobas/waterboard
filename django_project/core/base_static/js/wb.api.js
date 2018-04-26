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
function axFilterDashboardData (opts) {


    WB.utils.ax({
        method: 'POST',
        url: '/data/',
        data: opts.data,
        successCb: opts.successCb || function (data) {
            WB.controller.updateDashboards(data);
        },
        errorCb: opts.errorCb || function (request, error) {

            WB.notif.options({
              message: 'Could not Fetch Dashboard data.',
              type: 'danger'
            }).show();

        }
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
        throw new Error('Feature UUID or changeset id not provided.');
    }
    WB.utils.ax({
        method: 'GET',
        url: ['/feature-by-uuid/', opts.featureUUID, '/', opts.changesetId + '/'].join(''),
        successCb: opts.successCb || function (data) {
          WB.historytable.showModalForm(data);
        },
        errorCb: function () {
            WB.notif.options({
              message: 'Could not FetchChange Sets',
              type: 'danger'
            }).show();
        }
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
        errorCb: opts.errorCb || function (request) {

                /**
     * Feature form error handler
     * Django returns the form as a string with error fields on submit error
     *
     * Remove old form
     * Append new form (django response)
     * Init accordion on new form
     * Init the form, Enable form
     * @param request
     */
          WB.FeatureForm.replaceFormMarkup(request.responseText);
          WB.FeatureForm.enableForm(true);
          WB.FeatureForm.showUpdateButton(true);
        }
    });
}


function axGetMapData (opts) {
    WB.utils.ax({
        method: 'POST',
        url: '/dashboard-mapdata/',
        data: opts.data,
        errorCb: opts.errorCb || function (request, error) {
            WB.notif.options({
              message: 'Could not Fetch Map Data',
              type: 'danger'
            }).show();
        },
        successCb: opts.successCb || function (data) {
            WB.controller.map
                .markerData(data)
                .clearLayer(true)
                .renderMarkers({
                    iconIdentifierKey: 'functioning'
                });
        }
    });
}
