import {DEFAULT_TIMESTAMP_IN_FORMAT, DEFAULT_TIMESTAMP_OUT_FORMAT} from "./components/pages/config";

// using lodash - _ form global / document scope

function _getCookieByName(name) {
    const cook = document.cookie;

    if (!cook) {
        // throw new Error('No cookies found');
        return false;
    }

    const  cookies = cook.split(';');
    const cookiesCnt = cookies.length;
    let i = 0;
    let cookie;
    let nameLength = name.length + 1;

    for (i; i < cookiesCnt; i += 1) {

        cookie = _.trim(cookies[i]);

        // TODO refactore logic
        if (cookie.substring(0, nameLength) === (name + '=')) {
            // cookie starts with
            return decodeURIComponent(cookie.substring(nameLength));
        }
    }
}

function _sameOrigin (url) {
    // url could be relative or scheme relative or absolute
    const host = document.location.host; // host + port
    const protocol = document.location.protocol;
    const sr_origin = `//${host}`;
    const origin = `${protocol}${sr_origin}`;

    // Allow absolute or scheme relative URLs to same origin
    return (url === origin || url.slice(0, origin.length + 1) === `${origin}/`) ||
        (url === sr_origin || url.slice(0, sr_origin.length + 1) === `${sr_origin}/`) ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}

const _safeMethod = (method) => (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));

/**
 * Remove blacklisted property values from object
 * Defaults to null, undefined and empty string
 *
 * @param flatObj
 * @param blacklist
 * @returns {*} new object
 * @private
 */
const _removeBlacklistedPropsFromObject = ({flatObj, blacklist = [undefined, '', null]}) =>
    _.reduce(flatObj, (acc,val,  key) => {
        if (blacklist.indexOf(val) === -1){
            acc[key] = val;
        }
        return acc;
    }, {});




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


const initAccordion = ({selector, opts}) => {
    const accordion = $(selector);
    accordion.accordion(opts);

    return accordion;
};

/**
 * Table row click callback used on dashboards and table reports page
 *
 * Opens feature by uuid page based on clicked row UUID
 */
function tableRowClickHandlerFn({feature_uuid}) {
    if (!feature_uuid) {
        throw new Error('No Row UUID found');
    }

    const win = window.open(`/feature-by-uuid/${feature_uuid}`, '_blank');

    win.focus();
}

/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
const timestampColumnRenderer = (data, type, row, meta) => moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);



(function(){
    // TODO at some point all jquery ajax will be replaced with fetch or standard xhr req
    jQuery(document).ajaxSend(function(event, xhr, settings) {

        if (!_safeMethod(settings.type) && _sameOrigin(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", _getCookieByName('csrftoken'));
        }
        })
})();

const defaultIfUndefiend = (value, default_value = '-') => {
    return (value === undefined || value === null) ? default_value : value;
};


const utils = {
    removeBlacklistedPropsFromObject: _removeBlacklistedPropsFromObject,
    getCookieByName: _getCookieByName,
    sameOrigin: _sameOrigin,
    safeMethod: _safeMethod,
    humanize: _humanize,
    initAccordion,
    tableRowClickHandlerFn,
    timestampColumnRenderer,
    defaultIfUndefiend
};

export default utils;
