/**
 * heroes: kknezevic, dodobas
 *
 * Waterboard Utility Functions
 *
 * - WB.utils[name_of_method](...args)
 * TODO the utils can be broken into "utils by context file" e.g. wb.utils.ents.js
 */
var WB = (function (module) {

    module.utils = module.utils || {};

    // ADD EVENT
    module.utils.addEvent = function (domObj, type, callback) {

        if (!domObj) {
            throw new Error('No Valid dom Object supplied');
        }

        if (domObj.addEventListener) {

            domObj.addEventListener(type, callback, false);

        } else if (domObj.attachEvent) {

            domObj.attachEvent(`on${type}`, callback);

        } else {

            domObj[`on${type}`] = callback;

        }
    };

    // REMOVE EVENT
    module.utils.removeEvent = function (domObj, type, callback) {

        if (!domObj) {
            throw new Error('No Valid dom Object supplied');
        }

        if (domObj.removeEventListener) {

            domObj.removeEventListener(type, callback, false);

        } else if (domObj.detachEvent) {

            domObj.detachEvent(`on${type}`, callback);

        } else {

            domObj[`on${type}`] = callback;

        }
    };

    // FIRE EVENT
    module.utils.fireEvent = function (domObj, type, data) {
        let event = document.createEvent('Events');

        event.initEvent(type, true, false);

        event.detail = data || {};

        domObj.fireEvent(event);
        // domObj.dispatchEvent(event);

        event = null;
    };


    module.utils.wrapNumber = function (number, min_value, max_value) {
        let delta = max_value - min_value;

        if (number === max_value) {
            return max_value;
        }
        return ((number - min_value) % delta + delta) % delta + min_value;
    };

    module.utils.trim = function (number, min_value, max_value) {
        let delta = max_value - min_value;

        if (number === max_value) {
            return max_value;
        }
        return ((number - min_value) % delta + delta) % delta + min_value;
    };

    /**
     * Removes any leading and trailing white spaces
     * WB.utils.trim('  knek   '); -> "knek"
     *
     * @param str
     * @returns {str}
     */
    module.utils.trim = function (str) {
        if (typeof str === 'string' || str instanceof String) {
            return str.replace(/^\s+|\s+$/g, '');
        }
        return str;
    };

    module.utils.getCookieByName = function (name) {

        if (!document.cookie && document.cookie === '') {
             // throw new Error('No cookies found');
            console.error('No cookies found');

            return false;
        }

        const cookies = document.cookie.split(';');
        const cookiesCnt = cookies.length;
        let i = 0;
        let cookie;
        let nameLength = name.length + 1;

        for (i; i < cookiesCnt; i += 1) {

            cookie = module.utils.trim(cookies[i]);

            // TODO refactore logic
            if (cookie.substring(0, nameLength) === (name + '=')) {
                // cookie starts with
                return decodeURIComponent(cookie.substring(nameLength));
            }
        }


    };



}(WB || {}));
