// Feature form handler

// TODO everything to a separate js file
function parseForm(content, parseHidden = true) {

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

    // is set but not used - initially the form is prefilled on the backend
    // this.data = this.options.data || {};

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
            (acc, cur, i) => {
                acc[fields[cur].name] = fields[cur];
                return acc;
            }, {}
        )
    },
    getFormFieldValues: function (fieldNames, formFields) {
        const fields = formFields ? formFields : this.formDomObj.elements;

        return fieldNames.reduce(
            (acc, cur, i) => {
                acc[fields[cur].name] = fields[cur].value;
                return acc;
            }, {}
        )

        // Object.keys(fieldNames).map((fieldName) => {
        //     return {
        //         fieldName: `${fieldName}`,
        //         value: this.formFields[`${fieldName}`].value
        //     };
        //    // if (this.formFields[`${fieldName}`]) {
        //
        //     //}
        // });
    },
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
        /*   $('body').on('submit', this.formDomObj, function (e) {
              console.log('sdsad', e);
               e.preventDefault();
           //    e.stop

               return false
           });*/

        /* $(this.formDomObj).submit(function(e){
             console.log('=====================');
          e.preventDefault();
        });*/

        console.log('asdassadfsfdd -');
        if (this.updateBtn) {

            this.formDomObj.addEventListener('onsubmit', function (e) {
                console.log('asdassadfsfdd');
                e.preventDefault();
                return false;
            });

            console.log('---');
            // remove previously attached events
            // TODO: find an alternative way to do this
            $('body').off('click', this.options.updateBtnSelector);

            $('body').on('click', this.options.updateBtnSelector, function (e) {
                e.preventDefault();
                var formData = parseForm(self.formDomObj);

                if (self.options.updateCb && self.options.updateCb instanceof Function) {
                    self.options.updateCb(formData, self)
                }
            });
            // WB.utils.addEvent(this.updateBtn, 'click', function (e) {
            //      e.preventDefault();
            //      var formData = parseForm(self.formDomObj);
            //
            //      if ( self.options.updateCb && self.options.updateCb instanceof Function) {
            //          self.options.updateCb(formData, self)
            //      }
            //
            //  });
        }

        let eventsMapping = {
            latLng: {
                selector: '[data-group-name="basic"]',
                eventType: 'input',
                cbFunc: ({origEvent})=> {
                    let newMarkerCoord = self.getFormFieldValues(['_latitude', '_longitude']);

                    let coords = [newMarkerCoord._latitude, newMarkerCoord._longitude];

                    let marker = WB.storage.getItem('featureMarker');
                    let map = WB.storage.getItem('featureMapWrap');

                    marker.setLatLng(coords);
                    map.setView(coords, 10);
                }
            }
        }

        let inpt;
        Object.keys(eventsMapping).forEach((key) => {

            let {selector, eventType, cbFunc} = eventsMapping[key];

            inpt = self.formDomObj.querySelector(`${selector}`);

                WB.utils.addEvent(inpt,
                `${eventType}`, (e)=> {
                    cbFunc({
                        origEvent: e
                    });
                }
            );
        });


    }
};
