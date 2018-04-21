// WB SPECIFIC HELPER FUNCTIONS


var WB = WB || {};


function initAccordion (conf) {
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

    var win = window.open('/feature-by-uuid/'+ row.feature_uuid, '_blank');

    win.focus();
}

/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
function timestampColumnRenderer ( data, type, row, meta ) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
}


function getFormAsDomObject (data, title) {

    return $(
        '<div class="panel panel-primary">' +
            '<div class="panel-heading panel-heading-without-padding">' +
                '<h4>' + title || '' +
                 '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                    '<span aria-hidden="true">&times;</span>'+
                '</button></h4>'+
            '</div>' +
            '<div class="panel-body" >' +
            data +
            '</div>' +
        '</div>');
}
