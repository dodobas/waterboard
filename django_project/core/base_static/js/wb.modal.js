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

        $(this.modalContent).append(content);

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
        $('#wb-history-modal').modal({

        });
     /*   $(this.modalDom).dialog({
			modal: true,
            // appendTo: "#content",
            //position: ['center', 'center'],
            // position: { my: "center", at: "center", of: "#content"},
            width: this.options.width || '70%',

            resizable: this.options.resizable || true,
            draggable: this.options.draggable || true,
			close: function() {
				self._hide();

				// TODO user callback
			}
		});*/
    }
};

