import {
    timestampColumnRenderer
} from "../../../templates.utils";
import WbFilter from "../../filter/wb.filter";
import TableEvents from "../../datatable/wb.datatable";

import API from '../../../api/api'

import DomFieldRenderer from "../../ui/DomFieldRenderer";
import createNumberPerPageDropdown from "../../ui/NumberPerPageDropdown";
import {renderButtonGroup} from "../../buttonGroup";
import {TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE} from "../../datatable/templates/templates";


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


export default function initTableReports({columnDefinitions, module}) {

    const TATBLE_EVENTS_COLUMNS = [...columnDefinitions, ...TREPORT_COLUMNS].slice(0);


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

            //TODO review

            // append current table search to the url
            let searchStr = WB.Filter.filters.searchString.state;
            let downloadUrl = `${e.target.href}/?${encodeURI('search=' + searchStr)}`;

            window.open(downloadUrl, '_blank');

        }
    });

    let filterDefinitions = [
        {
            "filterId": "zone",
            "filterKey": "zone",
            filterType: 'multiArr'
        },
        {
            "filterId": "woreda",
            "filterKey": "woreda",
            filterType: 'multiArr'
        },
        {
            "filterId": "tabiya",
            "filterKey": "tabiya",
            filterType: 'multiArr'
        },
        {
            "filterId": "kushet",
            "filterKey": "kushet",
            filterType: 'multiArr'


        }, {
            "filterId": "searchString",
            "filterKey": "searchString",
            filterType: 'single'

        }, {
            "filterId": "order",
            "filterKey": "order",
            filterType: 'multiObj'
        },
        { // items per page
            "filterId": "limit",
            "filterKey": "limit",
            filterType: 'single'
        },
        { // page nmbr * items per page
            "filterId": "offset",
            "filterKey": "offset",
            filterType: 'single'
        },
        {
            "filterId": "currentPage",
            "filterKey": "currentPage",
            filterType: 'single'
        }];


// lengthMenu: TABLE_ROWS_PER_PAGE,

    // Showing 1 to 10 of 19,497 entries

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
        let filterState = getReportTableFilterArg();
        API.axFilterTableReportsData(JSON.stringify(filterState));
    }

    // FILTER HANDLER
    module.Filter = new WbFilter(filterDefinitions, _reportFilterOnChange);


    // FILTERS DOM
    let selectizeFilterOptions = {
        onSelectCallBack: module.Filter.addToFilter,
        onUnSelectCallBack: module.Filter.removeFromFilter,
        onClearCallback:  module.Filter.clearFilter,
        isMultiSelectEnabled: true
    };


    let filterDomDefinitions = [
        {
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
            label: 'Limit',
            key: 'limit',
            "filterId": "limit",
            "filterKey": "limit",
            onKeyPress: function (e) {
                module.Filter.setFilter('limit', e.target.value);
            }
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


    // TODO refactor
    function getReportTableFilterArg() {

        let filt = WB.Filter.filters;

        let filtersOnly = _.reduce(filt, (acc, val, ix) => {

            if (['limit', 'offset', 'order', 'currentPage', 'searchString'].indexOf(ix) === -1) {
                // TODO do not include empty
                if (val.state.length > 0) {
                    acc[acc.length] = {[ix]: val.state};
                }
            }
            return acc;
        }, []);

        return {
            "offset": (filt.offset.state || [])[0] || 0, // page nmbr
            "limit": 25, // items per page
            "search": filt.searchString.state || '',
            "order": filt.order.state || [],
            filter: filtersOnly
        };
    }


    // ====================== TABLE "

    let TABLE_EVENT_MAPPING = {
        contextMenu: {
            sampleGeneric: function ({rowId, rowIndex, rowData}) {
                console.log('CONTEXTMENU CB fn', rowId, rowIndex, rowData);
                console.log(this);
            }
        },
        bodyClick: {
            openFeatureInNewTab: function ({rowId, rowIndex, rowData}) {
                console.log('clicked');
                // open feature page in new tab
                const {feature_uuid} = rowData;

                const win = window.open(`/feature-by-uuid/${feature_uuid}/`, '_blank');

                win.focus();
            }
        },
        header: {
            columnClick: function ({sortKey, sortDir}) {

                let obj = {
                    [sortKey]: sortDir
                };
                // if sortDir is empty remove from filter
                if (!sortDir) {
                    console.log('REMOVE');
                    module.Filter.removeFromFilter('order', obj)
                } else {
                    console.log('ADD');
                    module.Filter.addToFilter('order', obj)
                }
            }
        }
    };

    module.TableEvents = new TableEvents({
        parentId: 'wb-table-Events',
        fieldDef: TATBLE_EVENTS_COLUMNS,
        whiteList: TATBLE_EVENTS_COLUMNS.map((col) => col.key),
        eventMapping: TABLE_EVENT_MAPPING
    });

    module.getReportTableFilterArg = getReportTableFilterArg;

    let initialFilterState = getReportTableFilterArg();
    API.axFilterTableReportsData(JSON.stringify(initialFilterState));


    return module;
}
