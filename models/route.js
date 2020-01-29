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
