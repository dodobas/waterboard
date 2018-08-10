

/**
 * Feature form latitude / longitude input on change handler
 * On input change will move the marker and center the map
 * Used in water point add and water point update pages
 * @param options
 */
function attributesFormLatLngInputOnChange ({latitude, longitude}) {

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
function parseAttributesForm({
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



function SimpleForm(config) {
    this.options = config || {};

    this.isEnabled = config.isEnabled === true;
    this.isBtnVisible = config.isBtnVisible === true;

    this.parent = false;
    this.formDomObj = false;
    this.updateBtn = false;
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

        this.enableForm(this.isEnabled);


        if (this.options.submitBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.submitBtnSelector);
        }

        this.showUpdateButton(this.isBtnVisible);

        if (this.options.accordionConf) {
            this.initAccordion();
        }
        this.addEvents();

        if (this.options.selectizeFields !== false) {
            WBLib.selectizeUtils.selectizeWbFormDropDowns(this.formDomObj);
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

    initAccordion: function (selector) {
        var conf = this.options.accordionConf;
        var accordion = selector ? $(selector) : $(this.formDomObj).find(conf.selector);
        accordion.accordion(conf.opts);
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
            this.formDomObj.querySelector('fieldset').removeAttribute("disabled");

            this.isEnabled = true;

        } else {
            this.formDomObj.querySelector('fieldset').setAttribute("disabled", true);
            this.isEnabled = false;
        }
        WBLib.selectizeUtils.toggleSelectizeEnabled(this.formDomObj, this.isEnabled);
        return this.isEnabled;

    },

    addEvents: function () {
        var self = this;

        if (this.updateBtn) {

            // DESABLE DEFAULT FORM SUBMIT

            this.formDomObj.addEventListener('onsubmit', function (e) {
                e.preventDefault();
                return false;
            });

            //  ADD ON SUBMIT CLICK EVENT form parent
            // the form will be replaced so form events will be lost
            this.parent.addEventListener('click', function (e) {
                if (e.target === self.updateBtn) {
                    var formData = parseAttributesForm({form: self.formDomObj});

                    if (self.options.onSubmit && self.options.onSubmit instanceof Function) {
                        self.options.onSubmit(formData, self)
                    }
                }
            });

        }

        // init form lat, lng input on change

        this.parent.querySelector('[data-group-name="location_description"]').addEventListener('input', function (e) {
            const  {latitude, longitude} = WBLib.form.utils.getFormFieldValues(
                ['latitude', 'longitude'], self.formDomObj
            );
            attributesFormLatLngInputOnChange({latitude, longitude});
        });

    }
};
