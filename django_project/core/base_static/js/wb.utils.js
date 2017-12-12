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
            return;
        }

        if (domObj.addEventListener) {

            domObj.addEventListener(type, callback, false);

        } else if (domObj.attachEvent) {

            domObj.attachEvent('on' + type, callback);

        } else {

            domObj['on' + type] = callback;

        }
    };

    // REMOVE EVENT
    module.utils.removeEvent = function (domObj, type, callback) {

        if (!domObj) {
            return;
        }

        if (domObj.removeEventListener) {

            domObj.removeEventListener(type, callback, false);

        } else if (domObj.detachEvent) {

            domObj.detachEvent("on" + type, callback);

        } else {

            domObj["on" + type] = callback;

        }
    };

    // FIRE EVENT
    module.utils.fireEvent = function (domObj, type, data) {
        var event = document.createEvent('Events');

        event.initEvent(type, true, false);

        event.detail = data || {};

        domObj.dispatchEvent(event);

        event = null;
    };

    return module;


    return module;


}(WB || {}));
