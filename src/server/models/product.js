const { Schema, Model, Types } = require('../middleware/mongoose');

const productSchema = new Schema({
  project: { required: true, type: Types.ObjectId },
  code: { required: true, type: Types.Number },
  name: { required: true, type: Types.String, trim: true },
  category: { required: true, type: Types.String, trim: true },
  actualCount: { required: false, type: Types.Number, default: 0 },
  reserved: { required: false, type: Types.Number, default: 0 }
});

const productModel = new Model('Product', productSchema);

module.exports = productModel.create();
