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


 var TEST_DATA = [
      {
        "name": "Agkali Eldery Care Homes",
        "geometry": [
          24.608388192111,
          35.21344935
        ],
        "country": "Greece",
        "overall_assessment": 5,
        "enriched": true,
        "created_date": "2017-12-10T19:44:50.840Z",
        "assessment": {},
        "id": 3,
        "data_captor": "knek@pecina.co"
      },
      {
        "name": "Abdulrahman Al Mshari Hospital",
        "geometry": [
          46.23046874999999,
          24.726874870506972
        ],
        "country": "Saudi Arabia",
        "overall_assessment": 5,
        "enriched": true,
        "created_date": "2017-12-10T19:45:38.808Z",
        "assessment": {},
        "id": 5,
        "data_captor": "knek@pecina.co"
      },
      {
        "name": "Adam's Hospital",
        "geometry": [
          31.1944807,
          30.0518353
        ],
        "country": "Egypt",
        "overall_assessment": 5,
        "enriched": true,
        "created_date": "2017-12-10T19:58:23.890Z",
        "id": 9,
        "data_captor": "knek@pecina.co",



        "assessment": {
          "kvaliteta/kvaliteta_1": {
            // --> fali tip vrijednosti
            "option": "",
            "value": 5253,
            "description": ""
          },
          "kvaliteta/kvaliteta_2": {
            "option": "",
            "value": "25.01",
            "description": ""
          }
        },

      },
      {
        "name": "sadasdas",
        "geometry": [
          41.50000000000002,
          32.35253036241917
        ],
        "country": "Iraq",
        "overall_assessment": 2,
        "enriched": false,
        "created_date": "2017-12-13T21:36:12.192Z",
        "assessment": {},
        "id": 13,
        "data_captor": "knek@pecina.co"
      }
    ];


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
var WB = (function (module) {

    module.dataGrid = function () {
        console.log('loaded');
   };

    module.renderRow = function(tableDomObj, data, columnDefinitions) {
//  const table = document.getElementById('data-grid-table');
        // FIELD_DEFINITIONS

        const dataCnt = (data || []).length;
        let i = 0;
        let key;
        let types = [];

        const columns = TableRowRenderers();

        const fieldWhiteList = Object.keys(columnDefinitions);


        let trow, tcol, columnDomObj;

        for (i; i < dataCnt; i += 1) {
            trow = document.createElement('tr');
            trow.dataset.id = data[i].id;

            fieldWhiteList.forEach(column => {
                tcol = document.createElement('td');

                columnDomObj = columns[columnDefinitions[column].renderType](data[i][column]);
                tcol.appendChild(columnDomObj);
                trow.appendChild(tcol);
            });

            tableDomObj.tBodies[0].appendChild(trow);
        }

    }

    return module;
} (WB || {}));


var FIELD_DEFINITIONS = {
    "name": {
        renderType: 'string',
        label: 'Name',
        position: '1'
    },
    "geometry": {
        renderType: 'latLng',
        label: 'Geometry',
        position: '2'
    },
    "country": {
        renderType: 'string',
        label: 'Country',
        position: '3'
    },
    "overall_assessment": {
        renderType: 'number',
        label: 'Overall',
        position: '4'
    },
    "enriched": {
        renderType: 'boolean',
        label: 'Enriched',
        position: '5'
    },
    "created_date": {
        renderType: 'timestamp',
        label: 'Created',
        inFormat: '',
        outFormat: '',
        position: '6'
    },
    "id": {
        renderType: 'number',
        label: 'Id',
    },
    "data_captor": {
        renderType: 'string',
        label: 'Captor',
    }/*,

    "assessment": {
        // TODO write down all types
        renderType: 'complex',
        splitBy: '/',
        columnName: '0',
        columnData: '1',
    }*/
}



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


