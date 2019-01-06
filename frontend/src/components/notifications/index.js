/**
 * heroes: kknezevic, dodobas
 *
 * Waterboard Utility Functions
 *
 * - WB.utils[name_of_method](...args)
 */



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
export default function SimpleNotification() {
    const _INIT_TIME = new Date().getTime();

    let defaults = {
        type: 'success',
        closable: true,
        transition: 'fade',
        autoHide: true,
        fadeOutDelay: 3000,
        message: null,
        onClose: () => console.log('Default On Close Function'),
        onClosed: () => console.log('Default After Close Function')
    };

    let _reinitOnOptionsChange = true;
    let _options;

    let $wrapper, $content;

    function _createNotification() {

        // wrapper
        const wrapperClass = `wb-notifications ${_options.orientation || 'bottom-right'}`;

        $wrapper = $(`<div class="${wrapperClass}"></div>`);

        // content
        let  bootstrapClass = `alert fade in ${_options.type ? 'alert-' + _options.type : 'alert-success'}`;

        $content = $(`<div class="${bootstrapClass}">
          <a class="close pull-right" href="#">&times;</a>
          ${_options.message}
        </div>`);


        // add content to wrapper
        $wrapper.append($content);
    }


    const _onClose = function () {
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

        $content.find('a.close').on('click', _onClose);
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
        return notif;
    };

    notif.show = function () {
        if (_options.autoHide === true) {
            $content.delay(_options.fadeOutDelay)
                .fadeOut('slow', _onClose);
        }

        $(document.body).append($wrapper);

        $content.alert();

        return notif;
    };

    notif.options = function (value) {
        if (!arguments.length) {
            return _options;
        }
        _options = Object.assign({}, defaults, value);

        if (_reinitOnOptionsChange === true && $wrapper !== undefined) {
            notif.reinit();
        }

        return notif;
    };

    return notif;
}
