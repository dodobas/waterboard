// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place


function getCookie(name) {
    if (!document.cookie) {
        return null;
    }

    const cookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));

    if (cookies.length === 0) {
        return null;
    }

    return decodeURIComponent(cookies[0].split('=')[1]);
}

// isText - used to distingusish between returned html (in forms) and json data
const _post = ({url, data, errorCb, successCb, isText = false}) => {

    return fetch(url, {
        method: 'POST', // or 'PUT'
        body: data, // data can be `string` or {object}
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(res => isText ? res.text() : res.json())
        .catch(error => errorCb(error))
        .then(response => successCb(response));
};


const _get = ({url, data, errorCb, successCb, isText = false}) => {

    return fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(res => isText ? res.text() : res.json())
        .catch(error => errorCb(error))
        .then(response => successCb(response));

};

/**
 * Filter dashboard data based on filters
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function axFilterDashboardData({data}, options) {
    const req = {
        url: '/data/',
        data,
        successCb: function (resp) {
            WB.controller.updateDashboards(resp, options)
        },
        errorCb: () => WB.notif.options({
            message: 'Could not Fetch Dashboard data.',
            type: 'danger'
        }).show()
    };

    _post(req);
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

    _get({
        url: `/feature-by-uuid/${featureUUID}/${changesetId}/`,
        isText: true,
        successCb: successCb || function (data) {
            WB.historytable.showModalForm(data);
        },
        errorCb: function (e) {
            console.log(e);
            WB.notif.options({
                message: 'Could not Fetch Change Sets',
                type: 'danger'
            }).show();
        }
    });

}


// isText - used to distingusish between returned html (in forms) and json data
const _postForm = ({url, data, errorCb, successCb, isText = false}) => {

    return fetch(url, {
        method: 'POST', // or 'PUT'
        body: new FormData(data), // data can be `string` or {object}
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(res => isText ? res.text() : res.json())
        .catch(error => errorCb(error))
        .then(response => successCb(response));
};



/**
 * Update Feature
 * - on Feature update form update submit
 * - backend returns HTML
 * @param featureUUID
 * @param data
 * @param successCb
 */
function axUpdateFeature({data, successCb, errorCb}) {
    _postForm({
        url: '/update-feature/' + data._feature_uuid,
        data,
        isText: true,
        successCb: successCb || function (resp) {
 console.log('success' , resp);
            // show modal and do not close
            WB.loadingModal.show();

            WB.notif.options({
                message: 'Water Point Successfully Updated.',
                type: 'success'
            }).show();

            // TODO: this is a simple way of 'refreshing' data after a successful data update
      //      window.location.reload(true);
        },
        errorCb: errorCb || function (request) {

            console.log('errot' , request);
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

}

function axGetMapData({data, successCb, errorCb}) {
    const req = {
        url: '/dashboard-mapdata/',
        data,
        successCb: successCb || function (data) {
            WB.controller.map
                .markerData(data)
                .clearLayer(true)
                .renderMarkers({
                    iconIdentifierKey: 'functioning'
                });
        },
        errorCb: errorCb || function (request, error) {
            WB.notif.options({
                message: 'Could not Fetch Map Data',
                type: 'danger'
            }).show()
        }
    };

    _post(req);

}

/**
 * Endpoint to filter attribute options and fills returned options
 *
 * @param query
 * @param name
 * @param selectizeCb
 */
function axFilterAttributeOption(query, name, selectizeCb) {
    _get({
        url: `/attributes/filter/options?attributeOptionsSearchString=${query}&attributeKey=${name}`,
        errorCb: function () {
            selectizeCb();
        },
        successCb: function (response) {
            selectizeCb(response.attribute_options);
        }
    });

}


const api = {
    getCookie,
    axGetMapData,
    axUpdateFeature,
    axGetFeatureChangesetByUUID,
    axFilterDashboardData,
    axFilterAttributeOption
};

export default api;
