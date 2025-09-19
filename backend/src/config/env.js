const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..', '..');
const envFilename = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.join(projectRoot, envFilename);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const DEFAULT_SCHEDULE = {
  timezone: process.env.TIMEZONE || process.env.TZ || 'Asia/Jakarta',
  dailyTimes: {
    1: '15:59',
    2: '15:59',
    3: '15:59',
    4: '15:59',
    5: '16:29',
    6: null,
    7: null,
  },
  manualOverrides: [],
  paused: false,
  lastUpdatedAt: new Date(0).toISOString(),
  updatedBy: 'system',
};

const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

module.exports = {
  projectRoot,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  timezone: process.env.TIMEZONE || process.env.TZ || 'Asia/Jakarta',
  webAppUrl: process.env.WEB_APP_URL || 'http://localhost:5173',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    plainPassword: process.env.ADMIN_PASSWORD || '',
    sessionSecret: process.env.SESSION_SECRET || 'super-secret-session-key-change-me',
  },
  apiKeys: {
    control: process.env.CONTROL_API_KEY || process.env.API_KEY || '',
    public: process.env.PUBLIC_API_KEY || '',
  },
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*',
    allowedOrigins: parseOrigins(process.env.SOCKET_ALLOWED_ORIGINS),
  },
  scheduler: {
    defaultSchedule: DEFAULT_SCHEDULE,
    retryIntervalMs: parseInt(process.env.SCHEDULER_RETRY_INTERVAL_MS || '60000', 10),
    maxRetries: parseInt(process.env.SCHEDULER_MAX_RETRIES || '3', 10),
  },
};
