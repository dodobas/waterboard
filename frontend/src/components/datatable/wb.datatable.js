import * as Mustache from 'mustache';

// WB datatable implementation


const MAIN_TABLE_TEMPLATE = `<div class="tableWrap" id="tableWrap">
        <table id="tableHead" class="tableHead" data-tResponsive="tbl">
            <thead id="dataHeader">
            </thead>
        </table>
        <div class="inner_table" id="inner_table" data-tResponsive="tblWrap">
            <table id="tableBody" class="tableBody" role="grid" data-tResponsive="tbl">
                <tbody class="dataBody" id="dataBody">
                </tbody>
            </table>
        </div>
        <div id="tableFooter" class="tableFooter" data-tResponsive="tbl"></div>`;

const HEADER_ROW_TEMPLATE = `<tr>
        {{#data}}
        <th data-click-cb="" data-sort-type="{{sortDir}}" data-sort-key="{{key}}" title="{{label}}">{{label}}</th>
        {{/data}}
    </tr>`;


/**
 * Create mustache table row template string
 * For every column name (fieldKey) create a column template
 * TODO every column can have different data attributes, the field keys must contain some field definitions
 * @param fieldKeys
 * @returns {string} template string used by mustache renderer
 */
const _createRowTemplateString = (fieldKeys) => {
// data-context-cb=''
    let columns = fieldKeys.map((field) => {
        return `<td data-click-cb="sampleGenericClick" data-context-cb="sampleGeneric" data-dialog-name="">{{${field}}}</td>`
    }).join('');

    return `{{#data}}<tr data-row-index={{index}} data-row-id="{{feature_uuid}}" class="qgroup">${columns}</tr>{{/data}}`;

};


/**
 * sort je u bazi
 * paginacija dolazi iz baze
 * tablica samo ima znanje o trenutno prikazanoj dati
 * data-click-cb
 * data-context-cb
 * data-dialog-name
 *
 * data-row-id
 * data-row-index
 */
export default class TableEvents {

    constructor(options) {

        const {
            data,
            fieldDef,
            uniqueKeyIdentifier = 'feature_uuid',
            whiteList,
            parentId,
            eventMapping
        } = options;

        console.log('OPTIONS:', options);

        this.uniqueKeyIdentifier = uniqueKeyIdentifier;
        this.whiteList = whiteList;
        this.rawData = data;
        this.fieldDef = fieldDef;

        this.preparedData = [];
        this.uniqueMapping = {};
        this.parent = document.getElementById(parentId);

        this.mustacheIx = 0;
// contextMenu, bodyClick, header
        this.eventMapping = eventMapping || {
            contextMenu: {},
            bodyClick: {},
            header: {}
        };

        this.renderTable();
    }

    renderTable = () => {
        this.parent.innerHTML = MAIN_TABLE_TEMPLATE;

        this.header = this.parent.querySelector('#dataHeader');
        this.tBody = this.parent.querySelector('#dataBody');


        this.rowTemplate = _createRowTemplateString(this.whiteList);

        this.renderHeader();
        this.addEvents();
    };

    renderHeader = () => {
        this.header.innerHTML = Mustache.render(HEADER_ROW_TEMPLATE, {
            data: this.fieldDef
        });
    };
    renderBodyData = () => {
         this.tBody.innerHTML = Mustache.render(this.rowTemplate, this.preparedData);
    };
    renderFooter = () => {};

