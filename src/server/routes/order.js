const Router = require('koa-router');
const fs = require('fs');

const Cloudinary = require('../middleware/cloudinary');

const { Order, Project, Product, User } = require('../models');

const router = new Router();

router.get('/orders', async (ctx) => {
  const query = {...ctx.request.query};
  delete query.projectId;

  const orders = await Order.find({ project: ctx.request.query.projectId, ...query });

  const responseOrders = [];

  for (let i = 0; i < orders.length; i++) {
    responseOrders.push({
      _id: orders[i]._id,
      project: orders[i].project,
      operator: await User.findById(orders[i].operator),
      workers: await User.find({ _id: { $in: orders[i].workers } }),
      pointOnMap: orders[i].pointOnMap,
      description: orders[i].description,
      products: (await Product.find({ _id: { $in: orders[i].products.map(p => p.productId) } })).map((p, index) => ({ product: p, count: orders[i].products[index].count })),
      deliveryDate: orders[i].deliveryDate,
      route: orders[i].route,
      status: orders[i].status,
      address: orders[i].address,
      number: orders[i].number
    });
  }

  ctx.body = responseOrders;
});

router.get('/order', async (ctx) => {
  const {projectId} = ctx.request.query;
  const query = {...ctx.request.query};

  delete query.projectId;

  if (query.id) {
    query._id = query.id;
    delete query.id;
  }

  const order = await Order.findOne({ project: projectId, ...query });
  const operator = await User.findById(order.operator);
  const workers = await User.find({ _id: { $in: order.workers } });
  const products = await Product.find({ _id: { $in: order.products.map(p => p.productId) } });

  const completeOrder = Object.assign(order._doc, {
    operator, workers,
    products: products.map((p, index) => ({ product: p, count: order.products[index].count }))
  });

  ctx.body = completeOrder;
});

router.post('/order/create', async (ctx) => {
  const order = await Order.create({
    project: ctx.request.body.projectId,
    workers: ctx.request.body.workers.map(w => w._parameters.id),
    address: ctx.request.body.address,
    pointOnMap: ctx.request.body.pointOnMap,
    description: ctx.request.body.description,
    deliveryDate: ctx.request.body.deliveryDate,
    products: ctx.request.body.products.map(p => ({
      productId: p.product._parameters.id,
      count: p.count
    })),
    operator: ctx.state.user
  });

  ctx.request.body.products.forEach(p => {
    Product.update(
      { _id: p.product._parameters.id, project: ctx.request.body.projectId },
      { $inc: { actualCount: -(p.count) } },
      { new: true },
      (err, prod) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });

  ctx.body = {order};
});

module.exports = router;
