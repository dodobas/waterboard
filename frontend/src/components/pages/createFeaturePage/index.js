import form from '../../form';
import WbMap from '../../map/WbMap';
import {LoadingModal} from '../../modal';

import {createFeatureByUUidMarker} from '../../map/mapUtils';
import {TILELAYER_DEFINITIONS} from '../../pages/config/map.layers';

export default function initCreateFeature (wb) {

    let featureForm = new form.SimpleForm({
      formId: 'feature-create-form',
      parentId: 'formWrap',
      isEnabled: true,
      isBtnVisible: true,
      submitBtnSelector: '#create_button',
        selectizeFields: true,
      onSubmit: function (formData, formInstance) {
        LoadingModal.show();

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

    const {longitude, latitude} = form.utils.getFormFieldValues(
        ['latitude', 'longitude'],
        featureForm.formDomObj
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
          }, featureForm.formDomObj);
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
