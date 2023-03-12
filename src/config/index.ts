import { config } from 'dotenv';

// Local
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  COOKIE_SAMESITE,
  SESSION_TIME_MILLI,
  DEFAULT_PATH,
  FRONT_END_URL,
} = process.env;

// Mongo Database
config({ path: `.env.mongo.database` });
export const { MG_PORT, MG_URI } = process.env;

// Firebase Databse
config({ path: `.env.firebase.database` });
export const {
  FB_APIKEY,
  FB_AUTHDOMAIN,
  FB_PROJECTID,
  FB_STORAGEBUCKET,
  FB_MESSAGINGSENDERID,
  FB_APPID,
  FB_MEASUREMENTID,

  FB_GMAIL,
  FB_PASSWORD,
} = process.env;
