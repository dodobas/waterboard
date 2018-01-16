
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

function axPost(url, data, cbFunc, errCb) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        success: function (result) {
            if (cbFunc instanceof Function) {
                cbFunc(result)
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


    this.data = this.options.data || {};

    this.formId = this.options.formId;

    this.formDomObj = false;
    this.updateBtn = false;

    this.updateBtnSelector = this.options.updateBtnSelector;

    this.init();
}

SimpleForm.prototype = {
    init: function () {
        this.formDomObj = document.getElementById(this.formId);

        this.updateBtn = this.formDomObj.querySelector(this.updateBtnSelector);

        this.addEvents();
    },
    addEvents: function () {
        var self = this;

        WB.utils.addEvent(this.updateBtn, 'click', function (e) {
            e.preventDefault();
            var formData = parseForm(self.formDomObj);

            console.log('form', this);
            console.log('formData', formData);

            if ( self.options.updateCb && self.options.updateCb instanceof Function) {
                self.options.updateCb(formData, self)
            }

        });
    }
};
