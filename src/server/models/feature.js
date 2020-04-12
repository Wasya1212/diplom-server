const { Schema, Model, Types } = require('../middleware/mongoose');

const featureSchema = new Schema({
  featureTitle: { required: true, type: Types.String, unique: true },
  featureOwner: { required: true, type: Types.ObjectId },
  user: { required: true, type: Types.ObjectId },
  permissions: {
    userEdit: { required: true, type: Types.Boolean, default: true },
    userStatistics: { required: true, type: Types.Boolean, default: true },
    userMoving: { required: true, type: Types.Boolean, default: true },
    userRoutes: { required: true, type: Types.Boolean, default: true }
  }
});

const featureModel = new Model('Feature', featureSchema);

module.exports = featureModel.create();
