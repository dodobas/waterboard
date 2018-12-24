import {
    buildAttributeString,
    createDomObjectFromTemplate
} from '../formFieldsTemplateHandler';

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
        labelClassName='control-label',
        inputClassName='form-control',
        inputAttributes=[]
    } = props;

    let fieldAttrs = buildAttributeString(inputAttributes);

    return `
       <div class="form-group  ">
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
 * @param fieldOpts
 * @param fieldTemplateFn - text input string render function
 * @returns {*}
 */
export default function wbRenderTextInputField(fieldOpts, fieldTemplateFn) {
    const templateString =  fieldTemplateFn instanceof Function ? fieldTemplateFn(fieldOpts) :  _wbTextInputFieldTemplate(fieldOpts);

    return createDomObjectFromTemplate(templateString);
};
