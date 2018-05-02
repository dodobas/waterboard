// TODO move all init functions from html files
// init function per page

var WB = (function (module) {

    if (!module.init) {
        module.init = {};

    }

    // todo rename to dashboardcController
    module.controller = {};


    // Main Dashboard Page Controller
    module.init.initDashboards = function (data) {

        // init module and set options
        module.notif = module.SimpleNotification()
            .options({
                message: null,
                type: 'success',
                fadeOut: {
                    delay: Math.floor(Math.random() * 500) + 2500,
                    enabled: true
                }
            });

        // init notification
        module.notif();

        // TODO create a render markup function
        module.controller = new DashboardController({
            chartConfigs: CHART_CONFIGS,
            tableConfig: TABLE_DATA_CONFIG,
            mapConfig: MAP_CONFIGS,
            dashboarData: data || {}
        });


    };


     // Main Table reports init function
    module.init.initTableReport = function (reportTableDataAttributes) {

        var dynamicColumns = reportTableDataAttributes.map(function (attribute) {
            return {
                data: attribute.key,
                title: '<div>' + attribute.label + '</div>',
                searchable: attribute.searchable,
                orderable: attribute.orderable
            };
        });

        var TABLE_REPORT_COLUMNS = [{
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
        }].concat(dynamicColumns);

        var options = {
            dataTable: {
                "dom": 'l<"wb-export-toolbar">frtip',
                scrollX: true,
                fixedHeader: true,
                columns: TABLE_REPORT_COLUMNS,
                order: [[0, 'desc']],
                lengthMenu: TABLE_ROWS_PER_PAGE,
                rowClickCb: tableRowClickHandlerFn,
                serverSide: true,
                // this is only throttling and not debouncing, for debouncing we need to fully control search input events
                searchDelay: 400,
                ajax: {
                    url: '/table-data',
                    type: 'POST'
                }
            }
        };

        module.tableReports.init('reports-table', options);
    };

     module.init.initUpdateFeature = function () {};


     // Create Feature page init function
     module.init.initCreateFeature = function () {
         module.notif = module.SimpleNotification()
          .options({
            message: null,
            type: 'success',
            fadeOut: {
              delay: Math.floor(Math.random() * 500) + 2500,
              enabled: true
            }
          });
        module.notif();

        module.FeatureForm = new SimpleForm({
          formId: 'feature-create-form',
          parentId: 'formWrap',
          isEnabled: true,
          isBtnVisible: true,
          submitBtnSelector: '#create_button',
          onSubmit: function (formData, formInstance) {
            module.loadingModal.show();
            formInstance.formDomObj.submit();
          },
          accordionConf: {
            selector: '#data-accordion',
            opts: {
              heightStyle: "content",
              header: "div > h3"
            }
          }
        });

        // Leaflet Map

        var coords = module.FeatureForm.getFormFieldValues(['_latitude', '_longitude']);

        var markerGeometry = {lon: 38.3, lat: 14.3};

        if (coords._longitude && coords._latitude) {
          markerGeometry = {
            lon: coords._longitude,
            lat: coords._latitude
          };
        } else {
          module.FeatureForm.setFormFieldValues({
            _longitude: markerGeometry.lon,
            _latitude: markerGeometry.lat
          });
        }


        // setup
        module.mapInstance = wbMap()
          .layerConf(TILELAYER_DEFINITIONS)
          .leafletConf({
            zoom: 12,
            editable: true
          }, 'MapBox')
          .markerRenderer(createFeatureByUUidMarker)
          .initMapSearch({
            parentId: 'geo-search-wrap'
          })
          .markerData([{
            geometry: markerGeometry,
            data: {},
            draggable: true,
            zoomToMarker: true
          }]);

        // init
        module.mapInstance('featureMapWrap');

        // add markers
        module.mapInstance.renderMarkers({});
     };

    return module;

})(WB || {});
