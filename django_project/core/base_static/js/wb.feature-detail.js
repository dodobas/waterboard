// Feature form handler

// TODO everything to a separate js file
function parseForm(content) {

    var groupSelector = '[data-group-name]';
    var formFieldSelector = 'input, select';
    var hiddenFieldsId = 'feature_hidden_data';

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
    var hidden_inputs = document.getElementById(hiddenFieldsId).querySelectorAll('input');

    for (var h = 0; h < hidden_inputs.length; h += 1) {
        values[hidden_inputs[h].name + ''] = hidden_inputs[h].value;
    }

    return values;
}


function SimpleForm (config) {
    this.options = config || {};

    this.is_disabled = config.is_disabled || true;


    // is set but not used - initially the form is prefilled on the backend
    this.data = this.options.data || {};

    this.formId = this.options.formId;

    this.formDomObj = false;
    this.updateBtn = false;

    this.init();
}

SimpleForm.prototype = {
    init: function () {
        this.formDomObj = document.getElementById(this.formId);
        this.formFieldset = this.formDomObj.querySelector('fieldset');

        this.formFields = this.getFormFields();

        if (this.is_disabled === true) {
            this.toggleForm(true);
        }

        if (this.options.updateBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.updateBtnSelector);
        }

        this.addEvents();
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
        (acc, cur, i) => {
            acc[fields[cur].name] = fields[cur];
            return acc;
        }, {}
    )},
    /**
     * Set form field value form a key/val pair
     * - key represents the field name, val the value
     * - the field name must exist in this.formFields
     * @param fieldData
     */
    setFormFieldValues: function (fieldData) {
        Object.keys(fieldData).forEach((fieldName) => {
            if (this.formFields[`${fieldName}`]) {
                this.formFields[`${fieldName}`].value = fieldData[`${fieldName}`];
            }
        });
    },
    toggleForm: function (enabled) {
        var is_disabled = enabled instanceof Boolean ? enabled : this.is_disabled;

        if (is_disabled) {
            this.formFieldset.setAttribute("disabled", !this.is_disabled );
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
           WB.utils.addEvent(this.updateBtn, 'click', function (e) {
                e.preventDefault();
                var formData = parseForm(self.formDomObj);

                if ( self.options.updateCb && self.options.updateCb instanceof Function) {
                    self.options.updateCb(formData, self)
                }

            });
        }

    }
};
