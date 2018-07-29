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

    function _removeBlacklistedPropsFromObject (opts) {

        const {flatObj, blacklist = [undefined, '', null]} = opts;

        //formData
       return  _.reduce(flatObj, (acc,val,  key) => {
            if (blacklist.indexOf(val) === -1){
                acc[key] = val;
            }
            return acc;
            }, {});
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
        humanize: _humanize
    };

    return module;

}(WB || {}));
