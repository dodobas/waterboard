// TODO move all init functions from html files

/**
 * Main WB module / namespace init
 */
var WB = (function (module) {
    // GLOBALS - ALL PAGES

    // notification
    module.notif = WBLib.SimpleNotification()
        .options({
          message: null,
          type: 'success',
          fadeOut: {
            delay: Math.floor(Math.random() * 500) + 2500,
            enabled: true
          }
        });

      module.notif();



    return module;

})(WB || {});
