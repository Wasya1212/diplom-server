const Passport = require('koa-passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const jwt = require('jsonwebtoken');

const jwtsecret = "mysecretkey";

const { User } = require('../models/index');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: jwtsecret
};

Passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  function (email, password, done) {
    // console.log("email:", email)
    User.findOne({email}, (err, user) => {
      if (err) {
        return done(err);
      }

      // if (!user || !user.checkPassword(password)) {
      if (!user) {
        return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
      }
      return done(null, user);
    });
  }
  )
);

Passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
  console.log("payload:", payload)
    User.findById(payload.id, (err, user) => {
      if (err) {
        return done(err)
      }
      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
  })
);

// Passport.serializeUser(function(user, done) {
//   done(null, user._id)
// })
//
// Passport.deserializeUser(function(id, done) {
//   User.findById(id, done);
// })

module.exports = {
  Passport,
  session: () => {
    return Passport.session();
  },
  initialize: () => {
    return Passport.initialize();
  },
  login: async (ctx, next) => {
    await Passport.authenticate('local', function (err, user) {
      if (user == false) {
        ctx.body = "Login failed";
      } else {
        const token = jwt.sign({ id: user._id, email: user.email }, jwtsecret);

        if (ctx.session) {
          ctx.session.token = token;
        }

        ctx.body = { user: user, token: token };
      }
    })(ctx, next);
  },
  logout: async (ctx) => {
    console.log('destroy session'); // add blacklist in mongodb чистити чорний список токенів кожного дня
    ctx.session.destroy('ppa:ogloni.igs');
    ctx.status = 200;
  },
  checkAuthentication: async (ctx, next, opts = {}) => {
    const { success, failure } = opts;

    console.log(ctx.headers)

    if (!ctx.session || ctx.headers.authorization) {
      console.log("JWT AUTH///...")
      await Passport.authenticate('jwt', { session: false }, function (err, user) {
        if (user) {
          // ctx.body = "hello " + user.email;
          if (success) {
            success(user);
          }
        } else {
          // ctx.body = "No such user";
          if (failure) {
            failure();
          }
          // console.log("err", err)
        }
      } )(ctx, next);
    } else if (ctx.session.token) {
      if (success) {
        let user = {};

        try {
          let userID = jwt.verify(ctx.session.token, jwtsecret).id;
          user = await User.findById(userID);
        } catch (err) {
          console.error(err);
        }

        // console.log("TOKEN:", jwt.verify(ctx.session.token, jwtsecret));
        success(user);
      }
    } else {
      if (failure) {
        failure();
      }
    }

    if (ctx.method !== "GET") {
      await next();
    }
  }
};
