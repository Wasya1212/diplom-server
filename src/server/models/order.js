const { Schema, Model, Types } = require('../middleware/mongoose');

const orderSchema = new Schema({
  project: { required: true, type: Types.ObjectId },
  oprator: { required: true, type: Types.ObjectId },
  workers: [{ required: true, type: Types.ObjectId }],
  address: { required: true, type: Types.String, trim: true },
  pointOnMap: {
    lng: { required: true, type: Types.Number },
    lat: { required: true, type: Types.Number }
  },
  description: { required: false, type: Types.String, default: "", trim: true },
  products: [{
    productId: { required: true, type: Types.ObjectId },
    count: { required: true, type: Types.Number }
  }],
  deliveryDate: { required: true, type: Types.Date },
  route: { required: false, type: Types.ObjectId },
  status: { required: false, type: Types.String, default: "processing" }
});

const orderModel = new Model('Order', orderSchema);

module.exports = orderModel.create();