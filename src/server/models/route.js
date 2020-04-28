const { Schema, Model, Types } = require('../middleware/mongoose');

const routeSchema = new Schema({
  users: [{ required: true, type: Types.ObjectId }],
  date: Types.Date,
  orders: [{ required: true, type: Types.ObjectId }],
  waypoints: [{ lat: Types.Number, lng: Types.Number }],
  plannedRoute: { required: false, type: Types.String },
  currentRoute: { required: false, type: Types.String },
  timeline: [{
    waypoint: { lat: Types.Number, lng: Types.Number },
    date: Types.String,
    time: Types.String,
    speed: { required: false, type: Types.Number }
  }],
  car: Types.ObjectId
}, {
  timestamps: true
});

const routeModel = new Model('Route', routeSchema)

module.exports = routeModel.create();
