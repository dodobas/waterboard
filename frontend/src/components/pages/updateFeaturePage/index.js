import form from '../../form';
import WbMap from '../../map/WbMap';
import api from '../../../api/api';
import {LoadingModal} from '../../modal';
import utils from '../../../utils';
import {createFeatureByUUidMarker} from '../../map/mapUtils';
import WbDataTable from '../../datatable';

export default function initUpdateFeature({wb, featureData, featureHistoryData, yieldData, staticWaterData}) {


            // LINE CHARTS
            let chart_yield = lineChart({
              data: yieldData,
              parentId: 'chartWrap-yield',
              title: 'Yield',
              svgClass: 'wb-line-chart',
              height: 250,
              yLabel: 'Yield',
              labelField: 'ts',
              valueField: 'value'
            });

            let chart_static = lineChart({
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
            let mapInstance = WbMap({
                init: true,
                mapId: 'featureMapWrap',
                tileLayerDef: TILELAYER_DEFINITIONS,
                leafletConf: {
                    zoom: 12,
                    editable: true
                },
                activeLayerName: 'MapBox',
                markerRenderFn: createFeatureByUUidMarker,
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
/*
            let FeatureForm = new form.SimpleForm({
              formId: 'add_even_form',
              parentId: 'formWrap',
              submitBtnSelector: '#update_button',
              isBtnVisible: false,
              onSubmit: function (formData) {
                  console.log(formData);
                api.axUpdateFeature({
                  data: utils.removeBlacklistedPropsFromObject({
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

              var markers = mapInstance.markerLayer().getLayers();

              var lastMarker = markers[markers.length - 1];


              if (FeatureForm.enableForm()) {
                style = true;
                label = 'Enable edit';

                lastMarker.dragging.enable();
              } else {
                style = false;
                label = 'Disable edit';

                lastMarker.dragging.disable();
              }

              FeatureForm.showUpdateButton(style);

              // change button label
              this.innerHTML = label;

            });
*/
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
                  render: utils.timestampColumnRenderer
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
                rowClickCb: function ({feature_uuid, changeset_id}) {

                  api.axGetFeatureChangesetByUUID({
                    featureUUID: feature_uuid,
                    changesetId: changeset_id
                  });
                },

              },
              modalOpts: {
                title: 'History Data',
                modalOnOpenCb: function (data) {

                  utils.initAccordion({
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

            wb.mapInstance = mapInstance;
     //       wb.FeatureForm = FeatureForm;
            wb.historytable = new WbDataTable('history-table', options);

     }
