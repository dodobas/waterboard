import WbDataTable from '../../datatable';
import {TABLE_ROWS_PER_PAGE} from '../../../config';
import {
    timestampColumnRenderer
} from "../../../templates.utils";
import DashboardFilter from "../../filter/dashboard.filter";
// import {FilterHandler} from "../../filter/dashboard.filter";
import TableEvents from "../../datatable/wb.datatable";

import API from '../../../api/api'

import DomFieldRenderer from "../../ui/DomFieldRenderer";
import createNumberPerPageDropdown from "../../ui/NumberPerPageDropdown";
import {renderButtonGroup} from "../../buttonGroup";
import {TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE} from "../../datatable/templates/templates";

const TABLE_REPORT_COLUMNS = [{
    data: '_last_update',
    title: 'Last Update',
    searchable: false,
    render: timestampColumnRenderer,
    orderable: true
}, {
    data: '_webuser',
    title: 'User',
    searchable: false,
    orderable: true
}];

const TREPORT_COLUMNS = [{
    key: '_last_update',
    label: 'Last Update',
    searchable: false,
    render: timestampColumnRenderer,
    orderable: true
}, {
    key: '_webuser',
    label: 'User',
    searchable: false,
    orderable: true
}];

const EXPORT_BUTTONS = [{
    url: '/export/csv',
    iconClass: 'fa-download',
    label: 'CSV'
}, {
    url: '/export/shp',
    iconClass: 'fa-download',
    label: 'SHP'
}, {
    url: '/export/xlsx',
    iconClass: 'fa-download',
    label: 'XLSX'
}];


/**
 * Table row click callback used on dashboards and table reports page
 *
 * Opens feature by uuid page based on clicked row UUID
 */
export function tableRowClickHandlerFn({feature_uuid}) {
    if (!feature_uuid) {
        throw new Error('No Row UUID found');
    }

    const win = window.open(`/feature-by-uuid/${feature_uuid}/`, '_blank');

    win.focus();
}

