import {getOverlayTemplate} from '../templates/wb.templates';
/**
 * Simple jQuery / bootstrap dialog wrapper
 *
 * @param options
 * @returns {WB.Modal}
 * @constructor
 */
export class Modal {
    constructor (props) {

        const {
            parentId = 'wb-history-modal',
            contentClass = 'wb-dialog-form',
            customEvents,
        } = props;

        this.$modal = $('#' + parentId);

        this.$modalContent = $(`<div class="${contentClass}"></div>`);

        this.$modalDom = $('<div id="wb-dialog"></div>');
        this.$modalDom.append(this.$modalContent);

        this.$modal.find('.modal-body').append(this.$modalDom);

        this.customEvents = customEvents;
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

    /**
     * Add events to modal content elements
     * Used in confirmation modal
     * Events are attached to modal elements identified by selector
     *
     *  [{
     *    selector: '#wb-confirm-delete-btn',
     *    type: 'click',
     *    callback: () => {}
     *  }]
     *
     * @private
     */
    _addEvents = () => {
        let eventCnt = (this.customEvents || []).length;
        let i = 0;
        let parent = this.$modal[0];

        for(i; i<eventCnt; i+=1) {

            let {selector, callback, type} = this.customEvents[i];
            let eventParent = parent.querySelectorAll(selector);

            eventParent[0].addEventListener(type, callback);
        }
    }
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
