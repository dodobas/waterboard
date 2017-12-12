/**
 * WIP - circle already exists
 * Abstract Shape Class for drawing shapes on leaflet
 *
 * All shape classes inherit this
 *
 * Shapes:
 *
 * - circle
 * - polyline
 * - polygon
 */
function DefaultGeofenceShape (options, config, emptyInstance) {
    if (this.constructor === DefaultGeofenceShape) {
      throw new Error('Cannot Instantiate Abstract Class!');
    }

    this.style = (options && options.style) ? options.style : {
        opacity: 1,
        fillOpacity: 0.5,
        color: '#135001',
        fillColor: '#135001',
        disabledColor: '#c8a8c8',
        disabledFillColor: '#c8a8c8',
        shapeHoverBackground: '#faffaf',
        editingColor: '#FF9808',
        editingFillColor: '#FF9808'
    };
    this.options = options;


    this.itemFlag = false;
    this.itemNumber = this.options.itemNumber || '';
    this.layerGroup = L.layerGroup([]);
    this._setItemDataFromOptions();

    Events(this);

    // for polyline
    if (emptyInstance) {
        this._initialize(emptyInstance);
    }
    else {
        this._initialize();
    }
}

DefaultGeofenceShape.prototype = {
    _toggleItemVisibility: function (visibilityFlag) {
        var self = this;

        if(visibilityFlag === false) {

            self.layerGroup.removeLayer(self.shape);

            self.layerGroup.removeLayer(self.itemFlag);
       } else {

            self.layerGroup.addLayer(self.shape);

            self.layerGroup.addLayer(self.itemFlag);
        }
    },

    _removeItems: function () {
        var self = this;

        self.shape = {};
        self.layerGroup.remove();
    },

    _render: function () {
        this.shape.setStyle(
            this._getStyle()
        );
        this.layerGroup.addLayer(this.shape);
        this._addFlag();
    },

    _addFlag: function () {

        var firstLatLng = this._getShapeLatLngs();

        this.itemFlag = L.marker(firstLatLng, {
            icon:  new L.ShapeFlag({
                divText: this.name
            })
        });

        this.itemFlag.addTo(this.layerGroup);
    },

    _enableEdit: function (check) {
        var enableDisable = check === true ? 'enableEdit' : 'disableEdit';

        this.shape[enableDisable]();

        this.shape.setStyle(
            this._getStyle()
        );
    },


    _getId: function () {
        return this.options.id;
    },

    // returns shape object - shape, layer group
    _getGeometry: function (options) {
        var self = this;

        var geometryOptions = options ? options : false;

        if(geometryOptions !== false) {
            return self.shape;
        }
        return self.layerGroup;
    },





    _getStyle: function () {
        var self = this;

        var style = {
            color: self.style.color,
            fillColor: self.style.fillColor,
            fillOpacity: 0.5,
            shapeHoverBackground: self.style.shapeHoverBackground
        };

        if (self.shapeType === 'polyline') {
            if(self.editing === true) {
                style.color = self.style.editingColor;
                style.fillColor = self.style.editingFillColor;
                return style;
            } else if (self.active === false) {
                style.color = self.style.disabledColor;
                style.fillColor = self.style.disabledFillColor;
                return style;
            } else if (self.active === true) {
                style.color = self.style.color;
                style.fillColor = self.style.fillColor;
                return style;
            } else {
                return style;
            }
        }
        else {
            if (self.shape.editEnabled() === true) {
                style.color = self.style.editingColor;

                style.fillColor = self.style.editingFillColor;

                return style;
            }

            if (self.active === false) {
                style.color = self.style.disabledColor;

                style.fillColor = self.style.disabledFillColor;
            }

            if (self.active === true) {
                style.color = self.style.color;

                style.fillColor = self.style.fillColor;
            }

            return style;
        }
    }
};
