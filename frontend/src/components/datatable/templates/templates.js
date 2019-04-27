export const MAIN_TABLE_TEMPLATE = `<div class="{{className}}">
<div class="{{toolbarClass}}"></div>

        <div class="{{tableWrapClass}}">
            <table>
                <thead></thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="{{footerClass}}"></div>
        </div>`;

// TODO !!! hardcoded callback name !!! set data-click-cb from config
export const HEADER_ROW_TEMPLATE = `<tr>
        {{#data}}
        <th data-click-cb="columnClick" data-sort-dir="{{sortDir}}" data-sort-key="{{key}}" title="{{label}}"><div>{{label}}</div></th>
        {{/data}}
    </tr>`;


export const TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE = `<div class="export-button-group">{{#data}}
      <a class='btn btn-xs btn-primary' href="{{& url}}" target='_blank' id='{{id}}'>
                {{label}} <i class='fa {{iconClass}}'></i>
            </a>
    {{/data}}</div>`;

/**
 * Create mustache table row template string
 * For every column name (fieldKey) create a column template
 * TODO every column can have different data attributes, the field keys must contain some field definitions
 * @param fieldKeys
 * @param columnClickCbName
 * @returns {string} template string used by mustache renderer
 */
export const createRowTemplateString = ({fieldKeys, columnClickCbName, rowIdKey= 'feature_uuid'}) => {
    console.log('createRowTemplateString', fieldKeys, columnClickCbName);
// data-context-cb=''
    // TODO use partials
    let columns = fieldKeys.map((field) => {
        return `<td data-click-cb="${columnClickCbName}" data-context-cb="" data-dialog-name="">{{${field}}}</td>`
    }).join('');

    return `{{#data}}<tr data-row-index={{index}} data-row-id="{{${rowIdKey}}}">${columns}</tr>{{/data}}`;

};
