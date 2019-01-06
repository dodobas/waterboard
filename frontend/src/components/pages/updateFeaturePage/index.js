/*global lineChart*/


import WbForm from '../../form/wbForm';
import {defaultFormFieldOnKeyUp, featureFormToggleStateHandler} from "../../form/wbForm.utils";

import WbMap from '../../map/WbMap';
import api from '../../../api/api';

import {createFeatureByUUidMarker} from '../../map/mapUtils';
import WbDataTable from '../../datatable';

import TILELAYER_DEFINITIONS from '../../../config/map.layers';
import {TABLE_ROWS_PER_PAGE_SMALL} from "../../../config";
import {timestampColumnRenderer} from "../../../templates.utils";
import lineChart from '../../charts/lineChart';

export default function initUpdateFeature(props) {
    let {
        module,
        featureData,
        featureHistoryData,
        yieldData,
        staticWaterData,
        attributeGroups,
        attributeAttributes,
        feature_uuid
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


    // MAP INSTANCE

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

    // todo refactor fields / field definitions, duplicating data now
    let FeatureForm = new WbForm({
        data: featureData,
        fieldGroups: attributeGroups,
        fields: attributeAttributes,
        activeTab: 'location_description',
        parentId: 'wb-update-feature-form',
        navigationId: 'form-nav',
        actionsId: 'form-actions',
        fieldsToBeSelectizedSelector: '[data-wb-selectize="field-for-selectize"]',
        isFormEnabled: false,
        handleFormFieldKeyUpFn: defaultFormFieldOnKeyUp,
        handleOnSubmitFn: (formData) => {

            api.axUpdateFeature({
                data: formData,
                feature_uuid: feature_uuid
            })
        },
        isDeleteEnabled: true,
        handleOnDeleteFn: (feature_uuid, featureData) => {
            console.log('DELETE FEATURE AJAX', feature_uuid, featureData);
            api.axDeleteFeature({feature_uuid});
        },
        isFormStateToggleEnabled: true,
        customEvents: [
            {
                parentId: 'toggle-update-form',
                type: 'click',
                callback: featureFormToggleStateHandler
            }
        ]

    });
    FeatureForm.render({});
    // History Table

    let options = {
        dataTable: {
            data: featureHistoryData,
            fixedHeader: true,
            searching: false,
            columns: [{
                data: 'ts',
                title: 'Last update',
                orderable: true,
                render: timestampColumnRenderer
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
            rowClickCb: api.axGetFeatureChangesetByUUID,

        },
    };
    module.FeatureFormInstance = FeatureForm;
    module.MapInstance = mapInstance;
    module.HistorytableInstnace = new WbDataTable('history-table', options);

    return module;
}
