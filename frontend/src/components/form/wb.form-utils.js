

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




// form group / accordion tab / header
// field types to parse
// get hidden field values
/**
 * Parse nested form (1 child per parent)
 *
 * For every field group:
 *   select all fields
 *   get value
 *   set result as key value pair for field
 *
 * @param form
 * @param groupSelector         - field group parent
 * @param formFieldSelector     - form field selectors to be selected from field group parent
 * @param hiddenFieldsSelector  - additional hidden field selector
 *
 * returns parsed form field values
 */
export function parseAttributesForm({
    form,
    groupSelector = '[data-group-name]',
    formFieldSelector = 'input, select',
    hiddenFieldsSelector = '#_hidden_fields input'
}) {

    // parsed form
    let parsedValues = {};

    // helper function, set result value for field
    const setFieldValue = (field) => { parsedValues[field.name] = field.value;};

    // parse form group fields for every form group
    _.forEach(form.querySelectorAll(groupSelector), (group) => {
         // get all fields for form group
         _.forEach(group.querySelectorAll(formFieldSelector), setFieldValue);
    });

    // parse hidden inputs
    _.forEach(form.querySelectorAll(hiddenFieldsSelector), setFieldValue);

    return parsedValues;
}
