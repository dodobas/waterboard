import WbDataTable from '../../datatable';
import {timestampColumnRenderer} from '../../../utils';
import {TABLE_ROWS_PER_PAGE} from '../../pages/config';


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

export default function initTableReports(reportTableDataAttributes) {

    const DYNAMIC_COLUMNS = reportTableDataAttributes.map(({key, label, searchable, orderable}) => {
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

    return new WbDataTable('reports-table', options);
}
