import api from '../../api/api';
import {
    buildAttributeString,
    createDomObjectFromTemplate
} from '../../templates.utils';
import {selectizeFormDropDown} from "../selectize";
import {Modal} from "../modal";

/**
 * Function that returns Waterboard text input field template string
 * @param props
 * @returns {string}
 * @private
 */
const _wbTextInputFieldTemplate = (props) => {

    const {
        key,
        label,
        required,
        type='text',
        value='',
        className='form-group',
        labelClassName='control-label',
        inputClassName='form-control',
        inputAttributes=[]
    } = props;

    let fieldAttrs = buildAttributeString(inputAttributes);

    return `
       <div class="${className}">
          <label for="${key}" class="${labelClassName}">
            ${label}
          </label>
          <div class="">
            <input ${required === true ? 'required' : ''}
                  
                  type="${type}"
                  name="${key}"
                  class="${inputClassName}"
                  value="${value}"
                  ${fieldAttrs}
              >
          </div>
       </div>
    `.trim();
};

/**
 * Function that returns Waterboard attachment upload input field template string
 * @param props
 * @returns {string}
 * @private
 */
const _wbAttachmentUploadInputFieldTemplate = (props) => {

    const {
        key,
        label,
        required,
        multiple,
        type='file',
        value='[]',
        className='form-group',
        labelClassName='control-label',
        inputClassName='form-control',
        inputAttributes=[]
    } = props;

    let fieldAttrs = buildAttributeString(inputAttributes);

    let parsedValue = [];
    if (value.length > 0) {
        parsedValue = JSON.parse(value);
    }

    const tmplAttachments = parsedValue.map(
        item => `
          <li><div>
            <button class="attachment-delete" data-attachment-uuid="${item.attachment_uuid}">Del</button>
            <a class="attachment-download" target="_blank" href="/api/v1/attachments/${item.attachment_uuid}/" title="${item.filename}">${item.attachment_uuid}</a>
           </div></li>`
    ).join('');

    return `
       <div class="${className}">
          <label for="${key}" class="${labelClassName}">
            ${label}
          </label>
          <div>
            <ul>
              ${tmplAttachments}
            </ul>          
          </div>
          <div class="">
            <input ${required === true ? 'required' : ''} ${multiple === true ? 'multiple' : ''}

                  type="${type}"
                  name="${key}"
                  class="${inputClassName}"
                  value="${value}"
                  ${fieldAttrs}
              >
          </div>
       </div>
    `.trim();
};


/**
 * Builds Text input dom object from string template
 * Attaches events if defined
 * If isSelectized is set will selectize the input field
 *
 * @param fieldOpts
 * @returns {*}
 */
export default function wbRenderTextInputField(fieldOpts) {

    const {onKeyPress, onKeyUp,isSelectized, selectizeOptions = {}} = fieldOpts;

    const textFieldComponent = createDomObjectFromTemplate(
        _wbTextInputFieldTemplate(fieldOpts)
    );

    const textField = textFieldComponent.querySelector('input');

    if (onKeyPress instanceof Function) {
        textField.addEventListener('keypress', onKeyPress);
    }

    if (onKeyUp instanceof Function) {
        textField.addEventListener('keyup', onKeyUp);
    }
    if (isSelectized === true) {
        selectizeFormDropDown(
            textField,
            selectizeOptions
        );
    }
    return textFieldComponent;
}

/**
 * Builds attachment upload input dom object from string template
 * Attaches events if defined
 *
 * @param fieldOpts
 * @returns {*}
 */
export function wbRenderAttachmentUploadInputField(fieldOpts) {

    // enable multi file upload
    fieldOpts['multiple'] = true;

    const attachmentFieldComponent = createDomObjectFromTemplate(
        _wbAttachmentUploadInputFieldTemplate(fieldOpts)
    );

    const del_buttons = attachmentFieldComponent.querySelectorAll('.attachment-delete');
    del_buttons.forEach((button) => {
        button.addEventListener('click', function(evt) {
            evt.preventDefault();

            let confirmationModal = new Modal({
                parentId: 'wb-attachment-delete',
                contentClass: 'wb-modal-confirm',
                content: `<p>Delete attachment ?</p>`,
                customEvents: [
                    {
                        selector: '#wb-confirm-delete-btn',
                        type: 'click',
                        callback: () => {
                            api.axDeleteAttachment({attachment_uuid: button.dataset.attachmentUuid});
                        }
                    }
                ],
                addEventsOnInit: true,
                removeContentOnClose: false
            });
            confirmationModal._show();

        })
    });

    return attachmentFieldComponent;
}
