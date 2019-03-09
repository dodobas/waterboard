// TODO separate templates and template generator

// const MAIN_TABLE_TEMPLATE = `<div class="tableWrap" id="tableWrap">
//         <table id="tableHead" class="tableHead" data-tResponsive="tbl">
//             <thead id="dataHeader">
//             </thead>
//         </table>
//         <div class="inner_table" id="inner_table" data-tResponsive="tblWrap">
//             <table id="tableBody" class="tableBody" role="grid" data-tResponsive="tbl">
//                 <tbody class="dataBody" id="dataBody">
//                 </tbody>
//             </table>
//         </div>
//         <div id="tableFooter" class="tableFooter" data-tResponsive="tbl"></div>`;
export const MAIN_TABLE_TEMPLATE = `<div class="wb-data-table">
        <div class="wb-table-wrap">
            <table>
                <thead></thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="tableFooter"></div>`;

// TODO !!! hardcoded callback name !!! set data-click-cb from config
export const HEADER_ROW_TEMPLATE = `<tr>
        {{#data}}
        <th data-click-cb="columnClick" data-sort-dir="{{sortDir}}" data-sort-key="{{key}}" title="{{label}}"><div>{{label}}</div></th>
        {{/data}}
    </tr>`;



/**
 * Create mustache table row template string
 * For every column name (fieldKey) create a column template
 * TODO every column can have different data attributes, the field keys must contain some field definitions
 * @param fieldKeys
 * @returns {string} template string used by mustache renderer
 */
export const createRowTemplateString = (fieldKeys) => {
// data-context-cb=''
    let columns = fieldKeys.map((field) => {
        return `<td data-click-cb="openFeatureInNewTab" data-context-cb="sampleGeneric" data-dialog-name="">{{${field}}}</td>`
    }).join('');

    return `{{#data}}<tr data-row-index={{index}} data-row-id="{{feature_uuid}}">${columns}</tr>{{/data}}`;

};
