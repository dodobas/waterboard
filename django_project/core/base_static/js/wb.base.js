// WB SPECIFIC HELPER FUNCTIONS
// wrappers, callbacks, templates


var WB = WB || {};

function initAccordion(conf) {
    var accordion = $(conf.selector);
    accordion.accordion(conf.opts);

    return accordion;
}

/**
 * Table row click callback used on dashboards and table reports page
 *
 * Opens feature by uuid page based on clicked row UUID
 */
function tableRowClickHandlerFn(row) {
    if (!row.feature_uuid) {
        throw new Error('No Row UUID found');
    }

    var win = window.open('/feature-by-uuid/' + row.feature_uuid, '_blank');

    win.focus();
}

/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
function timestampColumnRenderer(data, type, row, meta) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
}
