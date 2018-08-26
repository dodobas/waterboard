import {getOverlayTemplate} from '../templates/wb.templates';
/**
 * Simple jQuery / bootstrap dialog wrapper
 *
 * @param options
 * @returns {WB.Modal}
 * @constructor
 */
export class Modal {
    constructor ({parentId = 'wb-history-modal'}) {

        this.$modal = $('#' + parentId);

        this.$modalContent = $('<div class="wb-dialog-form"></div>');
        this.$modalDom = $('<div id="wb-dialog"></div>');

        this.$modalDom.append(this.$modalContent);

        this.$modal.find('.modal-body').append(this.$modalDom);
    }

    _setContent = (content) => {
        this.$modalContent.html($(content));

        return this.$modalContent;
    };

    _hide =  () => {
        this.$modalContent.empty();
        this.$modalDom.dialog("close");
    };

    _show = () => {
        this.$modal.modal({});
        this.$modal.on('hidden.bs.modal', this._hide);
    };
}

/**
 * Simple overlay based on bootstrap modal
 * @type {{show, hide}}
 */
export const LoadingModal = (function ($, templateRenderer) {
    const  overlayTemplate = templateRenderer();

	const $dialog = $(overlayTemplate);

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

})(jQuery, getOverlayTemplate);
/*
* WB.loadingModal.show();
* */

const Modals = {
    Modal,
    LoadingModal
};

export default Modals;
