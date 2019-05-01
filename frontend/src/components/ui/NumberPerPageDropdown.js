import {createDomObjectFromTemplate} from "../../templates.utils";
import * as Mustache from "mustache";


let DEFAULT_NUMBER_PER_PAGE_TEMPLATE = `<div class="{{className}}">
    <label for="{{name}}">{{prefixLabel}}</label>
     <select name="{{name}}" class="form-control input-sm">
     {{#data}}
         <option value="{{.}}">{{.}}</option>
     {{/data}}
     </select>
      <div>{{suffixLabel}}</div>
  </div>`;


export default function createNumberPerPageDropdown(options) {

    const {
        prefixLabel = 'Show',
        suffixLabel = 'entries',
        name,
        data = [10, 20, 50, 100],
        onChange,
        templateStr = DEFAULT_NUMBER_PER_PAGE_TEMPLATE,
        className = 'number-per-page'
    } = options;

    let templateConf = {
        prefixLabel: prefixLabel,
        suffixLabel: suffixLabel,
        name: name,
        data: data,
        className: className
    };

    let defaultSelected = templateConf.data[0];

    let _domObj = createDomObjectFromTemplate(Mustache.render(templateStr, templateConf));

    if (onChange && onChange instanceof Function) {
        _domObj.addEventListener('change', (e) => {
            let selectDomObj = e.target;

            // TODO the select value is a string by default, should be int?
            let _val = parseInt((selectDomObj.options[selectDomObj.selectedIndex].value || defaultSelected), 10);

            onChange(`${name}`, _val);
        });
    }
    return _domObj;
}
