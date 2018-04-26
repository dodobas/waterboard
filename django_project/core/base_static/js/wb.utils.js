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
        var event = document.createEvent('Events');

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
    function _initEventsFromConf (conf, parentDom, payload) {
       Object.keys(conf).forEach(function (key){
            var eventConf = conf[key];

            var formInput = parentDom.querySelector(eventConf.selector);

            _addEvent(formInput, eventConf.eventType, function (e) {
                eventConf.cbFunc({origEvent: e, payload: payload});
            });
        });
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

        var parentDom = (typeof parent === 'string') ? document.getElementById(parent) : parent;

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
        var i = 0;
        var cookie;
        var nameLength = name.length + 1;

        for (i; i < cookiesCnt; i += 1) {

            cookie = module.utils.trim(cookies[i]);

            // TODO refactore logic
            if (cookie.substring(0, nameLength) === (name + '=')) {
                // cookie starts with
                return decodeURIComponent(cookie.substring(nameLength));
            }
        }


    }

    // simple ajax wrapper... TODO basically sam as $.ajax... remove? error handling can be easier unified this way
    function _ax(options) {

        var url = options.url;
        var data = options.data;
        var successCb = options.successCb;
        var errorCb = options.errorCb;
        var method = options.method || 'POST';

        const axDef = {
            url: url,
            method: method,
            beforeSend: function (request) {
                WB.loadingModal.show();
            },
            complete: function (request) {
                WB.loadingModal.hide();
            },
            success: function (result) {
                if (successCb instanceof Function) {
                    successCb(result)
                }
            },
            error: function (request, error) {
                // WB.loadingModal.hide();
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
        var flatObj = opts.flatObj;
        var blacklist = opts.blacklist || [undefined, '', null];

        var fields = Object.keys(flatObj);
        var fieldsCnt = fields.length;
        var prepared = {};
        var i = 0, key;

        for (i; i < fieldsCnt; i += 1) {
            key = fields[i];

            if (blacklist.indexOf(flatObj[key]) === -1){
                prepared[key] = flatObj[key];
            }

        }
        return prepared;
    }




    /**
     * Add an item to array, returns new array
     *
     * @param arr           - array
     * @param newEntry      - array item
     * @param uniquePush    - if true, will check if newEntry already exists in arr
     * @returns {Array}
     */
    function _immutablePush(arr, newEntry, uniquePush){

        arr = arr.slice(0) || [];

        if (uniquePush === true) {
            if (arr.indexOf(newEntry) === -1) {
                arr.push(newEntry);

                return arr;
            }
            return arr;
        }
        arr.push(newEntry);

        return arr;
    }

    function _immutableRemove(arr, filterValue) {
        var index = arr.indexOf(filterValue);

        if (index > -1) {
            var newArray = arr.slice(0);

            newArray.splice(index, 1);

            return newArray;
        }
        return arr.slice(0);
    }


    // https://github.com/mischat/js-humanize

    var _humanize = {
        humanize: function (value) {
            var mag = this.magnitude(value);

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
            var mag = 0;

            while(value > 1) {
              mag++;
              value = value / 10;
            }

            return mag;
        }
    };


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
        ax: _ax,
        immutablePush: _immutablePush,
        immutableRemove: _immutableRemove,
        humanize: _humanize
    };

    return module;

}(WB || {}));
