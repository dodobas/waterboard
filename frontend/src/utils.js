import {DEFAULT_TIMESTAMP_IN_FORMAT, DEFAULT_TIMESTAMP_OUT_FORMAT} from "./components/pages/config";

// using lodash - _ form global / document scope

export function getCookieByName(name) {
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
 * Xhr request handler - repšlacement for fetch and jquery ajax
 *
 * if needed add props for content type and other headers
 * @param props
 */
export function wbXhr(props) {
    const {url, success, method, errorFn, data, isResponseText = false} = props;
console.log('wbXhr', data);
    if (typeof url === 'undefined' || typeof success === 'undefined' || typeof method === 'undefined') {
        console.log('missing params');
    }

    let wsUrl = url; // method.toLowerCase() === 'post' ? `${url}?reqDist=${(new Date()).getTime()}` : url;

    let req = new XMLHttpRequest();

    req.open(method, wsUrl, true);

    req.setRequestHeader('X-CSRFToken', getCookieByName('csrftoken'));

    req.setRequestHeader("Content-type", "application/json; charset=utf-8");

    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {

            if (req.status === 200 || req.status === 201) {
                let successArg = isResponseText === true? req.responseText: JSON.parse(req.responseText);
                success(successArg);
            } else {
                if (errorFn instanceof Function) {
                    errorFn(req);
                }
            }
        }
    };

    if (typeof data === 'undefined') {
        req.send();
    } else {
        req.send(data);
    }

   // return req;
}



// https://github.com/mischat/js-humanize
export const humanize = {
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


/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
export const timestampColumnRenderer = (data, type, row, meta) => moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);



(function(){
    // TODO at some point all jquery ajax will be replaced with fetch or standard xhr req
    jQuery(document).ajaxSend(function(event, xhr, settings) {

        if (!_safeMethod(settings.type) && _sameOrigin(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", getCookieByName('csrftoken'));
        }
        })
})();

// TODO replace usages with _.get(var, path, default)
export const defaultIfUndefined = (value, default_value = '-') => {
    return (value === undefined || value === null) ? default_value : value;
};


const utils = {
    humanize: humanize,
    timestampColumnRenderer,
    defaultIfUndefined
};

export default utils;
