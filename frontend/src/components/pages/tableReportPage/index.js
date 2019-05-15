import {
    timestampColumnRenderer
} from "../../../templates.utils";
import WbFilter from "../../filter/wb.filter";
import TableEvents from "../../datatable/wb.datatable";

import API from '../../../api/api'

import DomFieldRenderer from "../../ui/DomFieldRenderer";
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

    const TATBLE_EVENTS_COLUMNS = columnDefinitions.slice(0);
    // const TATBLE_EVENTS_COLUMNS = [...columnDefinitions, ...TREPORT_COLUMNS].slice(0);

    let filterDefinitions = [
        {
            filterKey: 'zone',
            filterType: 'multiArr'
        },
        {
            filterKey: 'woreda',
            filterType: 'multiArr'
        },
        {
            filterKey: 'tabiya',
            filterType: 'multiArr'
        },
        {
            filterKey: 'kushet',
            filterType: 'multiArr'

        }, {
            filterKey: 'searchString',
            filterType: 'single'

        }, { // set on header row click
            filterKey: 'order',
            filterType: 'multiObj'
        },
        { // handled from datatable pagination
            filterKey: 'limit',
            filterType: 'single'
        },
        {
            filterKey: 'offset',
            filterType: 'single'
        }];

    // Showing 1 to 10 of 19,497 entries

    // FILTER state HANDLER
    module.Filter = new WbFilter({
        config: filterDefinitions,
        onChange: function (activeFilters) {
            let filterState = getReportTableFilterArg();
            API.axFilterTableReportsData(JSON.stringify(filterState));
        }
    });


    // FILTER DOM REPRESENTATION
    // dom filters are not directly bound to filter state
    // there's no direct two way data binding between dom filters and filter state
    // dom filters have their own state (input, dropdown, custom...)
    // dom filter state is provided using events

    let selectizeFilterOptions = {
        onSelectCallBack: function (filterName, filterValue) {
            module.Filter.addToFilter(filterName, filterValue, false);
            module.Filter.setFilter(`offset`, 0, false);

            module.TableEvents.updatePagination({
                currentPage: 1
            });

             module.Filter.handleFilterOnChange();
            // reset pagination
        },
        // onUnSelectCallBack: module.Filter.removeFromFilter,
        onUnSelectCallBack: function (filterName, filterValue) {
            module.Filter.removeFromFilter(filterName, filterValue, false);
            module.Filter.setFilter(`offset`, 0, false);

            module.TableEvents.updatePagination({
                currentPage: 1
            });

             module.Filter.handleFilterOnChange();
            // reset pagination
        },
        onClearCallback: function (filterName) {
            module.Filter.clearFilter(filterName, false);
            module.Filter.setFilter(`offset`, 0, false);

            module.TableEvents.updatePagination({
                currentPage: 1
            });

             module.Filter.handleFilterOnChange();
            // reset pagination
        },
        // onClearCallback: module.Filter.clearFilter,
        isMultiSelectEnabled: true
    };
    // ['zone', 'woreda', 'tabiya', 'kushet']
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

        }
    ];

    module.FilterDomInstance = new DomFieldRenderer({
        fieldDefinitions: filterDomDefinitions,
    });


    // TODO refactor
    /**
     * Serialize datatable filter state
     *
     * Prepare table reports api endpoint payload from filter state
     * @returns {{filter: *, search: (*|string), offset: (*|number), limit: number, order: (*|Array)}}
     */
    function getReportTableFilterArg() {

        let filt = module.Filter.filters;

        let filtersOnly = _.reduce(filt, (acc, val, ix) => {

            if (['limit', 'offset', 'order', 'currentPage', 'searchString'].indexOf(ix) === -1) {
                // TODO do not include empty
                if (val.state.length > 0) {
                    acc[acc.length] = {[ix]: val.state};
                }
            }
            return acc;
        }, []);


        let order = _.map(filt.order.state, (key, val) => {
            return {
                name: key,
                value: val
            }
        });

        return {
            offset: filt.offset.state || 0,
            limit: filt.limit.state || 25,
            search: filt.searchString.state || '',
            order: order,
            filter: filtersOnly
        };
    }

    // datatable events callback functions
    let TABLE_EVENT_MAPPING = {
        contextMenu: {},
        bodyClick: {
            openFeatureInNewTab: function ({rowData}) {
                const {feature_uuid} = rowData;

                const win = window.open(`/feature-by-uuid/${feature_uuid}/`, '_blank');

                win.focus();
            }
        },
        header: {
            // handle sort on table header cell click
            // set "order" filter
            onHeaderCellClick: function ({sortKey, sortDir}) {
                let obj = {
                    name: sortKey,
                    value: sortDir
                };
                if (!sortDir) {
                    module.Filter.removeFromFilter('order', obj)
                } else {
                    module.Filter.addToFilter('order', obj)
                }
            }
        }
    };


    module.TableEvents = new TableEvents({
        parentId: 'wb-table-Events',
        uniqueKeyIdentifier: 'feature_uuid',


        fieldDef: TATBLE_EVENTS_COLUMNS,
        whiteList: TATBLE_EVENTS_COLUMNS.map((col) => col.key),
        eventMapping: TABLE_EVENT_MAPPING,

        fixedTableHeader: true,
        columnClickCbName: 'openFeatureInNewTab',

        dataHandledByClient: false,
        paginationConf: {
            itemsPerPage: 15,
            chartKey: 'offset',
            showItemsPerPage: true,
            itemsPerPageKey: 'limit',
        },

        // callback when pagination page changes (next or previous) or number per page changes
        // set limit or offset
        paginationOnChangeCallback: function (name, val) {
            module.Filter.setFilter(`${name}`, val);
        }
    });

    /**
     * Render datatable download buttons and handle datatable data download
     * Append search string and filter states to GET params on download
     * Pagination and sort filters are not used for download
     */
    renderButtonGroup({
        parentSelector: '.wb-table-events-toolbar',
        templateData: EXPORT_BUTTONS,
        templateStr: TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE,
        clickCb: function (e) {
            e.preventDefault();

            if (!e.target.href) {
                return;
            }

            let searchStr = module.Filter.filters.searchString.state;

            // TODO do we need encoding for filters?
            // "&zone=Eastern,&zone=North-Western&woreda=Hawzen"
            // http://127.0.0.1:8008/export/csv/?search=&zone=North-Western,&zone=Central&woreda=Ahferom
            let filtersGetStr = ['zone', 'woreda', 'tabiya', 'kushet'].reduce((acc, filterKey) => {
                var f = module.Filter.filters[filterKey];

                if (f.state && f.state.length > 0) {
                    acc += `&${filterKey}=` + (f.state.join(`&${filterKey}=`));
                }
                return acc;
            }, '');

            let downloadUrl = `${e.target.href}/?${encodeURI('search=' + searchStr)}${filtersGetStr}`;

            window.open(downloadUrl, '_blank');

        }
    });


    module.getReportTableFilterArg = getReportTableFilterArg;

    let initialFilterState = getReportTableFilterArg();
    API.axFilterTableReportsData(JSON.stringify(initialFilterState));


    return module;
}
