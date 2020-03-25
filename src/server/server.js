const Koa = require('koa');
const Morgan = require('koa-morgan');
const BodyParser = require('koa-body');
const Serve = require('koa-static');

const Logger = require('./middleware/logger');
const ErrorHandler = require('./middleware/error-handler');

const { UserRouter } = require('./routes');

const app = new Koa();

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(Serve(__dirname + '/dist/public/'));
app.use(Morgan('combined', { stream: Logger.stream }));
app.use(ErrorHandler({ errorLogger: Logger, logMethodName: 'error' }));
app.use(BodyParser({
  formidable: {
    uploadDir: './uploads',
    keepExtensions: true
  },
  multipart: true,
  urlencoded: true
}));
app.use(UserRouter.routes());
app.use(UserRouter.allowedMethods());

app.on('error', (err, ctx) => {
  if (err.statusCode !== 500) {
    console.log('User Error!');
  }
});

module.exports = app;
