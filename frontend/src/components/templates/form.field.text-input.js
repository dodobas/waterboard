import {
    buildAttributeString,
    createDomObjectFromTemplate
} from '../../templates.utils';

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
 * Builds Text input dom object from string template
 * Attaches events if defined
 * @param fieldOpts
 * @returns {*}
 */
export default function wbRenderTextInputField(fieldOpts) {

    const {onKeyPress} = fieldOpts;

    const textFieldComponent = createDomObjectFromTemplate(
        _wbTextInputFieldTemplate(fieldOpts)
    );

    const textField = textFieldComponent.querySelector('input');

    if (onKeyPress instanceof Function) {
        textField.addEventListener('keypress', onKeyPress)
    }

    return textFieldComponent;
}
