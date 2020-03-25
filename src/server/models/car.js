const { Schema, Model, Types } = require('../middleware/mongoose');

const carSchema = new Schema({
  images: Types.Url,
  carNumber: Types.String,
  carModel: Types.String,
  color: {required: false, types: Types.String},// do something}}
  currentStatus: Types.String, // v garasze...v poezdke... v pogruzke
  probeg: Types.Number,
  tehproverki: [{status: Types.Boolean, date: Types.Date}],
  remonti: [{price: Types.Number, date: Types.Date}],
  unpredictableSituations: [Types.ObjectId]
});

const carModel = new Model('Car', carSchema);

module.exports = carModel.create();
