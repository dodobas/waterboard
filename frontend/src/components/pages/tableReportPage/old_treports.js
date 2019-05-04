import WbDataTable from '../../datatable';
import {TABLE_ROWS_PER_PAGE} from '../../../config';
import {timestampColumnRenderer} from "../../../templates.utils";




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

export default function initTableReportsChangeset(reportTableDataAttributes, changeset_id) {
var dynamicColumns = reportTableDataAttributes.map(function (attribute) {
            return {
                data: attribute.key,
                title: '<div>' + attribute.label + '</div>',
                searchable: attribute.searchable,
                orderable: attribute.orderable
            };
        });

        var staticColumns = [{
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

        var TABLE_REPORT_COLUMNS = dynamicColumns.concat(staticColumns);

        var options = {
            dataTable: {
                "dom": 'l<"wb-export-toolbar">frtip',
                scrollX: true,
                fixedHeader: true,
                columns: TABLE_REPORT_COLUMNS,
                order: [[TABLE_REPORT_COLUMNS.length - 2, 'desc']],
                lengthMenu: TABLE_ROWS_PER_PAGE,
                rowClickCb: tableRowClickHandlerFn,
                serverSide: true,
                // this is only throttling and not debouncing, for debouncing we need to fully control search input events
                searchDelay: 400,
                ajax: {
                    url: '/table-data',
                    type: 'POST',
                    data: {
                        "changeset_id": changeset_id
                    }
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

    module.ReportsTableInstance = ReportsTableInstance;
    return module;
}
