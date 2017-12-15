
var GeofencePolygon = function (options, config) {
    DefaultGeofenceShape.call(this, options, config);
    return this;
};

GeofencePolygon.prototype = Object.create(DefaultGeofenceShape.prototype);
GeofencePolygon.constructor = GeofencePolygon;

GeofencePolygon.prototype._initialize = function () {
    console.log('init',this);
    this.shapeType = 'polygon';
    this.shape = L.GeoJSON.geometryToLayer(
        this.geometry
    );
    this._render();
};

// Called on init and on update
GeofencePolygon.prototype._setItemDataFromOptions = function () {
    this.id = this.options.id;
    this.name = this.options.name || '';
    this.description = this.options.description || '';
    this.active = this.options.active === true;
    this.geometry = this.options.geometry || '';
};

GeofencePolygon.prototype._updateFlagPosition = function () {
    this.itemFlag.setLatLng(
        this.shape._getShapeLatLngs()
    );
};

GeofencePolygon.prototype._getShapeLatLngs = () => this.shape.getLatLngs()[0][0];


GeofencePolygon.prototype._reInitShape = function () {
    this.shape.setLatLngs(
        (self.geometry.coordinates[0] || []).map((coord) => [coord[1], coord[0]])
    )

};

// returns meta fom shape
GeofencePolygon.prototype._getMetadata = function () {
    return {
        type: 'Polygon'
    };
};

GeofencePolygon.prototype._updateItem = function (newData) {
    // need for canceling
    this.options = Object.assign({}, this.options, newData);

    this._setItemDataFromOptions();

    this.shape.setStyle(
        this._getStyle()
    );

    this.itemFlag._icon.hidden = false;

    // update flag text
    this.itemFlag.options.icon.updateText(this.name);

    // update flag position
    this.itemFlag.setLatLng(
         this._getShapeLatLngs()
    );
};


