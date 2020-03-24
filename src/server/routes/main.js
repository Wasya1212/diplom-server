const Fs = require('fs');
const Path = require('path');

const Router = require('koa-router');

const RouteModel = require('../models/route');

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.type = 'html';
  ctx.body = Fs.createReadStream(Path.resolve(__dirname, '../public/index.html'));

  await next();
});

router.get('/map', async (ctx, next) => {
  ctx.type = 'html';
  ctx.body = Fs.createReadStream(Path.resolve(__dirname, '../dist/public/html/index.html'));

  await next();
});

router.get('/ddd', async (ctx, next) => {
  ctx.type = 'html';
  ctx.body = Fs.createReadStream(Path.resolve(__dirname, '../public/demo.html'));

  await next();
});

router.post('/', async ctx => {
  ctx.body = await new RouteModel({ title: `Route #${Date.now()}` }).save();
});

module.exports = router;
