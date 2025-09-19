const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const config = require('./config/env');
const { createSessionMiddleware } = require('./middleware/session');
const { attachAuthState } = require('./middleware/adminAuth');
const registerRoutes = require('./routes');

function buildAllowedOrigins() {
  const origins = new Set([
    config.webAppUrl,
    `http://localhost:${config.port}`,
    `http://127.0.0.1:${config.port}`,
    ...config.socket.allowedOrigins,
  ].filter(Boolean));

  if (config.socket.corsOrigin === '*') {
    origins.add('*');
  }

  return origins;
}

function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has('*') || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin tidak diizinkan oleh CORS'), false);
    },
    credentials: true,
  };

  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(createSessionMiddleware());
  app.use(attachAuthState);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  registerRoutes(app);

  return app;
}

function attachSocket(app, io) {
  app.set('io', io);
}

module.exports = {
  createApp,
  attachSocket,
  buildAllowedOrigins,
};
