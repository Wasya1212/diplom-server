const Passport = require('koa-passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const jwt = require('jsonwebtoken');
const Session = require('koa-session2');
const { destroySession } = require('./mongoose');

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

      console.log("USER CHECK PASSWORD VALID:", user.checkPassword(password))

      if (!user || !user.checkPassword(password)) {
      // if (!user) {
        console.log('Нет такого пользователя или пароль неверен.')
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
      console.log("PAYLOAD:", payload)
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
      if (user == false || !user) {
        ctx.status = 404;
        ctx.body = "Login failed";
      } else {
        const token = jwt.sign({ id: user._id, email: user.email }, jwtsecret);

        if (ctx.session) {
          ctx.session.token = token;
        }

        ctx.state.user = user;
        ctx.body = { user: user, token: token };
      }
    })(ctx, next);
  },
  logout: async (ctx) => {
    const sid = ctx.cookies.get('ppa:ogloni.igs');

    delete ctx.state.user;

    if (sid) {
      await destroySession(sid)
        .then(() => {
          ctx.cookies.set('ppa:ogloni.igs', null, {expires: 0});
        });
    }
  },
  checkAuthentication: async (ctx, next, opts = {}) => {
    const { success, failure } = opts;

    if (!ctx.session || ctx.headers.authorization && ctx.headers.authorization != 'undefined') {
      console.log("JWT AUTH///...", ctx.headers.authorization)
      await Passport.authenticate('jwt', { session: false }, function (err, user) {
        if (user) {
          // ctx.body = "hello " + user.email;
          if (success) {
            ctx.state.user = user;
            success({user, token: ctx.session.token});
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
        ctx.state.user = user;
        success({user, token: ctx.session.token});
      }
    } else {
      if (failure) {
        failure();
      }
    }

    // if (ctx.method !== "GET") {
      await next();
    // }
  }
};
