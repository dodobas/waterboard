import * as Mustache from 'mustache';
import Pagination from '../pagination';
// WB datatable implementation

import {
    MAIN_TABLE_TEMPLATE,
    HEADER_ROW_TEMPLATE,
    createRowTemplateString
} from './templates/templates';


/**
 * WB datatable
 *
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
            eventMapping,
            tableTemplateStr = MAIN_TABLE_TEMPLATE,
            headerTemplateStr = HEADER_ROW_TEMPLATE,
            paginationOnChangeCallback,
            columnClickCbName,
            fixedTableHeader = true,

        } = options;

        console.log('OPTIONS:', options);
        // options
        this.parentId = parentId;
        this.uniqueKeyIdentifier = uniqueKeyIdentifier;
        this.whiteList = whiteList;

        // data
        this.rawData = data;

        this.preparedData = [];
        this.uniqueMapping = {};

        // dom objects - parents
        this.parent = null;
        this.tHead = null;
        this.tBody = null;
        this.footer = null;

        // template strings
        this.headerTemplateStr = headerTemplateStr;

        this.tableTemplateStr = tableTemplateStr;

        this.rowTemplateStr = '';

        // todo
        // tbody row template
        this.rowTemplateStr = createRowTemplateString({
            fieldKeys: this.whiteList,
            columnClickCbName: columnClickCbName,
            rowIdKey: uniqueKeyIdentifier
        });

        // template options
        this.tableTemplateOptions = {
            className: 'wb-data-table',
            tableWrapClass: 'wb-table-wrap',
            footerClass: 'wb-table-footer',
            toolbarClass: 'wb-table-events-toolbar'
        };

        this.fieldDef = {
            data: fieldDef
        };

        // event mapping - contextMenu, bodyClick, header
        this.eventMapping = eventMapping || {
            contextMenu: {},
            bodyClick: {},
            header: {}
        };

        //
        this.paginationOnChangeCallback = paginationOnChangeCallback;

        // fixed table header options
        this.fixedTableHeader = fixedTableHeader;


        this.renderTable();
        // this.renderPagination();
    }

    /**
     * Set dom parents
     * Render data table layout from template
     * Render table header from white list (array of column keys)
     * Attach events to parents
     */
    renderTable = () => {

        this.parent = document.getElementById(this.parentId);

        this.parent.innerHTML = Mustache.render(
            this.tableTemplateStr,
            this.tableTemplateOptions
        );

        this.tHead = this.parent.querySelector('thead');
        this.tBody = this.parent.querySelector('tbody');

        this.toolbar = this.parent.querySelector(`.${this.tableTemplateOptions.toolbarClass}`);
        this.footer = this.parent.querySelector(`.${this.tableTemplateOptions.footerClass}`);

        this.renderHeader();

        this.renderPagination();

        this.addEvents();
    };

    renderHeader = () => {
        this.tHead.innerHTML = Mustache.render(this.headerTemplateStr, this.fieldDef);
    };


    renderBodyData = () => {
        let tableData;

        if (!this.paginationOnChangeCallback) {
            let pag = this.pagination.getPage();

            tableData = {
                data: this.preparedData.data.slice(pag.firstIndex, pag.lastIndex)
            };

        } else {
            tableData = this.preparedData;
        }

        this.tBody.innerHTML = Mustache.render(this.rowTemplateStr, tableData);
    };


    renderToolbar = () => {
    };

    renderFooter = () => {
    };

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
     * @param shouldRerender
     */
    setBodyData = (tableData, shouldRerender = false) => {
        // nmbr per page, page
        // stranicu na backend
        const {recordsTotal, recordsFiltered, data} = tableData;

        let self = this;

        this.recordsTotal = recordsTotal || data.length;
        // this.recordsFiltered = recordsFiltered;
        // todo update pagination
        this.updatePagination();

        this.rawData = [];
        // this.rawData = data.slice(0);

        data.slice(0).forEach((item, ix) => {
            let rowId = this[self.uniqueKeyIdentifier];
            item.index = ix;

            self.rawData[self.rawData.length] = item;
            self.uniqueMapping[`${rowId}`] = ix;
        });

        this.preparedData = {
            "data": this.rawData,
            /*  "index": function () {
                  let rowId = this[self.uniqueKeyIdentifier];

                  self.uniqueMapping[`${rowId}`] = self.mustacheIx;

                  return self.mustacheIx++;
              },*/
            // "id": () => {
            //     return this.mustacheIx;
            // }
        };

        if (shouldRerender === true) {
            this.renderBodyData();
        }

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

        if (fn && fn instanceof Function) {
            fn.call(this, props);
        }
    };

    /**
     * Add basic table events
     * All events are delegated (set to event group parent)
     * Basic Event groups:
     *   header click - TODO attach sort
     *      handles 3 column clicks, will set data attribute data-sort-dir to  0 | 1 | 2
     *
     *   body (row column) click - identified by column clickCb data attribute TODO the click event identifier is set on column.. set to row?
     *   body context menu - identified by contextCb data attribute
     */
    addEvents = () => {
// TODO some checks will be needed, we assume that the right click was on the <td> element - currently there are no nested elements sso  no problems...

        // Table header click event
        this.tHead.addEventListener('click', (e) => {

            let headerCell = e.target.closest('th');

            let {sortKey, sortDir, clickCb} = headerCell.dataset;

            let sortStates = ['', 'asc', 'desc'];

            let next = parseInt(sortDir || 0) + 1;

            let newDir = '';

            if (next >= sortStates.length) {
                next = 0;
                newDir = sortStates[0];
            } else {
                newDir = sortStates[next];
            }

            headerCell.dataset.sortDir = next;

            // handles 3 clicks per column - asc, desc, none
            this.handleTableEvent({
                eventGroup: 'header',
                fnName: `${clickCb}`,
                props: {
                    sortKey,
                    sortDir: newDir
                }
            });

        });

        // Table body click event
        this.tBody.addEventListener('click', (e) => {

            let {clickCb} = e.target.dataset;

            this.handleTableEvent({
                eventGroup: 'bodyClick',
                fnName: `${clickCb}`,
                props: this.getRowPropsFromEvent(e)
            });
        });

        // Table body context menu event
        // call context menu callback function indentified by contextCb data attribute
        this.tBody.addEventListener('contextmenu', (e) => {

            let {contextCb} = e.target.dataset;

            this.handleTableEvent({
                eventGroup: 'bodyClick',
                fnName: `${contextCb}`,
                props: this.getRowPropsFromEvent(e)
            });
        });

        // fixed table header - watch table parent scroll and translate thead for scrolltop
        if (this.fixedTableHeader === true) {
            document.querySelector(`${this.tableTemplateOptions.tableWrapClass}`)
                .addEventListener("scroll", function () {
                        // "translate(0," + this.scrollTop + "px)";

                    this.querySelector('thead').style.transform = `translate(0,${this.scrollTop}px`;
                });
        }

    };

    // TODO refactor dom representation - move to filters ?
    // ajax pagination, local pagination
    // {firstIndex: 50, lastIndex: 100, currentPage: 2, itemsPerPage: 50, pageCnt: 391}
    renderPagination = () => {

        let self = this;

        let conf = {
            itemsCnt: this.recordsTotal,
            itemsPerPage: 15,
            chartKey: 'offset',
            parent: this.footer,

            showItemsPerPage: true,
            itemsPerPageParent: this.toolbar,
            itemsPerPageKey: 'limit',
            callback: function (name, val) {
                console.log('page', name, val);
                // default callback - local pagination
                self.renderBodyData();
            },
            itemsPerPageOnChange: function (name, val) {
                console.log('SET LIMIT', name, val);
                self.renderBodyData();
            }
        };

        if (this.paginationOnChangeCallback instanceof Function) {

            // go to next/previous page (offset)
            conf.callback = (name, page) => {
                console.log('page', page);
                this.paginationOnChangeCallback(name, page.firstIndex);
            };

            // items per page changed (limit)
            conf.itemsPerPageOnChange = (name, itemsPerPage) => {
                this.paginationOnChangeCallback(name, itemsPerPage);
            };
        }


        this.pagination = Pagination(conf);
    };

    updatePagination = (itemsCnt) => {
        this.pagination.setOptions({
            itemsCnt: itemsCnt || this.recordsTotal
            //    currentPage: 1
        })
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
    updateBodyRow = () => {
    };

}
