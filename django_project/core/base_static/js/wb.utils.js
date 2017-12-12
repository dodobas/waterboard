/**
 * heroes: kknezevic, dodobas
 *
 * Waterboard Utility Functions
 *
 * - WB.utils[name_of_method](...args)
 *
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

        domObj.dispatchEvent(event);

        event = null;
    };


    module.utils.wrapNumber = function (number, min_value, max_value) {
        let delta = max_value - min_value;

        if (number === max_value) {
            return max_value;
        }
        return ((number - min_value) % delta + delta) % delta + min_value;
    };



    return module;


}(WB || {}));