export default function initTableReports({columnDefinitions, module}) {

    const DYNAMIC_COLUMNS = columnDefinitions.map(({key, label, searchable, orderable}) => {
        return {
            data: key,
            title: label,
            searchable,
            orderable
        };
    });

    const TATBLE_EVENTS_COLUMNS = [...columnDefinitions, ...TREPORT_COLUMNS].slice(0);

    const options = {
        dataTable: {
            "dom": 'l<"wb-export-toolbar">frtip',
            scrollX: true,
            fixedHeader: true,
            columns: [...DYNAMIC_COLUMNS, ...TABLE_REPORT_COLUMNS],
            order: [[0, 'desc']],
            lengthMenu: TABLE_ROWS_PER_PAGE,
            rowClickCb: tableRowClickHandlerFn,
            serverSide: true,
            // this is only throttling and not debouncing, for debouncing we need to fully control search input events
            searchDelay: 400,
            ajax: {
                url: '/table-data/',
                type: 'POST'
            }
        }
    };

    let ReportsTableInstance = new WbDataTable('reports-table', options);


    // DOWNLOAD BUTTONS
    renderButtonGroup({
        parentId: 'wb-table-events-toolbar',
        templateData: EXPORT_BUTTONS,
        templateStr: TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE,
        clickCb: function (e) {
            e.preventDefault();

            if (!e.target.href) {
                return;
            }
            // append current table search to the url
            let downloadUrl = `${e.target.href}/?${encodeURI('search=' + ReportsTableInstance.reportTable.search())}`;

            window.open(downloadUrl, '_blank');
        }
    });

    let filterDefinitions = [
        {
            "filterId": "zone",
            "filterKey": "zone"
        },
        {
            "filterId": "woreda",
            "filterKey": "woreda"
        },
        {
            "filterId": "tabiya",
            "filterKey": "tabiya"
        },
        {
            "filterId": "kushet",
            "filterKey": "kushet"


        }, {
            "filterId": "searchString",
            "filterKey": "searchString"

        }, {
            "filterId": "order",
            "filterKey": "order"
        },
        { // items per page
            "filterId": "limit",
            "filterKey": "limit"
        },
        { // page nmbr * items per page
            "filterId": "offset",
            "filterKey": "offset"
        },
        {
            "filterId": "currentPage",
            "filterKey": "currentPage"
        }];


// lengthMenu: TABLE_ROWS_PER_PAGE,

    // Showing 1 to 10 of 19,497 entries
    var sampaaleRequest = {
        "offset": 0, // page nmbr
        "limit": 25, // items per page
        "search": "a search string",
        "filter": [
            {"zone": ["central"]},
            {"woreda": ["ahferon", "adwa"]}
        ],
        "order": [
            {"zone": "asc"},
            {"fencing_exists": "desc"}
        ],
    };

    /**
     * Filter module on change event
     * Will be executed when a filter is set, removed or changed
     *
     * @param activeFilters
     * @private
     */
    function _reportFilterOnChange(activeFilters) {
        console.log('filter on change', activeFilters);
        console.log('filter on change this', this);
        // AJAX TABLE DATA CALL HERE WITH FILTER ARGS
    }

    // FILTER HANDLER
    module.Filter = new DashboardFilter(filterDefinitions, _reportFilterOnChange);


    // FILTERS DOM
    let selectizeFilterOptions = {
        onSelectCallBack: module.Filter.addToFilter,
        onUnSelectCallBack: module.Filter.removeFromFilter,
        isMultiSelectEnabled: true
    };


    let filterDomDefinitions = [{
        key: 'searchString',
        label: 'Text Search',
        onKeyPress: function (e) {
            module.Filter.setFilter('searchString', e.target.value);
        }
    }, {
        key: 'zone',
        label: 'Zone',
        isSelectized: true,
        selectizeOptions: selectizeFilterOptions
    }, {
        key: 'woreda',
        label: 'Woreda',
        isSelectized: true,
        selectizeOptions: selectizeFilterOptions
    }, {
        key: 'tabiya',
        label: 'Tabiya',
        isSelectized: true,
        selectizeOptions: selectizeFilterOptions
    }, {
        key: 'kushet',
        label: 'Kushet',
        isSelectized: true,
        selectizeOptions: selectizeFilterOptions
    },
        { // items per page
            "filterId": "limit",
            "filterKey": "limit"
        },
        { // page
            filterId: "offset",
            filterKey: "offset",

            // custom render function "filter dom component", must return an dom object
            renderFn: function (field) {
                return createNumberPerPageDropdown({
                    name: `${field.filterKey}`,
                    onChange: module.Filter.setFilter
                })

            }
        }
    ];

    module.FilterDomInstance = new DomFieldRenderer({
        fieldDefinitions: filterDomDefinitions,
    });


    function getReportTableFilterArg() {

        const activeFilters = _.reduce(module.Filter.getActiveFilters(), function (acc, val) {
            acc[val.filterKey] = val.state;
            return acc;
        }, {});

        return {
            "offset": 0, // page nmbr
            "limit": 25, // items per page
            "search": "a search string",
            "order": [
                {"zone": "asc"},
                {"fencing_exists": "desc"}
            ],
            filter: activeFilters
        };
    }


    // ====================== TABLE "

    let TABLE_EVENT_MAPPING = {
        // event_group_name: {function_name_used_for_mapping: () => {}}
        contextMenu: {
            sampleGeneric: function ({rowId, rowIndex, rowData}) {
                console.log('CONTEXTMENU CB fn', rowId, rowIndex, rowData);
                console.log(this);
            }
        },
        bodyClick: {
            openFeatureInNewTab: function ({rowId, rowIndex, rowData}) {
                console.log('ROW click CB fn', rowId, rowIndex, rowData);
                console.log(this);

                // open feature page in new tab
                tableRowClickHandlerFn(rowData);
            }
        },
        header: {
            columnClick: function ({sortKey, sortDir}) {
                console.log('HEADER ROW CLICK', sortKey, sortDir);
                console.log(this);
                console.log('Sort table data');

                // if sortDir is empty remove from filter
                if (!sortDir) {
                    console.log('REMOVE');
                } else {
                    console.log('ADD');
                    module.Filter.addToFilter('sort', sortKey, sortDir)
                }
            }
        }
    };
    let whiteList = TATBLE_EVENTS_COLUMNS.map((col) => col.key);

    // TODO column position, use whitelisting or black listing?...
    module.TableEvents = new TableEvents({
        parentId: 'wb-table-Events',
        fieldDef: TATBLE_EVENTS_COLUMNS,
        whiteList: whiteList,
        eventMapping: TABLE_EVENT_MAPPING
    });


    console.log('filterDefinitions', filterDefinitions);
    console.log('fieldDef', TATBLE_EVENTS_COLUMNS);
    console.log('whiteList', whiteList);


    module.getReportTableFilterArg = getReportTableFilterArg;


    module.ReportsTableInstance = ReportsTableInstance;

    API.axGetTableReportsData();
    return module;
}
