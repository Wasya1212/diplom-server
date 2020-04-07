const Passport = require('koa-passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const jwtsecret = "mysecretkey";

const { User } = require('../models/index');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtsecret
};

Passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  function (email, password, done) {
    console.log("email:", email)
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

module.exports = Passport;
