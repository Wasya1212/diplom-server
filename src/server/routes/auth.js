const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;

const passport = require('../middleware/passport');

const { User, Feature, Project } = require('../models/index');

const router = new Router();

const jwtsecret = "mysecretkey";

// router.post('/login', async(ctx, next) => {
//   await passport.authenticate('local', function (err, user) {
//     if (user == false) {
//       ctx.body = "Login failed";
//     } else {
//       const payload = {
//         id: user._id,
//         email: user.email
//       };
//       console.log(payload)
//
//       const token = jwt.sign(payload, jwtsecret);
//
//       console.log("SECRET TOKEN:", token)
//
//       ctx.session.token = token;
//
//       ctx.body = {user: user, token: "JWT " + token};
//     }
//   })(ctx, next);
// });


router.post('/login', async (ctx) => {
  await passport.login(ctx);
});

router.get('/login', async (ctx, next) => {
  await passport.checkAuthentication(ctx, next, {
    success: () => {
      ctx.redirect('/profile');
    }
  });
}, async (ctx) => {
  // console.log("SESSION DATA:", ctx.session.token);
  ctx.type = "html";
  ctx.body = fs.readFileSync(path.resolve(__dirname, '../../../dist/public/html/index.html'));
});

router.get('/sign-up', async (ctx, next) => {
  ctx.type = "html";
  ctx.body = fs.readFileSync(path.resolve(__dirname, '../../../dist/public/html/index.html'));
});

router.post('/authenticate', async (ctx, next) => {
  console.log('axios')
  await passport.checkAuthentication(ctx, next, {
    success: (user) => {
      console.log('finded user', user)
      ctx.status = 200;
      ctx.body = user;
    },
    failure: () => {
      console.log('no finded user')
      ctx.throw(401, 'Unauthorized');
    },
    withoutSession: true
  });
});

// router.all('/*', async (ctx, next) => {
//   // console.log("SESSION DATA:", ctx.session);
//   await passport.authenticate('jwt', { session: false }, function (err, user) {
//     if (user) {
//       ctx.body = "hello " + user.email;
//     } else {
//       ctx.body = "No such user";
//       console.log("err", err)
//     }
//   } )(ctx, next);
// });

router.post('/sign-up', async (ctx) => {
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
    workInfo: isWorker ? { additionalInfo: { worker: true, workerID: uuidv4() } } : undefined
  });

  ctx.body = newUser;
});

router.get('/ss', async (ctx, next) => {
  await passport.Passport.authenticate('jwt', { session: false }, function (err, user) {
    if (user) {
      ctx.body = "hello " + user.email;
    } else {
      ctx.body = "No such user";
      console.log("err", err) // получаю вывод только здесь
    }
  } )(ctx, next);
});

router.get('/logout', async (ctx, next) => {
  await passport.logout(ctx);

  console.log('REDIRECT')
  ctx.redirect('/login');
  await next();
});

router.all('/*', async (ctx, next) => {
  console.log("all")
  await passport.checkAuthentication(ctx, next, {
    success: () => {
      console.log("AUTH!!!!!!")
    },
    failure: () => {
      console.log("NON AUTH")
      if (ctx.method === "GET") {
        ctx.redirect('/login');
      } else {
        ctx.throw(401, "Unauthorized!");
      }
    }
  });
});

router.get('/profile', async (ctx) => {
  ctx.type = "html";
  ctx.body = fs.readFileSync(path.resolve(__dirname, '../../../dist/public/html/index.html'));
});

router.get('/workers', async (ctx) => {
  ctx.body = await User.find({ "workInfo.additionalInfo.worker": true });
});

router.post('/worker/create', async (ctx) => {
  const worker = await User.findOne({
    "workInfo.additionalInfo.worker": true,
    "workInfo.additionalInfo.workerID": ctx.request.body.workerId,
  });

  const project = await Project.findOneAndUpdate({
    name: ctx.request.body.projectName,
    owner: ctx.state.user.id
  }, {
    $addToSet: { users: worker._id }
  }, {
    new: true
  });

  const feature = await Feature.create({
    featureTitle: `feature-${project._id}-${worker._id}`,
    featureOwner: ctx.state.user.id,
    user: worker._id,
    permissions: {
      userEdit: false,
      userStatistics: false,
      userMoving: false,
      userRoutes: false
    }
  });

  ctx.body = {worker, project, feature};
});

router.post('/project/create', async (ctx) => {
  console.log(ctx.state.user.id);
  const newProject = await Project.create({
    owner: ctx.state.user.id,
    name: ctx.request.body.name,
    users: [ctx.state.user.id],
    description: ctx.request.body.description
  });

  const newFeature = await Feature.create({
    featureTitle: `feature-${newProject._id}-${ctx.state.user.id}`,
    featureOwner: ctx.state.user.id,
    user: ctx.state.user.id
  });

  await User.findByIdAndUpdate(ctx.state.user.id, { $push: { projects: newProject._id } });

  ctx.body = {newProject, newFeature};
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



module.exports = router;
