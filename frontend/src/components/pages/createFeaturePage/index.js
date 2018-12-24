import form from '../../form';
import WbMap from '../../map/WbMap';

import {axCreateFeature} from '../../../api/api';

import {createFeatureByUUidMarker} from '../../map/mapUtils';
import TILELAYER_DEFINITIONS from '../../pages/config/map.layers';

import {getFormFieldValues} from "../../form/formFieldsDataHandler";
import {defaultFormFieldOnKeyUp} from "../../form/wbForm.utils";
import WbForm from "../../form/wbForm";

export default function initCreateFeature (props) {

    const {wb, featureData, attributeGroups} = props;

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
        handleKeyUpFn: defaultFormFieldOnKeyUp,
        handleOnSubmitFn: (formData) => {
            api.axCreateFeature({
                data: formData,
              //  feature_uuid: feature_uuid
            })
        }
    });
    featureForm.render();


    // Set marker position based on form lat / lng or to default
    // TODO form lat / lng are always empty, or?
    const {longitude, latitude} = getFormFieldValues(
        ['latitude', 'longitude'],
        featureForm.formObj
    );

    let markerGeometry = {longitude: 38.3, latitude: 14.3};

    if (longitude && latitude) {
      markerGeometry = {
        longitude: longitude,
        latitude: latitude
      };
    } else {
        form.utils.setFormFieldValues({
            longitude: longitude,
            latitude: latitude
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

    wb.CreateFeatureFormInstance = featureForm;
    wb.mapInstance = mapInstance;

}
