const { Schema, Model, Types } = require('../middleware/mongoose');

const projectSchema = new Schema({
  owner: { required: true, type: Types.ObjectId },
  name: { required: true, type: Types.String, unique: true },
  users: [{ required: true, type: Types.ObjectId }],
  description: { required: false, type: Types.String, default: "" }
});

const projectModel = new Model('Project', projectSchema);

module.exports = projectModel.create();
