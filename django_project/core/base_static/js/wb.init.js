// TODO move all init functions from html files
// init function per page

var WB = (function (module) {

    if (!module.init) {
        module.init = {};

    }

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

      // init notification
      module.notif();

    // ===========================================================
    // FEATURE BY UUID PAGE INIT

    return module;

})(WB || {});
