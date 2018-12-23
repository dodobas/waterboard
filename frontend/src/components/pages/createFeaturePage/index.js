import form from '../../form';
import WbMap from '../../map/WbMap';
import {LoadingModal} from '../../modal';

import {createFeatureByUUidMarker} from '../../map/mapUtils';
import TILELAYER_DEFINITIONS from '../../pages/config/map.layers';
import api from "../../../api/api";
import {getFormFieldValues} from "../../form/formFieldsDataHandler";
import {attributesFormLatLngInputOnChange} from "../../form/wbForm.utils";
import WbForm from "../../form/wbForm";

export default function initCreateFeature (props) {

    const {wb, featureData, attributeGroups} = props;


    // let featureForm = new form.SimpleForm({
    //   formId: 'feature-create-form',
    //   parentId: 'formWrap',
    //   isEnabled: true,
    //   isBtnVisible: true,
    //   submitBtnSelector: '#create_button',
    //     selectizeFields: true,
    //   onSubmit: function (formData, formInstance) {
    //     LoadingModal.show();
    //
    //     formInstance.formObj.submit();
    //   },
    //   accordionConf: {
    //     selector: '#data-accordion',
    //     opts: {
    //       heightStyle: "content",
    //       header: "div > h3"
    //     }
    //   }
    // });

        // FEATURE FORM
    var featureForm = new WbForm({
        data: featureData,
        config: attributeGroups,
        activeTab: 'location_description',
        parentId: 'wb-create-feature-form',
        navigationId: 'form-nav',
        actionsId: 'form-actions',
        fieldsToBeSelectizedSelector: '[data-wb-selectize="field-for-selectize"]',
        isFormEnabled: true,
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
          /*  api.axUpdateFeature({
                data: formData,
                feature_uuid: feature_uuid
            })*/
        }
    });
    featureForm.render();
    // Leaflet Map

    const {longitude, latitude} = getFormFieldValues(
        ['latitude', 'longitude'],
        featureForm.formObj
    );

    let markerGeometry = {lon: 38.3, lat: 14.3};

    if (longitude && latitude) {
      markerGeometry = {
        lon: longitude,
        lat: latitude
      };
    } else {
      //module.featureForm
        form.utils.setFormFieldValues({
            longitude: markerGeometry.lon,
            latitude: markerGeometry.lat
          }, featureForm.formObj);
    }


    // Leaflet Map

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
            geometry: markerGeometry,
            data: {},
            draggable: true,
            zoomToMarker: true
          }],
        initMarkersOnLoad: true
    });

    wb.FeatureForm = featureForm;
    wb.mapInstance = mapInstance;

}
