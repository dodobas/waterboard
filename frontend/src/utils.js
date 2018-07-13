import _forEach from 'lodash/forEach';
import _trim from 'lodash/trim';

function _getCookieByName(name) {

    if (!document.cookie && document.cookie === '') {
        // throw new Error('No cookies found');
        return false;
    }

    const  cookies = document.cookie.split(';');
    const cookiesCnt = cookies.length;
    let i = 0;
    let cookie;
    let nameLength = name.length + 1;

    for (i; i < cookiesCnt; i += 1) {

        cookie = _trim(cookies[i]);

        // TODO refactore logic
        if (cookie.substring(0, nameLength) === (name + '=')) {
            // cookie starts with
            return decodeURIComponent(cookie.substring(nameLength));
        }
    }
}

// simple ajax wrapper... TODO basically sam as $.ajax... remove? error handling can be easier unified this way
function _ax(options) {

    const {url, data, successCb, errorCb, method = 'POST' } = options;

    let axDef = {
        url,
        method,
        beforeSend: (request) => WB.loadingModal.show(),
        complete: (request) => WB.loadingModal.hide(),
        success: (result) => successCb instanceof Function && successCb(result),
        error: (request, error) => {
            if (errorCb instanceof Function) {
                errorCb(request, error)
            } else {
                throw new Error(error)
            }
        }
    };

    // TODO review usages later
    if (data) {
        axDef.data = data;
    }

    $.ajax(axDef);
}

function _removeBlacklistedPropsFromObject (opts) {

    const {flatObj, blacklist = [undefined, '', null]} = opts;

    const prepared = {};

    _forEach(flatObj, (field, key) => {
        if (blacklist.indexOf(field) === -1){
            prepared[key] = field;
        }
    });

    return prepared;
}

// https://github.com/mischat/js-humanize
const _humanize = {
    humanize: function (value) {
        let mag = this.magnitude(value);

        if (mag <= 3) return value;

        if (mag > 3 && mag <= 6) {
            return value.toString().substr(0, mag - 3) + "K"
        }

        if (mag > 6 && mag <= 9) {
            return value.toString().substr(0, mag - 6) + "M"
        }

        if (mag > 9 && mag <= 12) {
            return value.toString().substr(0, mag - 9) + "B"
        }

        if (mag > 12 && mag <= 15) {
            return value.toString().substr(0, mag - 12) + "T"
        }

        return value;
    },

    magnitude: function (value) {
        let mag = 0;

        while(value > 1) {
          mag++;
          value = value / 10;
        }

        return mag;
    }
};


const utils = {
    removeBlacklistedPropsFromObject: _removeBlacklistedPropsFromObject,
    trim: _trim,
    getCookieByName: _getCookieByName,
    ax: _ax,
    humanize: _humanize
};

export default utils;
