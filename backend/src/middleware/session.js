const session = require('express-session');
const config = require('../config/env');

function createSessionMiddleware() {
  return session({
    secret: config.admin.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
      maxAge: 1000 * 60 * 60 * 12, // 12 jam
    },
  });
}

module.exports = {
  createSessionMiddleware,
};
