const Router = require('koa-router');

const { User } = require('../models/index');

const router = new Router();

router.post('/login', async (ctx, next) => {
  const { login, password } = ctx.request.body;

  const user = await User.findOne({ $or: [{ email: login }, { phone: login }] });

  if (user.password !== password) {
    ctx.throw(404, "user not found");
  } else {
    ctx.body = user;
  }

  await next();
});

router.post('/sign-up', async (ctx, next) => {
  const {
    fName,
    mName,
    lName,
    email,
    password,
    phone
  } = ctx.request.body;

  const newUser = await User.create({
    name: { fName, mName, lName },
    email,
    password,
    phone
  });

  ctx.body = newUser;

  await next();
});

module.exports = router;
