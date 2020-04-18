const Router = require('koa-router');
const fs = require('fs');

const Cloudinary = require('../middleware/cloudinary');

const { Product, ProductCategory, Project } = require('../models');

const router = new Router();

router.all('/*', async (ctx, next) => {
  const projectId = ctx.request.body.projectId || ctx.request.query.projectId;

  if (projectId) {
    const project = await Project.findOne({
      owner: ctx.state.user._id,
      _id: projectId
    });

    if (!project) {
      ctx.throw(404, "Cannot find user project.");
    } else {
      await next()
    }
  } else {
    await next();
  }
});

router.get('/products', async (ctx) => {
  console.log('ctx.request.query.projectId', ctx.request.query.projectId)
  ctx.body = await Product.find({ project: ctx.request.query.projectId });
});

router.post('/product/add', async (ctx) => {
  const { name, code, category, projectId, count } = ctx.request.body;

  const newProduct = await Product.update(
    { name, code, project: projectId },
    {
      $set: { code, name, category },
      $inc: { actualCount: count || 0 }
    },
    { upsert: true, new: true }
  );

  const productCategory = await ProductCategory.update(
    { project: projectId, title: category },
    {
      $set: { project: projectId, title: category },
      $inc: { productsCount: count || 0 }
    },
    { upsert: true, new: true }
  );

  console.log(newProduct)

  ctx.body = { product: newProduct };
});

module.exports = router;
