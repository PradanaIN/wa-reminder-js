const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const moment = require('moment-timezone');
const { v4: uuid } = require('uuid');

const config = require('../config/env');

const STORAGE_DIR = path.resolve(__dirname, '..', '..', 'storage');
const CONFIG_FILENAME = 'schedule-config.json';
const CONFIG_PATH = path.join(STORAGE_DIR, CONFIG_FILENAME);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

const DEFAULT_SCHEDULE = {
  timezone: config.scheduler.defaultSchedule.timezone,
  dailyTimes: { ...config.scheduler.defaultSchedule.dailyTimes },
  manualOverrides: [],
  paused: false,
  lastUpdatedAt: new Date(0).toISOString(),
  updatedBy: 'system',
};

async function ensureStorage() {
  await fsp.mkdir(STORAGE_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG_PATH)) {
    await writeSchedule(DEFAULT_SCHEDULE);
  }
}

function sanitizeSchedule(raw) {
  const schedule = {
    ...DEFAULT_SCHEDULE,
    ...raw,
    dailyTimes: {
      ...DEFAULT_SCHEDULE.dailyTimes,
      ...(raw?.dailyTimes || {}),
    },
    manualOverrides: Array.isArray(raw?.manualOverrides)
      ? raw.manualOverrides
      : [],
  };

  schedule.manualOverrides = schedule.manualOverrides
    .map((item) => ({
      id: item.id || uuid(),
      date: item.date,
      time: item.time,
      note: item.note || null,
      createdAt: item.createdAt || new Date().toISOString(),
      createdBy: item.createdBy || 'unknown',
      consumedAt: item.consumedAt || null,
    }))
    .filter((item) => DATE_PATTERN.test(item.date) && TIME_PATTERN.test(item.time));

  return schedule;
}

async function readSchedule() {
  await ensureStorage();
  const raw = await fsp.readFile(CONFIG_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  return sanitizeSchedule(parsed);
}

async function writeSchedule(schedule) {
  const enriched = {
    ...sanitizeSchedule(schedule),
    lastUpdatedAt: new Date().toISOString(),
  };

  await ensureStorage();
  await fsp.writeFile(CONFIG_PATH, `${JSON.stringify(enriched, null, 2)}\n`, 'utf-8');
  return enriched;
}

function parseTimeToMoment(momentRef, timeString) {
  if (!TIME_PATTERN.test(timeString)) {
    throw new Error('Format waktu tidak valid. Gunakan HH:mm');
  }
  const [hour, minute] = timeString.split(':').map(Number);
  return momentRef
    .clone()
    .hour(hour)
    .minute(minute)
    .second(30)
    .millisecond(0);
}

function resolveDailyTime(schedule, weekday) {
  return schedule.dailyTimes[String(weekday)] ?? schedule.dailyTimes[weekday] ?? null;
}

function findActiveOverride(schedule, dateKey) {
  return schedule.manualOverrides.find(
    (item) => item.date === dateKey && !item.consumedAt
  );
}

function pruneOverrides(schedule, referenceMoment) {
  const keepThreshold = referenceMoment.clone().subtract(3, 'days').startOf('day');

  schedule.manualOverrides = schedule.manualOverrides.filter((item) => {
    const dateMoment = moment.tz(item.date, 'YYYY-MM-DD', schedule.timezone);
    if (!dateMoment.isValid()) return false;
    if (dateMoment.isBefore(keepThreshold)) return false;
    return true;
  });
}

async function getSchedule() {
  const schedule = await readSchedule();
  pruneOverrides(schedule, moment().tz(schedule.timezone));
  return schedule;
}

async function setSchedule(payload, options = {}) {
  const schedule = await getSchedule();

  if (typeof payload.paused === 'boolean') {
    schedule.paused = payload.paused;
  }

  if (payload.timezone) {
    schedule.timezone = payload.timezone;
  }

  if (payload.dailyTimes) {
    Object.entries(payload.dailyTimes).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        schedule.dailyTimes[key] = null;
        return;
      }

      if (!TIME_PATTERN.test(value)) {
        throw new Error(`Format waktu untuk hari ${key} tidak valid.`);
      }

      schedule.dailyTimes[key] = value;
    });
  }

  if (options.updatedBy) {
    schedule.updatedBy = options.updatedBy;
  }

  return writeSchedule(schedule);
}

