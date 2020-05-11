const Router = require('koa-router');
const fs = require('fs');

const Cloudinary = require('../middleware/cloudinary');

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

router.put('/update/user', async (ctx, next) => {
  const filesKeys = Object.keys(ctx.request.files || {});
  let query = {};

  Object.keys(ctx.request.body).forEach(key => {
    try {
      query[key] = JSON.parse(ctx.request.body[key]);
    } catch (err) {
      query[key] = ctx.request.body[key];
    }
  });

  if (!query.userId) {
    ctx.throw(404, "Any user not found!");
  }

  for (let i = 0; i < filesKeys.length; i++) {
    if (User.schema.obj.hasOwnProperty(filesKeys[i])) {
      const img = await Cloudinary.uploadImage(ctx.request.files[filesKeys[i]].path)

      query[filesKeys[i]] = img.secure_url;
    }
  }

  filesKeys.forEach((file, i) => {
    fs.unlinkSync(ctx.request.files[file].path, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  const userId = query.userId;
  delete query.userId;

  try {
    if (query.personalInfo.childrensCount && query.personalInfo.childrensCount > 0) {
      query.personalInfo.childrens = true;
    }
  } catch (e) {}


  console.log(query);

  const oldUser = await User.findById(userId);
  const newUser = await User.findByIdAndUpdate(userId, {
    ...query,
    personalInfo: Object.assign(oldUser.personalInfo, {...query.personalInfo}),
    workInfo: Object.assign(oldUser.workInfo, {...query.workInfo})
  }, { new: true });

  console.log(newUser);
  ctx.body = newUser;

  await next();
});

module.exports = router;
