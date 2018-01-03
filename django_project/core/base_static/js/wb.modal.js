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
        this.modalContent = WB.utils.domFromstring('<div class="wb-dialog-form"></div>');
        this.modalDom = WB.utils.domFromstring('<div id="wb-dialog"></div>');

        this.modalDom.appendChild(this.modalContent);

    },

    _setContent: function(content) {
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

        $(this.modalDom).dialog({
			modal: true,
            width: this.options.width || '70%',
            resizable: this.options.width || true,
            draggable: this.options.width || true,
			close: function() {
				self._hide();

				// TODO user callback
			}
		});
    }
};

