// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place


var WB = (function (module) {

    module.api = module.api || {};

    /**
     * Filter dashboard data based on filters
     *
     * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
     *
     * @param data
     * @param successCb
     */
    module.api.axFilterDashboardData = function (opts) {

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
    };

    /**
     * Fetch changeset for feature
     * - on row click on Feature by uuid page
     *
     * @param featureUUID
     * @param changesetId
     * @param successCb
     */
    module.api.axGetFeatureChangesetByUUID = function (opts) {
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
    };


    /**
     * Update Feature
     * - on Feature update form update submit
     * @param featureUUID
     * @param data
     * @param successCb
     */
    module.api.axUpdateFeature = function (opts) {
        WB.utils.ax({
            url: '/update-feature/' + opts.data._feature_uuid,
            method: 'POST',
            data: opts.data,
            successCb: opts.successCb || function () {

                // show modal and do not close
                WB.loadingModal.show();


                WB.notif.options({
                message: 'Water Point Successfully Updated.',
                type: 'success'
              }).show();

              // TODO: this is a simple way of 'refreshing' data after a successful data update
              window.location.reload(true);
            },
            errorCb: opts.errorCb || function (request) {

                WB.notif.options({
                  message: 'Could not Update Water Point',
                  type: 'danger'
                }).show();

                /**
                 * Django returns form as a string with error fields on submit error
                 *
                 * Remove old form
                 * Append new form (django response)
                 * Init accordion on new form
                 * Init the form, Enable form
                 */
                  WB.FeatureForm.replaceFormMarkup(request.responseText);
                  WB.FeatureForm.enableForm(true);
                  WB.FeatureForm.showUpdateButton(true);
            }
        });
    };

    module.api.axGetMapData = function (opts) {
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
    };

    /**
     * Endpoint to filter attribute options and fills returned options
     *
     * @param query
     * @param name
     * @param selectizeCb
     */
    module.api.axFilterAttributeOption = function (query, name, selectizeCb) {
        var url = '/attributes/filter/options?attributeOptionsSearchString=' + query +'&attributeKey=' + name;

        WB.utils.ax({
            method: 'GET',
            url: url,
            errorCb: function () {
                selectizeCb();
            },
            successCb: function (response) {
                console.log('response', response);

                selectizeCb(response.attribute_options);
            }
        });
    };



    return module;

})(WB || {});






