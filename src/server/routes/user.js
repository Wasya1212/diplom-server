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
  const filesKeys = Object.keys(ctx.request.files);
  // console.log(ctx.request.body);

  let query = {};

  Object.keys(ctx.request.body).forEach(key => {
    try {
      query[key] = JSON.parse(ctx.request.body[key]);
    } catch (err) {
      query[key] = ctx.request.body[key];
    }
  });

  console.log(query)

  for (let i = 0; i < filesKeys.length; i++) {
    // console.log(User.schema.obj.hasOwnProperty(filesKeys[i]))
    if (User.schema.obj.hasOwnProperty(filesKeys[i])) {
      const img = await Cloudinary.uploadImage(ctx.request.files[filesKeys[i]].path)

      // console.log(img)

      query[filesKeys[i]] = img.secure_url;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(ctx.request.body.userId, query, { new: true });

  filesKeys.forEach((file, i) => {
    fs.unlink(ctx.request.files[file].path, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  ctx.body = updatedUser;

  // if (files.indexOf('picture') !== -1) {
  //   // const updatedUser = await User.update({ _id: ctx.request.body.userId }, ctx.request.body);
  //   const picture = await Cloudinary.uploadImage(ctx.request.files.picture.path);
  //   const updatedUser = await User.findByIdAndUpdate(ctx.request.body.userId, { photo: picture.secure_url }, { new: true });
  //
  //   files.forEach((file, i) => {
  //     fs.unlink(ctx.request.files[file].path, (err) => {
  //       if (err) {
  //         console.error(err);
  //       }
  //     });
  //   });
  //
  //   ctx.status = 200;
  //   ctx.body = updatedUser;
  // } else {
  //   ctx.throw("Can`t update user! Try again...")
  // }

  await next();
});

module.exports = router;
