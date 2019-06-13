import {
    timestampColumnRenderer
} from "../../../templates.utils";
import WbFilter from "../../filter/wb.filter";
import TableEvents from "../../datatable/wb.datatable";

import API from '../../../api/api'

import DomFieldRenderer from "../../ui/DomFieldRenderer";
import {renderButtonGroup} from "../../buttonGroup";
import {TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE} from "../../datatable/templates/templates";

// TODO should be removed?
const TREPORT_COLUMNS = [{
    key: 'ts',
    label: 'Last Update',
    searchable: false,
    render: timestampColumnRenderer,
    orderable: true
}, {
    key: 'email',
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
}, {
    url: '/export/kml',
    iconClass: 'fa-download',
    label: 'KML'
}];


export default function initTableReports({columnDefinitions, module, changeset_id}) {

    const TABLE_EVENTS_COLUMNS = [...columnDefinitions, ...TREPORT_COLUMNS].slice(0);

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
        },
        {
            filterKey: 'changeset_id',
            filterType: 'single'
        },
    ];

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

            module.TableEvents.updatePagination({
                currentPage: 1
            });

            module.Filter.addToFilter(filterName, filterValue, false);
            module.Filter.setFilter(`offset`, 0, false);
            module.Filter.handleFilterOnChange();

        },
        // onUnSelectCallBack: module.Filter.removeFromFilter,
        onUnSelectCallBack: function (filterName, filterValue) {

            module.TableEvents.updatePagination({
                currentPage: 1
            });

            module.Filter.removeFromFilter(filterName, filterValue, false);
            module.Filter.setFilter(`offset`, 0, false);
            module.Filter.handleFilterOnChange();

        },
        onClearCallback: function (filterName) {

            module.TableEvents.updatePagination({
                currentPage: 1
            });

            module.Filter.clearFilter(filterName, false);
            module.Filter.setFilter(`offset`, 0, false);
            module.Filter.handleFilterOnChange();

        },
        isMultiSelectEnabled: true
    };
    // ['zone', 'woreda', 'tabiya', 'kushet']
    let filterDomDefinitions = [
        {
            key: 'searchString',
            label: 'Text Search',
            onKeyUp: function (e) {
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

        let _areNotDataFilters = ['limit', 'offset', 'order', 'currentPage', 'searchString'];

        let filtersOnly = _.reduce(filt, (acc, f, ix) => {
            if (_areNotDataFilters.indexOf(ix) === -1) {
                if (!f.isEmpty()) {
                    acc[acc.length] = {[ix]: f.get()};
                }
            }
            return acc;
        }, []);


        let order = _.map(module.Filter.getFilterByName('order').get(), (key, val) => {
            return {
                name: key,
                value: val
            }
        });

        return {
            offset: filt.offset.state || 0,
            limit: filt.limit.state || 10,
            search: filt.searchString.state || '',
            order: order,
            filter: filtersOnly,
            changeset_id: changeset_id
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


        fieldDef: TABLE_EVENTS_COLUMNS,
        whiteList: TABLE_EVENTS_COLUMNS.map((col) => col.key),
        eventMapping: TABLE_EVENT_MAPPING,

        fixedTableHeader: true,
        columnClickCbName: 'openFeatureInNewTab',

        dataHandledByClient: false,
        paginationConf: {
            itemsPerPage: 10,
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


    // TODO do we need encoding for filters?
    /**
     * Prepare get params from filter states for table report data
     * @returns {string} ?search=&zone=North-Western,&zone=Central&woreda=Ahferom
     */
    function prepareTableReportDownloadGetParamsFromFilters() {
        let searchStr = module.Filter.getFilterByName('searchString').get();

        let filtersGetStr = ['zone', 'woreda', 'tabiya', 'kushet'].reduce((acc, filterKey) => {
            let _filter = module.Filter.getFilterByName(filterKey);

            if (_filter && !_filter.isEmpty()) {
                acc += `&${filterKey}=` + (_filter.get().join(`&${filterKey}=`));
            }
            return acc;
        }, '');

        return `?${encodeURI('search=' + searchStr)}${filtersGetStr}`;
    }

    /**
     * Render datatable download buttons and handle datatable data download
     * Append search string and stringified filter states to GET params on download
     * Pagination and sort filters are not used for download
     */
    renderButtonGroup({
        parentSelector: '.wb-table-events-toolbar',
        templateData: EXPORT_BUTTONS,
        templateStr: TABLE_REPORT_EXPORT_BUTTONS_TEMPLATE,
        clickCb: function (e) {
            e.preventDefault();

            if (e.target.href) {
                let downloadUrl = `${e.target.href}/?${prepareTableReportDownloadGetParamsFromFilters()}`;

                window.open(downloadUrl, '_blank');
            }
        }
    });


    module.getReportTableFilterArg = getReportTableFilterArg;

    let initialFilterState = getReportTableFilterArg();
    API.axFilterTableReportsData(JSON.stringify(initialFilterState));

    /**
     * TODO move to datable
     * Calculate and set available table size inside parent wrap ("fill available space")
     * Take in account filter wrap size / action button sizes
     *
     */
    function adjustTableHeightToParent () {
        let _wrap = document.getElementById('content');
        let _wrapSize = _wrap.getBoundingClientRect();

        let _filtersWrap = document.getElementById('table-reports-filter-wrap');
        let _filtersWrapSize = _filtersWrap.getBoundingClientRect();


        let _newTableHeight= _wrapSize.height - _filtersWrapSize.height - 185;

        let _tableWrap = document.querySelectorAll('.wb-table-wrap')[0];

        _tableWrap.style.height = _newTableHeight + 'px';

    }
    adjustTableHeightToParent();
    window.addEventListener('resize', _.debounce(adjustTableHeightToParent, 200));

    return module;
}
