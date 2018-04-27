var WB = WB || {};

/**
 * Simple jQuery dialog wrapper
 *
 * @param options
 * @returns {WB.Modal}
 * @constructor
 */
WB.Modal = function (options) {
    this.options = options;
    this._init();

    return this;
};

WB.Modal.prototype = {
    _init: function() {
        this.modal =  document.getElementById('wb-history-modal');
        this.modalBody =  this.modal.querySelector('.modal-body');

        this.modalContent = WB.utils.domFromstring('<div class="wb-dialog-form"></div>');
        this.modalDom = WB.utils.domFromstring('<div id="wb-dialog"></div>');

        this.modalDom.appendChild(this.modalContent);
        this.modalBody.appendChild(this.modalDom);

    },

    _setContent: function(content) {
         this._removeContent();

        $(this.modalContent).html(content);

        return this.modalContent;
    },

    _removeContent: function (){
        while(this.modalContent.firstChild) {
            this.modalContent.removeChild(this.modalContent.firstChild);
        }
    },

    _hide: function () {
        this._removeContent();
        $( this.modalDom ).dialog( "close" );
    },

    _destroy: function () {
        this._removeContent();
        $( this.modalDom ).dialog( "destroy" );
    },

    _show: function () {
        var self = this;
        $(this.modal).modal({});
        $(this.modal).on('hidden.bs.modal', function (e) {
            self._hide();
        });
    }
};

/**
 *
 * @type {{show, hide}}
 */
WB.loadingModal = (function ($) {
	var $dialog = $('<div id="wb-overlay" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
		'<div class="wb-overlay-spinner">' +
                '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>' +
                '<span class="sr-only">Loading...</span>'+
			'</div></div>');

	return {
        show: function () {
			$dialog.modal({
                keyboard: false,
                show: true,
                backdrop: false
            });
		},
		hide: function () {
			$dialog.modal('hide');
		}
	};

})(jQuery);
/*
* WB.loadingModal.show();
* */
