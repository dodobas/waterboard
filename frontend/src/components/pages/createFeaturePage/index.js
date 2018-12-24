import form from '../../form';
import WbMap from '../../map/WbMap';

import {axCreateFeature} from '../../../api/api';

import {createFeatureByUUidMarker} from '../../map/mapUtils';
import TILELAYER_DEFINITIONS from '../../pages/config/map.layers';

import {getFormFieldValues} from "../../form/formFieldsDataHandler";
import {defaultFormFieldOnKeyUp} from "../../form/wbForm.utils";
import WbForm from "../../form/wbForm";

export default function initCreateFeature (props) {

    const {module, featureData, attributeGroups} = props;

        // FEATURE FORM
    let featureForm = new WbForm({
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
            axCreateFeature({
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

    let markerGeometry = {lon: 38.3, lat: 14.3};

    if (longitude && latitude) {
      markerGeometry = {
        lon: longitude,
        lat: latitude
      };
    } else {
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

    module.FeatureForm = featureForm;
    module.mapInstance = mapInstance;

}
