const Router = require('koa-router');

const { User } = require('../models');

const router = new Router();

router.get('/users', async (ctx, next) => {
  const user = await User.find({});

  ctx.type = 'json';
  ctx.body = user;

  await next();
});

router.post('/user', async (ctx, next) => {


  await next();
});

router.put('/user', async (ctx, next) => {
  console.log(ctx.request.files);
  console.log(ctx.request.body);
  ctx.body = {};
  await next();
});

module.exports = router;
