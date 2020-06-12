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

module.exports = router;
