const Mongoose = require('mongoose');

const routeSchema = new Mongoose.Schema({
  title:  String,
  user: {
    type: Mongoose.Types.ObjectId,
    required: false
  },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = Mongoose.model('Route', routeSchema);


{ // додай маршрути в окрему таблицю
  date: Types.Date,
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
}
