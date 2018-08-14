// TODO move all init functions from html files
// init function per page

var WB = (function (module) {

    if (!module.init) {
        module.init = {};

    }

    // GLOBALS - ALL PAGES


    // notification
    module.notif = WBLib.SimpleNotification()
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


    // ===========================================================
    // TABLE REPORTS PAGE INIT

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
            render: WBLib.utils.timestampColumnRenderer,
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
                rowClickCb: WBLib.utils.tableRowClickHandlerFn,
                serverSide: true,
                // this is only throttling and not debouncing, for debouncing we need to fully control search input events
                searchDelay: 400,
                ajax: {
                    url: '/table-data',
                    type: 'POST'
                }
            }
        };

        return new WBLib.WbDataTable('reports-table', options);
    };

    // ===========================================================
    // FEATURE BY UUID PAGE INIT

     module.init.initUpdateFeature = function (featureData, featureHistoryData, yieldData, staticWaterData) {


            // LINE CHARTS
            var chart_yield = lineChart({
              data: yieldData,
              parentId: 'chartWrap-yield',
              title: 'Yield',
              svgClass: 'wb-line-chart',
              height: 250,
              yLabel: 'Yield',
              labelField: 'ts',
              valueField: 'value'
            });

            var chart_static = lineChart({
              data: staticWaterData,
              parentId: 'chartWrap-static',
              svgClass: 'wb-line-chart',
              height: 250,
              yLabel: 'Water Level',
              labelField: 'ts',
              valueField: 'value'
            });

            // charts on resize
            d3.select(window).on('resize', _.debounce(function () {
              chart_yield.resize();
              chart_static.resize();
            }, 250));


            // MAP

            // setup map
            module.mapInstance = WBLib.WbMap.wbMap({
                init: true,
                mapId: 'featureMapWrap',
                tileLayerDef: TILELAYER_DEFINITIONS,
                leafletConf: {
                    zoom: 12,
                    editable: true
                },
                activeLayerName: 'MapBox',
                markerRenderFn: WBLib.WbMap.createFeatureByUUidMarker,
                markerData: [{
                    geometry: {
                      lon: featureData._geometry[0],
                      lat: featureData._geometry[1]
                    },
                    data: featureData,
                    draggable: false,
                    zoomToMarker: true
                }],
                initMarkersOnLoad: true
            });

            // FEATURE FORM

            module.FeatureForm = new WBLib.form.SimpleForm({
              formId: 'add_even_form',
              parentId: 'formWrap',
              submitBtnSelector: '#update_button',
              isBtnVisible: false,
              onSubmit: function (formData) {
                WBLib.api.axUpdateFeature({
                  data: WBLib.utils.removeBlacklistedPropsFromObject({
                    flatObj: formData
                  })
                });
              },
              isEnabled: false,
              accordionConf: {
                selector: '#data-accordion',
                opts: {
                  heightStyle: "content",
                  header: "div > h3"
                }
              }
            });

            // toggle-update-form

            var formToggleBtn = document.getElementById('toggle-update-form');

            formToggleBtn.addEventListener('click', function (e) {

              var label, style;

              var markers = module.mapInstance.markerLayer().getLayers();

              var lastMarker = markers[markers.length - 1];


              if (module.FeatureForm.enableForm()) {
                style = true;
                label = 'Enable edit';

                lastMarker.dragging.enable();
              } else {
                style = false;
                label = 'Disable edit';

                lastMarker.dragging.disable();
              }

              module.FeatureForm.showUpdateButton(style);

              // change button label
              this.innerHTML = label;

            });

            // History Table

            var options = {
              dataTable: {
                data: featureHistoryData,
                fixedHeader: true,
                searching: false,
                columns: [{
                  data: 'ts',
                  title: 'Last update',
                  orderable: true,
                  render: WBLib.utils.timestampColumnRenderer
                }, {
                  data: 'email',
                  title: 'User',
                  orderable: true
                }, {
                  data: 'static_water_level',
                  title: 'SWL',
                  orderable: true
                }, {
                  data: 'yield',
                  title: 'YLD',
                  orderable: true
                }],
                order: [[0, "desc"]],
                lengthMenu: TABLE_ROWS_PER_PAGE_SMALL,
                rowClickCb: function (row) {

                  WBLib.api.axGetFeatureChangesetByUUID({
                    featureUUID: row.feature_uuid,
                    changesetId: row.changeset_id
                  });
                },

              },
              modalOpts: {
                title: 'History Data',
                modalOnOpenCb: function (data) {

                  WBLib.utils.initAccordion({
                    selector: '#wb-dialog div#data-accordion',
                    opts: {
                      heightStyle: "content",
                      header: "div > h3"
                    }
                  });
                  var modalDomObj = data.modalObj;

                  $(modalDomObj).find('fieldset').attr({disabled: true});

                  $(modalDomObj).find('#update_button').hide();
                }
              }
            };

            // This instance has a modal attached to self (some vals are hardcoded)
            // Todo update
            module.historytable = new WBLib.WbDataTable('history-table', options);

     };
     // end update init

    // ===========================================================
    // CREATE FEATURE PAGE INIT

     module.init.initCreateFeature = function () {

        module.FeatureForm = new WBLib.form.SimpleForm({
          formId: 'feature-create-form',
          parentId: 'formWrap',
          isEnabled: true,
          isBtnVisible: true,
          submitBtnSelector: '#create_button',
        selectizeFields: true,
          onSubmit: function (formData, formInstance) {
            WBLib.Modals.LoadingModal.show();
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

        var coords = WBLib.form.utils.getFormFieldValues(['latitude', 'longitude'], module.FeatureForm.formDomObj);

        var markerGeometry = {lon: 38.3, lat: 14.3};

        if (coords.longitude && coords.latitude) {
          markerGeometry = {
            lon: coords.longitude,
            lat: coords.latitude
          };
        } else {
          //module.FeatureForm
            WBLib.form.utils.setFormFieldValues({
                longitude: markerGeometry.lon,
                latitude: markerGeometry.lat
              }, module.FeatureForm.formDomObj);
        }


        // Leaflet Map

        module.mapInstance = WBLib.WbMap.wbMap({
            init: true,
            mapId: 'featureMapWrap',
            tileLayerDef: TILELAYER_DEFINITIONS,
                leafletConf: {
                    zoom: 12,
                    editable: true
                },
                activeLayerName: 'MapBox',
                markerRenderFn: WBLib.WbMap.createFeatureByUUidMarker,
                markerData: [{
                    geometry: markerGeometry,
                    data: {},
                    draggable: true,
                    zoomToMarker: true
                  }],
                initMarkersOnLoad: true
            });
     };

    return module;

})(WB || {});
