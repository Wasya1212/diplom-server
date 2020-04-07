const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const passport = require('../middleware/passport');

const { User, Feature } = require('../models/index');

const router = new Router();

const jwtsecret = "mysecretkey";

router.post('/login', async(ctx, next) => {
  await passport.authenticate('local', function (err, user) {
    if (user == false) {
      ctx.body = "Login failed";
    } else {
      const payload = {
        id: user._id,
        email: user.email
      };
      console.log(payload)

      const token = jwt.sign(payload, jwtsecret); //здесь создается JWT

      ctx.body = {user: user.email, token: "JWT " + token};
    }
  })(ctx, next);
});

router.get('/ss', async (ctx, next) => {
  await passport.authenticate('jwt', { session: false }, function (err, user) {
    if (user) {
      ctx.body = "hello " + user.email;
    } else {
      ctx.body = "No such user";
      console.log("err", err)
    }
  } )(ctx, next);
});

// router.post('/login', async (ctx, next) => {
//   const { login, password } = ctx.request.body;
//
//   const user = await User.findOne({ $or: [{ email: login }, { phone: login }] });
//
//   if (user.password !== password) {
//     ctx.throw(404, "user not found");
//   } else {
//     ctx.body = user;
//   }
//
//   await next();
// });

router.post('/sign-up', async (ctx, next) => {
  const {
    fName,
    mName,
    lName,
    email,
    password,
    phone,
    isWorker
  } = ctx.request.body;

  console.log("is worker", isWorker);

  const newUser = await User.create({
    name: { fName, mName, lName },
    email,
    password,
    phone,
    workInfo: isWorker ? { additionalInfo: { worker: true } } : undefined
  });

  ctx.body = newUser;

  await next();
});

module.exports = router;
