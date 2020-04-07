const Koa = require('koa');
const Morgan = require('koa-morgan');
const BodyParser = require('koa-body');
const Serve = require('koa-static');
const Session = require('koa-session');
const Cors = require('@koa/cors');

const Logger = require('./middleware/logger');
const Passport = require('./middleware/passport');
const ErrorHandler = require('./middleware/error-handler');

const { UserRouter, AuthRouter } = require('./routes');

const app = new Koa();

app.keys = ['secret'];

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(Cors());
app.use(Serve(__dirname + '/dist/public/'));
app.use(Morgan('combined', { stream: Logger.stream }));
app.use(ErrorHandler({ errorLogger: Logger, logMethodName: 'error' }));
app.use(BodyParser({
  formidable: {
    uploadDir: __dirname + '/uploads',
    keepExtensions: true
  },
  multipart: true,
  urlencoded: true
}));

app.use(Session({}, app));

app.use(Passport.initialize())
app.use(Passport.session())

app.use(UserRouter.routes());
app.use(UserRouter.allowedMethods());
app.use(AuthRouter.routes());
app.use(AuthRouter.allowedMethods());

app.on('error', (err, ctx) => {
  if (err.statusCode !== 500) {
    console.log('User Error!');
  }
});

module.exports = app;
