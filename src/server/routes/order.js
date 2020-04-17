const Router = require('koa-router');
const fs = require('fs');

const Cloudinary = require('../middleware/cloudinary');

const { Order, Project } = require('../models');

const router = new Router();

router.get('/orders', async (ctx) => {
  ctx.body = await Order.find({ project: ctx.request.query.projectId });
});

router.post('/order/create', async (ctx) => {
  ctx.body = await Order.create({
    project: ctx.request.body.projectId,
    workers: ctx.request.body.workers,
    address: ctx.request.body.address,
    pointOnMap: ctx.request.body.coordinates,
    description: ctx.request.body.description,
    deliveryDate: ctx.request.body.deliveryDate,
    products: ctx.request.body.products,
    operator: ctx.state.user
  });
});

module.exports = router;
