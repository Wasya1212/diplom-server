const Router = require('koa-router');

const router = new Router();

router.post('/login', async (ctx, next) => {
  console.log(ctx.request.body);

  ctx.body = ctx.request.body;

  await next();  
});

module.exports = router;
