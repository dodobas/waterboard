// Feature form handler
function attributesFormLatLngInputOnChange (e) {

    var coords = WB.FeatureForm.getFormFieldValues(['_latitude', '_longitude']);

    WB.FeatureMarker.setLatLng([coords._latitude, coords._longitude]);
    WB.FeatureMapInstance.setView({
        lat: coords._latitude,
        lng: coords._longitude
    }, 10);
}


var FEATURE_DETAIL_EVENTS_MAPPING = {
    latLng: {
        selector: '[data-group-name="basic"]',
        eventType: 'input',
        cbFunc: attributesFormLatLngInputOnChange
    }
};


function parseAttributesForm(content, parseHidden ) {

    parseHidden = parseHidden || true;
    var groupSelector = '[data-group-name]';
    var formFieldSelector = 'input, select';
    var hiddenFieldsId = 'basic_feature_data';

    var allGroups = content.querySelectorAll(groupSelector);

    var values = {};

    var groupsCnt = allGroups.length;

    var groupName;

    for (var i = 0; i < groupsCnt; i += 1) {

        groupName = allGroups[i].dataset.groupName;

        var inputs = allGroups[i].querySelectorAll(formFieldSelector);

        for (var j = 0; j < inputs.length; j += 1) {
            values[groupName + '/' + inputs[j].name] = inputs[j].value;
        }

    }

    // parse hidden inputs
    if (parseHidden === true) {
        var hidden_inputs = document.getElementById(hiddenFieldsId).querySelectorAll('input');

        for (var h = 0; h < hidden_inputs.length; h += 1) {
            values[hidden_inputs[h].name + ''] = hidden_inputs[h].value;
        }
    }

    return values;
}


function SimpleForm(config) {
    this.options = config || {};

    this.is_disabled = config.is_disabled || false;
    this.btnHidden = config.btnHidden || false;

    this.parent = false;
    this.formDomObj = false;
    this.updateBtn = false;
    this.customEventMapping = config.customEventMapping || FEATURE_DETAIL_EVENTS_MAPPING;

    this.init();
}

SimpleForm.prototype = {
    init: function () {
        this.parent = document.getElementById(this.options.parentId);
        this.formDomObj = document.getElementById(this.options.formId);
        this.formFieldset = this.formDomObj.querySelector('fieldset');

        this.formFields = this.getFormFields();

        if (this.is_disabled === true) {
            this.toggleForm(true);
        }

        if (this.options.updateBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.updateBtnSelector);
        }

        this.setStyles(this.btnHidden);
        this.addEvents();
    },

    setVisible: function (domObj, isVisible) {
        if (domObj) {
            if (isVisible === false) {
                domObj.style.display = 'none'
            } else {
                domObj.style.display = 'block'
            }
        }
    },

    setStyles: function (isHidden) {
        if (this.updateBtn) {
             if (isHidden === true) {
                this.setVisible(this.updateBtn, false);
             } else {
                 this.setVisible(this.updateBtn, true);
             }

        }
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
        const fields = form ? form : this.formDomObj.elements;
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
        const fields = formFields ? formFields : this.formDomObj.elements;

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

    toggleForm: function (enabled) {
        var is_disabled = enabled instanceof Boolean ? enabled : this.is_disabled;

        if (is_disabled) {
            this.formFieldset.setAttribute("disabled", !this.is_disabled);
            this.is_disabled = false;
        } else {
            this.formFieldset.removeAttribute("disabled");
            this.is_disabled = true;
        }

        return is_disabled;

    },

    addEvents: function () {
        var self = this;

        if (this.updateBtn) {

            this.formDomObj.addEventListener('onsubmit', function (e) {
                e.preventDefault();
                return false;
            });

            // add click event to form parent (must exist)
            WB.utils.addEvent(this.parent, 'click', function (e) {
                if (e.target === self.updateBtn) {
                    var formData = parseAttributesForm(self.formDomObj);

                    if (self.options.updateCb && self.options.updateCb instanceof Function) {
                        self.options.updateCb(formData, self)
                    }
                }
            });

        }

        // init custom events on form dom elements
        WB.utils.initEventsFromConf(this.customEventMapping, this.parent);



    }
};

