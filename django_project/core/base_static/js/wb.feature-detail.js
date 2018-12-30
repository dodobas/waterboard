/**
 * Feature form latitude / longitude input on change handler
 * On input change will move the marker and center the map
 * Used in water point add and water point update pages
 * @param options
 */
function attributesFormLatLngInputOnChange (options) {

    var featureForm = _.get(options , 'payload.form');

    var coords = featureForm.getFormFieldValues(['latitude', 'longitude']);

    var lastMarker = _.last(WB.mapInstance.markerLayer().getLayers());

    lastMarker.setLatLng([coords.latitude, coords.longitude]);

    WB.mapInstance.leafletMap().setView({
        lat: coords.latitude,
        lng: coords.longitude
    }, 10);
}


var FEATURE_DETAIL_EVENTS_MAPPING = {
    latLng: {
        selector: '[data-group-name="location_description"]',
        eventType: 'input',
        cbFunc: attributesFormLatLngInputOnChange
    }
};


function parseAttributesForm(content) {

    var groupSelector = '[data-group-name]';
    var formFieldSelector = 'input, select';
    var hiddenFieldsId = '_hidden_fields';

    var allGroups = content.querySelectorAll(groupSelector);

    var values = {};

    var groupsCnt = allGroups.length;

    for (var i = 0; i < groupsCnt; i += 1) {

        var inputs = allGroups[i].querySelectorAll(formFieldSelector);

        for (var j = 0; j < inputs.length; j += 1) {
            values[inputs[j].name] = inputs[j].value;
        }

    }

    // parse hidden inputs
    var hidden_inputs = document.getElementById(hiddenFieldsId).querySelectorAll('input');

    for (var h = 0; h < hidden_inputs.length; h += 1) {
        values[hidden_inputs[h].name + ''] = hidden_inputs[h].value;
    }

    return values;
}


function SimpleForm(config) {
    this.options = config || {};

    this.isEnabled = config.isEnabled === true;
    this.isBtnVisible = config.isBtnVisible === true;

    this.parent = false;
    this.formDomObj = false;
    this.updateBtn = false;
    this.deleteBtn = false;
    this.customEventMapping = config.customEventMapping || FEATURE_DETAIL_EVENTS_MAPPING;

    this.parent = document.getElementById(this.options.parentId);
    this.formDomObj = document.getElementById(this.options.formId);
    this.formParentObj = this.formDomObj.parentNode;
    this.init();
}

