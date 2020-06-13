const Router = require('koa-router');

const { Feature } = require('../models/index');

const router = new Router();

router.post('/feature', async (ctx, next) => {
  // const { owner, user,  }
});

router.get('/worker/features', async (ctx, next) => {
  const feature = await Feature.findOne({ user: ctx.request.query.workerId || "" });
  ctx.body = feature.permissions;
});

router.post('/worker/feature', async (ctx, next) => {
  const features = await Feature.findOneAndUpdate(
    { user:ctx.request.body.workerId || "" },
    { permissions: ctx.request.body.features },
    { new: true }
  );

  ctx.body = features.permissions;
});

module.exports = router;
