import form from '../../form';
import WbMap from '../../map/WbMap';
import api from '../../../api/api';
import {LoadingModal} from '../../modal';
import utils from '../../../utils';
import {createFeatureByUUidMarker} from '../../map/mapUtils';
import WbDataTable from '../../datatable';
import {attributesFormLatLngInputOnChange} from "../../form/wbForm.utils";
import {getFormFieldValues} from "../../form/formFieldsDataHandler";

export default function initUpdateFeature(props) {
    let {
        wb, featureData, featureHistoryData, yieldData, staticWaterData,

        attributeGroups, feature_uuid
    } = props;

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
                lon: featureData.longitude,
                lat: featureData.latitude
            },
            data: featureData,
            draggable: false,
            zoomToMarker: true
        }],
        initMarkersOnLoad: true
    });

    // FEATURE FORM
    WB.UpdateFeatureFormInstance = new WBLib.form.WbForm({
        data: featureData,
        config: attributeGroups,
        activeTab: 'location_description',
        parentId: 'wb-update-feature-form',
        navigationId: 'form-nav',
        actionsId: 'form-actions',
        fieldsToBeSelectizedSelector: '[data-wb-selectize="field-for-selectize"]',
        isFormEnabled: false,
        handleKeyUpFn: (e, formObj) => {
            // form latitude / longitude on change handler - map marker coords
            let fieldName = e.target.name;

            if (['longitude', 'latitude'].includes(`${fieldName}`)) {

                const {latitude, longitude} = getFormFieldValues(
                    ['latitude', 'longitude'], formObj
                );
                attributesFormLatLngInputOnChange({latitude, longitude});
            }
        },
        handleOnSubmitFn: (formData) => {
            api.axUpdateFeature({
                data: formData,
                feature_uuid: feature_uuid
            })
        }
    });
    WB.UpdateFeatureFormInstance.render();


    var formToggleBtn = document.getElementById('toggle-update-form');

    formToggleBtn.addEventListener('click', function (e) {

        var label;

        var markers = mapInstance.markerLayer().getLayers();

        var lastMarker = markers[markers.length - 1];


        if (WB.UpdateFeatureFormInstance.isFormEnabled === true) {
            WB.UpdateFeatureFormInstance.enableForm(false);
            label = 'Enable edit';

            lastMarker.dragging.enable();
        } else {
            WB.UpdateFeatureFormInstance.enableForm(true);
            label = 'Disable edit';

            lastMarker.dragging.disable();
        }

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
// TODO update globals
    wb.mapInstance = mapInstance;
    wb.historytable = new WbDataTable('history-table', options);

}
