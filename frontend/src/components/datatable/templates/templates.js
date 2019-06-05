export const MAIN_TABLE_TEMPLATE = `<div class="{{className}}">
  <div class="{{toolbarClass}}"></div>
    <div class="{{divTableWrapClass}}">
    
        <div class="table_grid">
            <div class="table_grid_header_row"></div>
            <div class="table_body_wrap">
              <div class="table_body"></div>
            </div>
        </div>
        
    </div>
    <div class="{{footerClass}}"></div>
</div>`;

export const HEADER_ROW_TEMPLATE = `{{#data}}<div class="table_grid_header_cell" data-click-cb="onHeaderCellClick" data-sort-dir="{{sortDir}}" data-sort-key="{{key}}" title="{{label}}"><div>{{label}}</div> <i class="fa"></i></div>{{/data}}`;

export const TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE = `<div class="toolbar-item wb-button-group export-button-group">{{#data}}
      <a class='btn btn-xs btn-primary' href="{{& url}}" target='_blank' id='{{id}}'>
                {{label}} <i class='fa {{iconClass}}'></i>
            </a>
    {{/data}}</div>`;

/**
 * Create mustache table row template string
 * For every column name (fieldKey) create a column template
 *
 * @param fieldKeys
 * @param columnClickCbName - callback name specifieed in events mapping for wb datatable
 * @param rowIdKey  - row data unique identifier
 * @returns {string} template string used by mustache renderer
 */
export const createRowTemplateString = ({fieldKeys, columnClickCbName, rowIdKey = 'feature_uuid'}) => {
// data-context-cb=''
    // TODO use partials
    let columns = fieldKeys.map((field) => {
        return `<div  class="table_grid_body_cell" data-click-cb="${columnClickCbName}" data-context-cb="" data-dialog-name="">{{${field}}}</div>`
    }).join('');

    return `{{#data}}<div class="table_grid_row" data-row-id="{{${rowIdKey}}}">${columns}</div>{{/data}}`;

};
