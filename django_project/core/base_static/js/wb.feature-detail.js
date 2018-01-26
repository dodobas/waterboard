
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

function url_update_feature(id) {
    return "/update-feature/" + id
}

function axPost({url, data, cbFunc, errCb, method = 'Post'}) {
    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function (result) {
            if (cbFunc instanceof Function) {
                WB.historytable.showModalForm(result)
            }
        },
        error: function (request, error) {
            if (errCb instanceof Function) {
                errCb(request, error)
            }
        }
    });
}

function SimpleForm (config) {
    this.options = config || {};

    this.is_disabled = config.is_disabled || true;

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

        if (this.is_disabled === true) {
            this.toggleForm(true);
        }

        if (this.options.updateBtnSelector) {
            this.updateBtn = this.formDomObj.querySelector(this.options.updateBtnSelector);
        }

        this.addEvents();
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