    /**
     * Prepare raw body data array to be used by mustache template
     * Adds additional outer properties only
     *
     * The "index" and "id" functions are executed on render. Both are used inside the template.
     * They are used to map rendered row index to rows data unique identifier.
     *
     * mustacheIx is set when "index" is accessed from the template on render. If the "index" is not used in the template than it wont be executed
     *
     * The template does not have access to any parent properties (this in template references the data)
     * Every created row has a row index and row id data attribute
     *     <tr data-row-index="5" data-row-id="f95ee3d8-b1d1-47b3-bb5d-daf0126d4039">....</tr>
     * For every created row there is a mapping added: row identifier (feature_uuid): row index
     * On click the prepared row data is accessed using the row index
     *
     * Because the data is mapped to table body indexes the same row can be accsessed natively using this.tBody.rows[0]
     *
     * @param tableData
     */
    setBodyData =  (tableData) =>{
        const {recordsTotal, recordsFiltered, data} = tableData;
        var self = this;
        this.mustacheIx = 0;

        let tDataObj = {
            "data": data.slice(0),
            "index": function (){
                let rowId = this[self.uniqueKeyIdentifier];

                self.uniqueMapping[`${rowId}`] = self.mustacheIx;
                return self.mustacheIx++;
            },
            // "id": () => {
            //     return this.mustacheIx;
            // }
        };

        this.preparedData = tDataObj;
        this.mustacheIx = 0;
    };


    /**
     * On body event (click, context, change...) searches for the closest tr element starting from event.target
     * the tr element holds the row id and row index data attributes which identify the clicked row and its associated data
     * Returns found row index, row data and row id
     * @param e
     * @returns {{rowData: *, rowIndex: DOMStringMap.rowIndex, rowId: DOMStringMap.rowId}}
     */
    getRowPropsFromEvent = (e) => {
        let row = e.target.closest('tr');

        let {rowIndex, rowId} = row.dataset;

        return {
            rowIndex,
            rowId,
            rowData: this.preparedData.data[rowIndex]
        };
    };


    /**
     * Call a callback function from events mapping identified by its group name and function name
     *
     * The context menu event callback is bound to a column through the contextCb data attribute
     * The click event callback is bound to a column through the clickCb data attribute
     *
     *   <td
     *     data-context-cb='name-of-callback-fn'
     *     data-click-cb='name-of-callback-fn'>
     *   </td>
     *
     * For now the props argument is a object containing row props:
     *   props: {rowIndex, rowId, rowData}
     *
     * @param eventGroup (string)
     * @param fnName (string)
     * @param props ({})
     */
    handleTableEvent = ({eventGroup, fnName, props}) => {
        let fn = this.eventMapping[`${eventGroup}`][`${fnName}`];

        if (fn) {
            fn.call(this, props);
        }
    };

    /**
     * Add basic table events
     * All events are delegated (set to parent)
     * Basic Events:
     *   header click - TODO attach sort
     *   body (row) click - identified by row clickCb data attribute TODO the click event identifier is set on column.. set to row?
     *   body context menu - identified by contextCb data attribute
     */
    addEvents = () => {
// TODO some checks will be needed, we assume that the right click was on the <td> element - currently there are no nested elements sso  no problems...

        // Table header click event
        this.header.addEventListener('click', (e) => {

            let {sortKey, sortDir} = e.target.dataset;
            console.log('header click', sortKey, sortDir);
            // TODO sort and stuff
        });

        // Table body click event
        this.tBody.addEventListener('click', (e) => {
            let {clickCb} = e.target.dataset;

            this.handleTableEvent( {
                eventGroup: 'bodyClick',
                fnName:`${clickCb}`,
                props: this.getRowPropsFromEvent(e)
            });
        });

        // Table body context menu event
        this.tBody.addEventListener('contextmenu', (e) => {

            let {contextCb} = e.target.dataset;

            this.handleTableEvent( {
                eventGroup: 'bodyClick',
                fnName:`${contextCb}`,
                props: this.getRowPropsFromEvent(e)
            });
        });
    };

    // TO BE IMPLEMENTED - extend this class?

    registerDialog = (dialogName, dialogOptions) => {
    };
    showDialog = (dialogName) => {
    };
    hideDialog = (dialogName) => {
    };
    destroyDialog = (dialogName) => {
    };

    /**
     * Single row update function
     * When data changes the outer row dom object (<tr>) does not change only the inner does
     * The mapping between the data and the row stays intact
     *
     * Find the row, replace inner contents
     */
    updateBodyRow = () => {};

}
