import WbDataTable from '../../datatable';
import {TABLE_ROWS_PER_PAGE} from '../../../config';
import {timestampColumnRenderer} from "../../../templates.utils";
import DashboardFilter from "../../filter/dashboard.filter";
import WbRenderTextInputField from "../../templates/form.field.text-input";
import {selectizeFormDropDown} from "../../selectize";
import TableEvents from "../../datatable/wb.datatable";

import API from '../../../api/api'
import * as Mustache from "mustache";

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

    let exportBtnTemplate = `<div>{{#data}}
      <a class='btn btn-xs btn-primary' href="{{& urla}}" target='_blank' id='{{id}}'>
                {{label}} <i class='fa {{iconClass}}'></i>
            </a>
    {{/data}}</div>`;

    var downloadButtons = [{
        urla: '/export/csv',
        iconClass: 'fa-download',
        id: 'export-features-csv',
        label: 'CSV'
    },{
        urla: '/export/shp',
        iconClass: 'fa-download',
        id: 'export-features-shp',
        label: 'SHP'
    },{
        urla: '/export/xlsx',
        iconClass: 'fa-download',
        id: 'export-features-xlsx',
        label: 'XLSX'
    }];
    //window.knek = Mustache.render(exportBtnTemplate, {data: downloadButtons});
    const exportButtons = Mustache.render(exportBtnTemplate, {data: downloadButtons});


    $("div.wb-export-toolbar").html(exportButtons).on('click', function (evt) {
        // evt.preventDefault();

        var base_url = '';
        if (evt.target.id === 'export-features-csv') {
            base_url = '/export/csv?';
        } else if (evt.target.id === 'export-features-shp') {
            base_url = '/export/shp?';
        } else if (evt.target.id === 'export-features-xlsx') {
            base_url = '/export/xlsx?';
        } else {
            throw new Error("Unknown target id for export button: " + evt.target.id);
        }

        // append current table search to the url

        evt.target.href = base_url + encodeURI('search=' + ReportsTableInstance.reportTable.search());

    });

    // ** FILTERS TODO refactor - code styling and stuff
    // stanje filtera, od paginacije current page, searc String

    // pripremi konfu za filtere
    // pripremi konfu za tablicu


    let fieldDefinitions = [{
        key: 'searchString',
        label: 'Text Search',
        onKeyPress: function (e) {
            module.Filter.setFilter('searchString', e.target.value);
        }
    }, {
        key: 'zone',
        label: 'Zone',
        inputAttributes: [{
            attrName: 'wb-selectize',
            attrValue: 'field-for-selectize'
        }]
    }, {
        key: 'woreda',
        label: 'Woreda',
        inputAttributes: [{
            attrName: 'wb-selectize',
            attrValue: 'field-for-selectize'
        }]
    }, {
        key: 'tabiya',
        label: 'Tabiya',
        inputAttributes: [{
            attrName: 'wb-selectize',
            attrValue: 'field-for-selectize'
        }]
    }, {
        key: 'kushet',
        label: 'Kushet',
        inputAttributes: [{
            attrName: 'wb-selectize',
            attrValue: 'field-for-selectize'
        }]
    }
    ];


    let filterDefinitions = [
        {
            "dataKey": "searchString",
            "filterKey": "searchString"
        },
        {
            "dataKey": "currentPage",
            "filterKey": "currentPage"
        },
        {
            "dataKey": "zone",
            "filterKey": "zone"
        },
        {
            "dataKey": "woreda",
            "filterKey": "woreda"
        },
        {
            "dataKey": "tabiya",
            "filterKey": "tabiya"
        },
        {
            "dataKey": "kushet",
            "filterKey": "kushet"
        }
    ];

    function _reportFilterOnChange(activeFilters) {
        console.log('filter on change', activeFilters);
        console.log('filter on change this', this);
        // AJAX TABLE DATA CALL HERE WITH FILTER ARGS
    }

    module.Filter = new DashboardFilter(filterDefinitions, _reportFilterOnChange);



    // CREATE AND APPEND FILTERS TO PARENT
    let filterParent = document.getElementById('table-reports-filter-wrap');

    fieldDefinitions.forEach((field) => {
        filterParent.appendChild(
            WbRenderTextInputField(field)
        );

    });

    let selectizedFilterOptions = {
        onSelectCallBack: (name, value) => {
            module.Filter.addToFilter(name, value);
            // TODO refresh data
        },
        onUnSelectCallBack: (name, value) => {
            module.Filter.removeFromFilter(name, value);
            // TODO refresh data
        },
        isMultiSelectEnabled: true
    };

    // GET AND SELECTIZE FILTER DROPDOWNS
    let fieldsToBeSelectized = filterParent.querySelectorAll('[data-wb-selectize="field-for-selectize"]');

    _.forEach(fieldsToBeSelectized, (field) => {

        selectizeFormDropDown(
            field,
            selectizedFilterOptions
        );
    });


    function getReportTableFilterArg() {

        const activeFilters = _.reduce(module.Filter.getActiveFilters(), function (acc, val) {
            acc[val.filterKey] = val.state;
            return acc;
        }, {});

        return {
            filters: activeFilters
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
            sampleGenericClick: function ({rowId, rowIndex, rowData}) {
                console.log('ROW click CB fn', rowId, rowIndex, rowData);
                console.log(this);

                // open feature page in new tab
                tableRowClickHandlerFn(rowData);
            }
        },
        header: {
            sampleGenericClick: function (a) {
                console.log('HEADER ROW CLICK', a);
                console.log(this);
                console.log('Sort table data');
            }
        }
    };
    let whiteList = TATBLE_EVENTS_COLUMNS.map((col) => col.key);


    console.log('filterDefinitions', filterDefinitions);
    console.log('fieldDef', TATBLE_EVENTS_COLUMNS);
    console.log('whiteList', whiteList);
    // TODO column position, use whitelisting or black listing?...
    module.TableEvents = new TableEvents({
        parentId: 'wb-table-Events',
        fieldDef: TATBLE_EVENTS_COLUMNS,
        whiteList: whiteList,
        eventMapping: TABLE_EVENT_MAPPING
    });

    module.getReportTableFilterArg = getReportTableFilterArg;
    module.ReportsTableInstance = ReportsTableInstance;

    API.axGetTableReportsData();
    return module;
}
