import WbDataTable from '../../datatable';
import {TABLE_ROWS_PER_PAGE} from '../../../config';
import {timestampColumnRenderer} from "../../../templates.utils";
import DashboardFilter from "../../filter/dashboard.filter";
import WbRenderTextInputField from "../../templates/form.field.text-input";
import {selectizeFormDropDown} from "../../selectize";


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


    /* TODO add to lib
`<div>
<a class='btn btn-xs btn-primary' href='/export/csv' target='_blank' id='export-features-csv'>
CSV <i class='fa fa-download'></i>
</a>
<a class='btn btn-xs btn-primary' href='/export/shp' target='_blank' id='export-features-shp'>
SHP <i class='fa fa-download'></i>
</a>
<a class='btn btn-xs btn-primary' href='/export/xlsx' target='_blank' id='export-features-xlsx'>
XLSX <i class='fa fa-download'></i>
</a>
</div>`
* */
    const exportButtons = `<div id="">
            <a class='btn btn-xs btn-primary' href='/export/csv' target='_blank' id='export-features-csv'>
                CSV <i class='fa fa-download'></i>
            </a>
            <a class='btn btn-xs btn-primary' href='/export/shp' target='_blank' id='export-features-shp'>
                SHP <i class='fa fa-download'></i>
            </a>
            <a class='btn btn-xs btn-primary' href='/export/xlsx' target='_blank' id='export-features-xlsx'>
                XLSX <i class='fa fa-download'></i>
            </a>
        </div>`;

    // document.querySelector('div.wb-export-toolbar').addEventListener('click', function (evt) {
    //     // evt.preventDefault();
    //
    //     var base_url = '';
    //     if (evt.target.id === 'export-features-csv') {
    //         base_url = '/export/csv?';
    //     } else if (evt.target.id === 'export-features-shp') {
    //         base_url = '/export/shp?';
    //     } else if (evt.target.id === 'export-features-xlsx') {
    //         base_url = '/export/xlsx?';
    //     } else {
    //         throw new Error("Unknown target id for export button: " + evt.target.id);
    //     }
    //
    //     // append current table search to the url
    //
    //     evt.target.href = base_url + encodeURI('search=' + ReportsTableInstance.reportTable.search());
    //
    // });
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

    // ** FILTERS

    // zone, woreda, tabiya. kushet
    let filterKeys = ['zone', 'woreda', 'tabiya', 'kushet'];
    let filterDefinitions = [];
    let fieldDefinitions = [];

    filterKeys.forEach((i) => {
        // FILTER DEFINITIONS
        filterDefinitions[filterDefinitions.length] = {
            dataKey: `${i}`,
            filterKey: `${i}`
        };


        // FIELD DEFINITIONS
        fieldDefinitions[fieldDefinitions.length] = {
            key: `${i}`,
            label: `${i}`,
            inputAttributes: [{
                attrName: 'wb-selectize',
                attrValue: 'field-for-selectize'
            }]
        }
    });


    module.Filter = new DashboardFilter(filterDefinitions);


    function selectizeOnSelectCallBack(name, value) {
        module.Filter.addToFilter(name, value);
    }

    function selectizeOnUnSelectCallBack(name, value) {
        module.Filter.addToFilter(name, value);
    }

    // CREATE AND APPEND FILTERS TO PARENT
    let filterParent = document.getElementById('table-reports-filter-wrap');

    fieldDefinitions.forEach((field) => {
        filterParent.appendChild(
            WbRenderTextInputField(field)
        );

    });

    // GET AND SELECTIZE FILTER DROPDOWNS
    let fieldsToBeSelectized = filterParent.querySelectorAll('[data-wb-selectize="field-for-selectize"]');


    _.forEach(fieldsToBeSelectized, (field) => {

        selectizeFormDropDown(
            field,
            {
                onSelectCallBack: selectizeOnSelectCallBack,
                onUnSelectCallBack: selectizeOnUnSelectCallBack,
                isMultiSelectEnabled: true
            }
        );
    });


    function getReportTableFilterArg () {

        const activeFilters = _.reduce(module.Filter.getActiveFilters(), function (acc, val) {
            acc[val.filterKey] = val.state;
            return acc;
        }, {});

        return {
            filters: activeFilters,
            // tablica text search
        };
    }

    module.getReportTableFilterArg = getReportTableFilterArg;
    module.ReportsTableInstance = ReportsTableInstance;
    return module;
}
