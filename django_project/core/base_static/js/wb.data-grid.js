/**
 * Sort, Text search and pagination handled on the backend.
 *
 * Client side requests data and renders
 *
 * User can Edit Row Data
 *
 * Requirements:
 *  Table
 *  Table header
 *  Table header column
 *  Table row
 *  Table column
 *  TAble column content types
 *
 */


/**
 * Every renderer function returns a dom object
 * @returns {{string: (function(*)), number: (function(*=): Text), latLng: (function(*)), timestamp: (function(*, *, *)), boolean: (function(*): Text)}}
 * @constructor
 */
const TableRowRenderers = function () {

    const renderString = (str) => {
        return document.createTextNode(`${str}`);
    };
    const renderNumber = (nmbr) => document.createTextNode(nmbr);
    const renderBoolean = (bool) => bool === true ? document.createTextNode('True') : document.createTextNode('False');

    const renderLatLng = (latLng) => renderString(`${latLng[0]}, ${latLng[1]}`);

    const renderTimestamp = (ts, inFormat, outFormat) => {
        // moment('2017-12-13T21:36:12.192Z').format('YYYY-MM-DD HH:mm:ss')
        return renderString('sample');
    };

    return {
        string: renderString,
        number: renderNumber,
        latLng: renderLatLng,
        timestamp: renderTimestamp,
        boolean: renderBoolean
    }
};

/**
 * Simple data view grid
 *
 * Sort, Pagination and filtering is backend based
 *
 * a = DataGrid(FIELD_DEFINITIONS)
 * a.renderHeader(FIELD_DEFINITIONS)
 * a.renderRow(TEST_DATA, FIELD_DEFINITIONS);
 *
 * @returns {{renderRows: renderRows, renderHeader: renderHeader}}
 * @constructor
 */
const DataGrid = function (columnDefinitions) {
    const rowIdPrefix = 'dg-id-';

    let gridData = {};

    const gridTable = document.getElementById('data-grid-table');
    const gridTableBody =  gridTable.tBodies[0];
    const gridTableMainHeader =  gridTable.tHead;
    const columnRenderer = TableRowRenderers();
    const idToRowMapping = {};

    const columnWhiteList = Object.keys(columnDefinitions || []);
    const columnsCnt = columnWhiteList.length;

    const renderHeader = function (columnDefinitions) {
        const trow = document.createElement('tr');

        let i = 0;
        let tcol;

        for (i; i < columnsCnt; i += 1) {
             tcol = document.createElement('th');

            columnDomObj = columnRenderer.string(columnDefinitions[columnWhiteList[i]].label);

            tcol.appendChild(columnDomObj);
            trow.appendChild(tcol);
        }

        gridTableMainHeader.appendChild(trow);

    };

    const renderRow = function () {

    }

    const renderRows = function (data) {
//  const table = document.getElementById('data-grid-table');
        // FIELD_DEFINITIONS
        gridData = data.slice(0);

        const dataCnt = (data || []).length;
        let i = 0;

        let tcol, columnDomObj,trow;

        for (i; i < dataCnt; i += 1) {

            trow = document.createElement('tr');

            trow.dataset.id = gridData[i].id;

            columnWhiteList.forEach(column => {
                tcol = document.createElement('td');

                columnDomObj = columnRenderer[columnDefinitions[column].renderType](gridData[i][column]);
                tcol.appendChild(columnDomObj);
                trow.appendChild(tcol);
            });

            gridTableBody.appendChild(trow);

            idToRowMapping[gridData[i].id] = trow.rowIndex;

            WB.utils.addEvent(trow, 'click', function(e) {
                e.preventDefault();

              //  console.log('rowdata', gridData[this.rowIndex - 1 ]);
            });
        }

    };

    const getRrowData = id => gridData[idToRowMapping[id]];


    const removeRows = function () {
        while(gridTableBody.hasChildNodes()) {
           gridTableBody.removeChild(gridTableBody.firstChild);
        }
    };

    const updateRow = function (id, newData) {
        // update data
        // replace row / rerender everything?
    }

    const getMapping = () => ixToIdMapping;

    return {
        renderRows: renderRows,
        renderHeader: renderHeader,
        removeRows: removeRows,
        updateRow: updateRow,
        getMapping: getMapping,
        getRrowData: getRrowData
    }

};

/**
 * Returns assesment types from raw data needed for column rendering
 *
 * TODO could we get it from the backend
 * @param data
 * @returns {Array}
 */
function getAssessementTypes(data) {
    const dataCnt = (data || []).length;
    let i = 0;
    let key;
    let types = [];

    for (i; i < dataCnt; i += 1) {
        Object.keys(data[i].assessment).forEach(item => {
            key = item.split('/')[0];
            if ( types.indexOf(key) === -1 ) {
                types[types.length] = `${key}`;
            }
        });
    }

    return types;
}