async function addManualOverride({ date, time, note }, options = {}) {
  if (!DATE_PATTERN.test(date)) {
    throw new Error('Format tanggal harus YYYY-MM-DD');
  }
  if (!TIME_PATTERN.test(time)) {
    throw new Error('Format waktu harus HH:mm');
  }

  const schedule = await getSchedule();
  const timezone = schedule.timezone;
  const targetMoment = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', timezone);

  if (!targetMoment.isValid()) {
    throw new Error('Tanggal atau waktu tidak valid');
  }

  const existing = findActiveOverride(schedule, date);
  if (existing) {
    existing.time = time;
    existing.note = note || existing.note;
    existing.createdBy = options.updatedBy || existing.createdBy;
    existing.createdAt = existing.createdAt || new Date().toISOString();
  } else {
    schedule.manualOverrides.push({
      id: uuid(),
      date,
      time,
      note: note || null,
      createdAt: new Date().toISOString(),
      createdBy: options.updatedBy || 'admin',
      consumedAt: null,
    });
  }

  schedule.manualOverrides.sort((a, b) => (a.date < b.date ? -1 : 1));
  schedule.updatedBy = options.updatedBy || schedule.updatedBy;

  return writeSchedule(schedule);
}

async function removeManualOverride(date) {
  const schedule = await getSchedule();
  schedule.manualOverrides = schedule.manualOverrides.filter((item) => item.date !== date);
  return writeSchedule(schedule);
}

async function consumeManualOverride(date) {
  const schedule = await getSchedule();
  const override = findActiveOverride(schedule, date);
  if (override) {
    override.consumedAt = new Date().toISOString();
    await writeSchedule(schedule);
  }
}

async function getNextRun({ referenceMoment = moment().tz(config.timezone), includeDetails = false } = {}) {
  const schedule = await getSchedule();
  const tzReference = referenceMoment.clone().tz(schedule.timezone);

  if (schedule.paused) {
    const override = schedule.manualOverrides.find((item) => {
      const target = moment.tz(`${item.date} ${item.time}`, 'YYYY-MM-DD HH:mm', schedule.timezone);
      return target.isAfter(tzReference) && !item.consumedAt;
    });

    if (!override) {
      return null;
    }

    const targetMoment = parseTimeToMoment(
      moment.tz(override.date, 'YYYY-MM-DD', schedule.timezone),
      override.time
    );

    return {
      schedule,
      override,
      targetMoment,
    };
  }

  let cursor = tzReference.clone();
  for (let i = 0; i < 21; i += 1) {
    const dateKey = cursor.format('YYYY-MM-DD');
    const override = findActiveOverride(schedule, dateKey);

    if (override) {
      const targetMoment = parseTimeToMoment(cursor, override.time);
      if (targetMoment.isAfter(tzReference)) {
        return {
          schedule,
          override,
          targetMoment,
        };
      }
      cursor = cursor.add(1, 'day').startOf('day');
      continue;
    }

    const weekday = cursor.isoWeekday();
    const defaultTime = resolveDailyTime(schedule, weekday);
    if (!defaultTime) {
      cursor = cursor.add(1, 'day').startOf('day');
      continue;
    }

    const targetMoment = parseTimeToMoment(cursor, defaultTime);
    if (targetMoment.isAfter(tzReference)) {
      return {
        schedule,
        override: null,
        targetMoment,
      };
    }

    cursor = cursor.add(1, 'day').startOf('day');
  }

  return includeDetails ? { schedule, override: null, targetMoment: null } : null;
}

module.exports = {
  getSchedule,
  setSchedule,
  addManualOverride,
  removeManualOverride,
  consumeManualOverride,
  getNextRun,
};
