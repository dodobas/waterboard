/**
 * heroes: kknezevic, dodobas
 *
 * Waterboard Utility Functions
 *
 * - WB.utils[name_of_method](...args)
 * TODO the utils can be broken into "utils by context file" e.g. wb.utils.ents.js
 */
var WB = (function (module) {

    if (!module.utils) {
        module.utils = {};
    }

    // ADD EVENT
    function _addEvent(domObj, type, callback) {

        if (!domObj) {
            throw new Error('No Valid dom Object supplied');
        }

        if (domObj.addEventListener) {

            domObj.addEventListener(type, callback, false);

        } else if (domObj.attachEvent) {

            domObj.attachEvent('on' + type, callback);

        } else {

            domObj['on' + type] = callback;

        }
    }

    // REMOVE EVENT
    function _removeEvent(domObj, type, callback) {

        if (!domObj) {
            throw new Error('No Valid dom Object supplied');
        }

        if (domObj.removeEventListener) {

            domObj.removeEventListener(type, callback, false);

        } else if (domObj.detachEvent) {

            domObj.detachEvent('on' + type, callback);

        } else {

            domObj['on' + type] = callback;

        }
    }

    // FIRE EVENT
    function _fireEvent(domObj, type, data) {
        let event = document.createEvent('Events');

        event.initEvent(type, true, false);

        event.detail = data || {};

        domObj.fireEvent(event);
        // domObj.dispatchEvent(event);

        event = null;
    }

    /**
     * Init events on specified dom parent
     *
     * {
     *  name: {
     *       selector: '[data-group-name="basic"]',
     *       eventType: 'input',
     *       cbFunc: function (e) {}
     *  }
     * }
     * @param conf
     * @param parentDom
     */
    function _initEventsFromConf (conf, parentDom) {
       Object.keys(conf).forEach(function (key){
            var eventConf = conf[key];

            var formInput = parentDom.querySelector(eventConf.selector);

            _addEvent(formInput, eventConf.eventType, function (e) {
                eventConf.cbFunc({origEvent: e});
            });
        });
    }

    /**
     * After resize / debounce
     * @param func
     * @param wait
     * @param endCheck
     * @returns {Function}
     */
    function _debounce(func, wait, endCheck) {
        let timeout;

        return function () {
            const that = this;
            const args = arguments;

            const later = function () {
                timeout = null;
                if (!endCheck) {
                    func.apply(that, args);
                }
            };

            const callNow = endCheck && !timeout;

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

            if (callNow) {
                func.apply(that, args);
            }
        };
    }


    function _domFromstring(htmlString) {
        const dummy = document.createElement('div');

        dummy.innerHTML = htmlString;

        return dummy.firstChild;
    }

    // before setting any new innerHTML remove its contents first - IE issues
    function _removeDomChildrenFromParent(parent) {
        if (!parent){
            console.error('Not a valid Dom Object');
            return false;
        }

        let parentDom = (typeof parent === 'string') ? document.getElementById(parent) : parent;

        while ((parentDom.childNodes || []).length) {
            parentDom.removeChild(parentDom.firstChild);
        }

        return parentDom;
    }
    /**
     * Removes any leading and trailing white spaces
     * WB.utils.trim('  knek   '); -> "knek"
     *
     * @param str
     * @returns {str}
     */
    function _trim(str) {
        if (typeof str === 'string' || str instanceof String) {
            return str.replace(/^\s+|\s+$/g, '');
        }
        return str;
    }

    function _getCookieByName(name) {

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


    }

    /**
     * taken  from: https://github.com/cosmosio/nested-property
     * Get the property of an object nested in one or more objects
     * given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
     * @param {Object} object the object to get the property from
     * @param {String} property the path to the property as a string
     * @returns the object or the the property value if found
     */
    function _getNestedProperty(object, property) {
        if (object && typeof object == "object") {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop) {
                    return obj && obj[prop];
                }, object);
            } else if (typeof property == "number") {
                return object[property];
            } else {
                return object;
            }
        } else {
            return object;
        }
    }

    // simple ajax wrapper... TODO basically sam as $.ajax... remove? error handling can be easier unified this way
    function _ax(options) {

        var url = options.url;
        var data = options.data;
        var successCb = options.successCb;
        var errCb = options.errCb;
        var method = options.method || 'POST';

        const axDef = {
            url: url,
            method: method,
            success: function (result) {
                if (successCb instanceof Function) {
                    successCb(result)
                }
            },
            error: function (request, error) {
                if (errCb instanceof Function) {
                    errCb(request, error)
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
        var flatObj = opts.flatObj;
        var blacklist = opts.blacklist || [undefined, '', null];

        var fields = Object.keys(flatObj);
        var fieldsCnt = fields.length;
        var prepared = {};
        let i = 0, key;

        for (i; i < fieldsCnt; i += 1) {
            key = fields[i];

            if (blacklist.indexOf(flatObj[key]) === -1){
                prepared[key] = flatObj[key];
            }

        }
        return prepared;
    }


    module.utils = {
        removeBlacklistedPropsFromObject: _removeBlacklistedPropsFromObject,
        removeDomChildrenFromParent: _removeDomChildrenFromParent,
        initEventsFromConf: _initEventsFromConf,
        addEvent: _addEvent,
        removeEvent: _removeEvent,
        fireEvent: _fireEvent,
        trim: _trim,
        domFromstring: _domFromstring,
        getCookieByName: _getCookieByName,
        getNestedProperty: _getNestedProperty,
        debounce: _debounce,
        ax: _ax
    };

    return module;

}(WB || {}));
