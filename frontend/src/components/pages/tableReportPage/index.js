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

    // zone, woreda, tabiya. kushet
    let filterDefinitions = [
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
    // const filters = new DashboardFilter(filterDefinitions);
    let filterParent = document.getElementById('table-reports-filter-wrap');
    filterDefinitions.forEach((field) => {

        field.key = field.dataKey;
        field.label = field.dataKey;

        field.inputAttributes = [{
            attrName: 'wb-selectize',
            attrValue: 'field-for-selectize'
        }];
        let filter = WbRenderTextInputField(field);
        filterParent.appendChild(filter);

    });
    let fieldsToBeSelectized = filterParent.querySelectorAll('[data-wb-selectize="field-for-selectize"]');

    _.forEach(fieldsToBeSelectized, (field) => {
        selectizeFormDropDown(field);
    });
    module.Filter = new DashboardFilter(filterDefinitions);
    module.ReportsTableInstance = ReportsTableInstance;
    return module;
}
