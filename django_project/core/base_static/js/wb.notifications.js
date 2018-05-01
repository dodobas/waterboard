/**
 * heroes: kknezevic, dodobas
 *
 * Waterboard Utility Functions
 *
 * - WB.utils[name_of_method](...args)
 */
var WB = (function (module) {


    /**
     * Simple notifications using bootstrap classes
     *
     * SET OPTIONS
     *     WB.notif = WB.SimpleNotification()
      .options({
 *          message: 'Success message',
 *          type: 'success',
 *          fadeOut: {
 *            delay: Math.floor(Math.random() * 500) + 2500
 *          }
 *        });
     *
     * INIT DOM
     *     WB.notif();
     *
     * SHOW
     *     WB.notif.show();
     *
     * UPDATE
     *     WB.notif.options({
 *          message: 'New messeage - danger',
 *          type: 'danger'
 *        })
     *        .show();
     *
     * @constructor
     * @returns {notif}
     */
    function SimpleNotification() {
        var _INIT_TIME = new Date().getTime();
        var _ID = 'WB-notif-' + _INIT_TIME;

        var defaults = {
            type: 'success',
            closable: true,
            transition: 'fade',
            autoHide: true,
            fadeOut: {
                delay: 3000
            },
            message: null,
            onClose: function () {
                console.log('Default On Close Function');
            },
            onClosed: function () {
                console.log('Default After Close Function');
            }
        };
        var _reinitOnOptionsChange = true;
        var _options;

        var $wrapper, $content, $closeBtn;

        function _createNotification() {

            // wrapper
            var wrapperClass = 'wb-notifications ' + (_options.orientation || 'bottom-right');
            $wrapper = $('<div></div>').addClass(wrapperClass);

            // content
            var bootstrapClass = 'alert fade in ' + (_options.type ? 'alert-' + _options.type : 'alert-success');
            $content = $('<div></div>').addClass(bootstrapClass).html(_options.message);

            // close btn
            $closeBtn = $('<a class="close pull-right" href="#">&times;</a>');

            // add close btn to content
            $content.prepend($closeBtn);

            // add content to wrapper
            $wrapper.append($content);
        }


        var _onClose = function () {
            _options.onClose();
            $wrapper.remove();
            $content.remove();

            if (_options.onClosed instanceof Function) {
                _options.onClosed.call();
            }

            return false;
        };

        function _init() {
            _createNotification();

            $closeBtn.on('click', _onClose);
        }

        function notif() {
            _init();
        }

        notif.reinit = function () {
            _onClose();
            _init();
            return notif;
        };

        notif.hide = function () {
            _onClose();
        };

        notif.show = function () {
            if (_options.autoHide === true) {
                $content.delay(_options.fadeOut.delay || 3000)
                    .fadeOut('slow', _onClose);
            }

            $(document.body).append($wrapper);

            $content.alert();

        };

        notif.options = function (value) {
            if (!arguments.length) {
                return _options;
            }
            _options = _.extend({}, defaults, value);

            if (_reinitOnOptionsChange === true && $wrapper !== undefined) {
                notif.reinit();
            }

            return notif;
        };

        return notif;
    }

    module.SimpleNotification = SimpleNotification;

    return module;
})(WB || {});

