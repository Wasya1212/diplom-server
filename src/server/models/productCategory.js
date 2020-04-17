const { Schema, Model, Types } = require('../middleware/mongoose');

const productCategorySchema = new Schema({
  project: { required: true, type: Types.ObjectId },
  title: { required: true, type: Types.String, trim: true },
  productsCount: { required: false, type: Types.Number, default: 0 }
});

const productCategoryModel = new Model('ProductCategory', productCategorySchema);

module.exports = productCategoryModel.create();
