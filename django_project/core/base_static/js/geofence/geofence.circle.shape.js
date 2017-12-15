/**
 * ===================================
 * GEOFENCE CIRCLE class
 *
 * inherits DefaultGeofenceShape
 *
 * metadata = {
 *   "type": "Circle",
 *   "radius": 730.9068027372629,
 *   "coordinates": {
 *     "lat": 46.828254496083,
 *     "lng": 15.166797637939455
 *   }
 */
GeofenceCircle = function (options, config) {
    DefaultGeofenceShape.call(this, options, config);
    return this;
};

GeofenceCircle.prototype =  Object.create(DefaultGeofenceShape.prototype);
GeofenceCircle.constructor = GeofenceCircle;

GeofenceCircle.prototype._initialize = function () {
    this.shapeType = 'circle';

    this.shape = L.circle(
        this.options.metadata.points,
        this.options.metadata.radius
    );

    this._render();
};

GeofenceCircle.prototype._setItemDataFromOptions = function () {
    this.active = this.options.active === true;
    this.description = this.options.description || '';
    this.geometry = this.options.geometry || '';
    this.id = this.options.id;
    this.name = this.options.name || '';
};

// update geofence data and dom
GeofenceCircle.prototype._updateFlagPosition = function () {
    this.itemFlag.setLatLng(
         this.shape.getLatLng()
    );
};

GeofenceCircle.prototype._getShapeLatLngs = function () {
    return this.shape.getLatLng();
};

// set lat lng and radius to initial state
GeofenceCircle.prototype._reInitShape = function () {
    this.shape.setLatLng(this.options.metadata.points);
    this.shape.setRadius(this.options.metadata.radius);

    this.itemFlag.setLatLng(
         this._getShapeLatLngs()
    );
};

// returns meta
GeofenceCircle.prototype._getMetadata = function () {
    var self = this;

    return {
        radius: self.shape.getRadius(),
        type: 'Circle',
        points: self.shape.getLatLng()
    };
};

// Public static
GeofenceCircle.createCircle = function (points, radius, style) {
    return L.circle(
        points,
        radius,
        style || {}
    );
};

// update geofence data and dom
GeofenceCircle.prototype._updateItem = function (newData) {
    var self = this;

    // need for canceling
    self.options = newData;

    self._setItemDataFromOptions();

    self.shape.setStyle(
        self._getStyle()
    );

    self.itemFlag._icon.hidden = false;

    // update flag text
    self.itemFlag.options.icon.updateText(self.name);

    // update flag position
    self.itemFlag.setLatLng(
         self.shape.getLatLng()
    );
};
