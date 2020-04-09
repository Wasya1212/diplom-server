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


  // console.log(ctx.request.body)
  // console.log(ctx.request.files)
  const filesKeys = Object.keys(ctx.request.files || {});
  // console.log(ctx.request.body);

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

  // const newUser = await User.findByIdAndUpdate(query.userId, query, { new: true });
  //
  // console.log(newUser);
  // ctx.body = {user: newUser};

  // console.log(query)

  for (let i = 0; i < filesKeys.length; i++) {
    // console.log(User.schema.obj.hasOwnProperty(filesKeys[i]))
    if (User.schema.obj.hasOwnProperty(filesKeys[i])) {
      const img = await Cloudinary.uploadImage(ctx.request.files[filesKeys[i]].path)

      // console.log(img)

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

  // console.log('findUser')
  // const users =  await User.find({});
  // console.log('users', users)
  // ctx.body = await User.findByIdAndUpdate(query.userId, query, { new: true });

  const newUser = await User.findByIdAndUpdate(query.userId, query, { new: true });
  //
  // console.log(newUser);
  ctx.body = newUser;

  await next();
});

module.exports = router;
