/*global lineChart*/


import WbForm from '../../form/wbForm';
import {defaultFormFieldOnKeyUp, featureFormToggleStateHandler} from "../../form/wbForm.utils";

import WbMap from '../../map/WbMap';
import api from '../../../api/api';

import {createFeatureByUUidMarker} from '../../map/mapUtils';

import TILELAYER_DEFINITIONS from '../../../config/map.layers';

import lineChart from '../../charts/lineChart';
import TableEvents from "../../datatable/wb.datatable";
import {Modal} from "../../modal";
import createFeatureChangesetModalContent from "../../templates/modal.feature-changeset";

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
        yLabel: 'Yield',
    });
    chart_yield('chartWrap-yield');

    let chart_static = lineChart({
        data: staticWaterData,
        parentId: 'chartWrap-static',
        yLabel: 'Water Level',
    });
    chart_static('chartWrap-static');

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
console.log('featureHistoryData', featureHistoryData);

    module.YieldChart = chart_yield;
    module.StaticChart = chart_static;
    module.FeatureFormInstance = FeatureForm;
    module.MapInstance = mapInstance;



    // module.FeatureChangesetModal = new Modal({});

    const FeatureChangesetModal =  new Modal({});

    module.showModalForm = (data) => {

        const {featureData, attributeGroups, attributeAttributes} = data;

        let cont = createFeatureChangesetModalContent(attributeGroups, attributeAttributes, featureData);

        FeatureChangesetModal._setContent(cont);
        FeatureChangesetModal._show();

    };


    let HISTORY_TABLE_COLUMNS = [{
            key: 'ts',
            label: 'Last update',
            orderable: true,
          //  render: timestampColumnRenderer
        }, {
            key: 'email',
            label: 'User',
            orderable: true
        }, {
            key: 'static_water_level',
            label: 'SWL',
            orderable: true
        }, {
            key: 'yield',
            label: 'YLD',
            orderable: true
        }];



        // datatable events callback functions
    let TABLE_EVENT_MAPPING = {
        contextMenu: {},
        bodyClick: {
            openFeatureChangesetModal: function ({rowData}) {
                const {feature_uuid, changeset_id} = rowData;

                api.axGetFeatureChangesetByUUID({feature_uuid, changeset_id});
            }
        },
        header: {
            // handle sort on table header cell click
            // set "order" filter
            columnClick: function ({sortKey, sortDir}) {
                let obj = {
                    [sortKey]: sortDir
                };
                // if sortDir is empty remove from filter
                if (!sortDir) {
                  //  module.Filter.removeFromFilter('order', obj)
                } else {
                    // module.Filter.addToFilter('order', obj)
                }
            }
        }
    };
    //
    module.TableEvents = new TableEvents({
        parentId: 'wb-table-Events',
        uniqueKeyIdentifier: 'changeset_id',
        fieldDef: HISTORY_TABLE_COLUMNS,
        whiteList: HISTORY_TABLE_COLUMNS.map((col) => col.key),
        eventMapping: TABLE_EVENT_MAPPING,
        columnClickCbName: 'openFeatureChangesetModal',
        // callback when pagination page changes (next or previous) or number per page changes
        // set limit or offset
        // paginationOnChangeCallback: function (name, val) {
        //
        // }
    });
    module.TableEvents.setBodyData({
        data: featureHistoryData
    }, true);

    return module;
}
