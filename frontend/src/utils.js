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


const utils = {
    removeBlacklistedPropsFromObject: _removeBlacklistedPropsFromObject,
    getCookieByName: _getCookieByName,
    humanize: _humanize
};

export default utils;