SimpleForm.prototype = {
    // on first init formDomObj is undefined
    // formDomObj is used on form error cb
    init: function (formDomObj) {

        if (formDomObj) {
            this.formDomObj = formDomObj;
        }


        this.formFieldset = this.formDomObj.querySelector('fieldset');

        this.formFields = this.getFormFields();

        this.enableForm(this.isEnabled);


        if (this.options.submitBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.submitBtnSelector);
        }
        if (this.options.deleteBtnSelector) {
            this.deleteBtn = this.formDomObj.querySelector(this.options.deleteBtnSelector);
        }

        this.showUpdateButton(this.isBtnVisible);
        this.showDeleteButton(this.isBtnVisible);

        if (this.options.accordionConf) {
            this.initAccordion();
        }
        this.addEvents();

        if (this.options.selectizeFields !== false) {
            selectizeWbFormDropDowns(this.formDomObj);
        }

    },


    replaceFormMarkup: function (htmlString) {

         this.formParentObj.innerHTML = htmlString;

        this.init(this.formParentObj.firstElementChild);
    },

    showUpdateButton: function (show) {
        if (this.updateBtn) {
            this.updateBtn.style.display = show === true ? 'block' : 'none';
        }
    },
    showDeleteButton: function (show) {
        if (this.deleteBtn) {
            this.deleteBtn.style.display = show === true ? 'block' : 'none';
        }
    },

    initAccordion: function (selector) {
        var conf = this.options.accordionConf;
        var accordion = selector ? $(selector) : $(this.formDomObj).find(conf.selector);
        accordion.accordion(conf.opts);
    },

    /**
     * "Parse" form to get all form fields (will include all valid HTML fields - form.elements)
     * - returns object with key/val field pairs
     * - field name represents the key, val is the dom obj
     *
     * @param form
     * @returns {object}
     */
    getFormFields: function (form) {
        var fields = form ? form : this.formDomObj.elements;
        return Object.keys(fields).reduce(
            function (acc, cur, i) {
                acc[fields[cur].name] = fields[cur];
                return acc;
            }, {}
        )
    },

    /**
     * Reduce form elements to key (field name) - value pairs, field must have a name
     * @param fieldNames
     * @param formFields
     * @returns {*}
     */
    getFormFieldValues: function (fieldNames, formFields) {
        var fields = formFields ? formFields : this.formDomObj.elements;

        return fieldNames.reduce(
            function (acc, cur, i) {
                acc[fields[cur].name] = fields[cur].value;
                return acc;
            }, {}
        )
    },

    /**
     * Set form field value form a key/val pair
     * - key represents the field name, val the value
     * - the field name must exist in this.formFields
     * @param fieldData
     */
    setFormFieldValues: function (fieldData) {
        var self = this;
        Object.keys(fieldData).forEach(function (fieldName) {
            if (self.formFields[fieldName]) {
                self.formFields[fieldName].value = fieldData[fieldName];
            }
        });
    },

    /**
     * Set / Toggle form active state (enabled / disabled)
     *
     * if isEnabled is not set toggle current state
     * @param isEnabled
     * @returns {*|boolean}
     */
    enableForm: function (isEnabled) {
        var changeActiveStateTo = isEnabled === undefined ? !this.isEnabled : isEnabled;

        if (changeActiveStateTo === true) {
            this.formFieldset.removeAttribute("disabled");

            this.isEnabled = true;

        } else {
            this.formFieldset.setAttribute("disabled", true);
            this.isEnabled = false;
        }
        toggleSelectizeEnabled(this.formDomObj, this.isEnabled);
        return this.isEnabled;

    },

    addEvents: function () {
        var self = this;

        if (this.updateBtn) {

            this.formDomObj.addEventListener('onsubmit', function (e) {
                e.preventDefault();
                return false;
            });

            // add click event to form parent (must exist)
            // the form will be replaced so form events will be lost
            WB.utils.addEvent(this.parent, 'click', function (e) {
                if (e.target === self.updateBtn) {
                    var formData = parseAttributesForm(self.formDomObj);

                    if (self.options.onSubmit && self.options.onSubmit instanceof Function) {
                        self.options.onSubmit(formData, self)
                    }
                }
            });

        }

        // init custom events on form dom elements
        WB.utils.initEventsFromConf(this.customEventMapping, this.parent, {form: self});

    }
};

/**
 * Initialize selectize on formField
 * Attach filter attribute options callback on user input
 * Renders options in field (from callback)
 * @param formField
 */
function selectizeFormDropDown (formField) {

    var name = formField.name;

    if (!name) {
        console.log('No Name found on input feald');
        return;
    }

    formField.disabled = false;

    var _searchField = $(formField).selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        multiSelect: false,
        valueField: 'option',
        labelField: 'option',
        searchField: ['option'],
        maxItems: 1,
        preload: true,
        create: false,
        render: {
            option: function (result) {
                return '<div><span class="place">' + (result.option) + '</span></div>';
            }
        },
        load: function (query, callback) {
            // if (!query) {
            //     return callback();
            // }

            WB.api.axFilterAttributeOption(query, name, callback);

            return true;
        },
        onChange: function (id) {
            return !id === true;
        }
    });

}

/**
 * Selectize all fields in parent identified by selector
 * @param parent
 * @param selector
 */
function  selectizeWbFormDropDowns(parent, selector) {

    var fieldSelector = selector || '[wb-selectize="field-for-selectize"]';

    var fields = parent.querySelectorAll(fieldSelector);

    var i, fieldCnt = fields.length;

    for (i = 0; i < fieldCnt; i += 1) {
        selectizeFormDropDown(fields[i]);
    }
}

// todo - refactor
function toggleSelectizeEnabled(parent, enableField, selector) {

    var fieldSelector = selector || '[wb-selectize="field-for-selectize"]';

    var fields = parent.querySelectorAll(fieldSelector);

    var i, fieldCnt = fields.length, field;

    if (enableField === true) {
        for (i = 0; i < fieldCnt; i += 1) {
            field = $(fields[i])[0].selectize;
            if (field) {
                field.enable();
            }
        }
    } else {
        for (i = 0; i < fieldCnt; i += 1) {
            field = $(fields[i])[0].selectize;
            if (field) {
                field.disable();
            }
        }
    }

}
