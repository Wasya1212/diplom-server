const { Schema, Model, Types } = require('../middleware/mongoose');

const unpredictableSituationSchema = new Schema({
  routeId: { required: true, type: Types.ObjectId },
  description: { required: true, type: Types.String },
  photos: [ Types.Url ],
  location: { lat: Types.Number, lng: Types.Number }
});

const unpredictableSituationModel = new Model('UnpredictableSituation', unpredictableSituationSchema);

module.exports = unpredictableSituationModel.create();
