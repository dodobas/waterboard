/**
 * Feature form latitude / longitude input on change handler
 * On input change will move the marker and center the map
 * Used in water point add and water point update pages
 * @param options
 */
export function attributesFormLatLngInputOnChange ({latitude, longitude}) {

    const lastMarker = _.last(WB.mapInstance.markerLayer().getLayers());

    lastMarker.setLatLng([latitude, longitude]);

    WB.mapInstance.leafletMap().setView({
        lat: latitude,
        lng: longitude
    }, 10);
}


/**
 * Prepare raw attributes attribute form field configuration
 * Currently add inputAttributes property used by form render function
 * inputAttributes - array of key value pairs which are used to create form field attributes
 *
 * @param attributeAttributes
 * @returns {{}}
 * @private
 */
export function prepareAttributesAttributeData(attributeAttributes, attributeGroups) {

    let groups = _.reduce(attributeGroups,(acc, val, i) => {
        acc[i] = val;
        acc[i].fields = {};
        return acc;
    }, {});


    let attributes = Object.assign({}, attributeAttributes);
        //{...attributeAttributes};

    let keys = Object.keys(attributes);
    let cnt = keys.length;
    let i = 0, attr, attrKey;

    for (i; i < cnt; i += 1) {
        attrKey = keys[i];

        attr = attributes[`${attrKey}`];


        attr.inputAttributes = [{
            attrName: 'data-group-parent',
            attrValue: `${attr.attribute_group}`
        }];

        if (attr.meta.result_type === 'DropDown') {
            attr.inputAttributes.push({
                attrName: 'wb-selectize',
                attrValue: 'field-for-selectize'
            });
        }

        groups[`${attr.attribute_group}`].fields[`${attrKey}`] = Object.assign({}, attr);
        //{...attr};

    }

    console.log(groups);
    return groups;
    //return attributes;
}
