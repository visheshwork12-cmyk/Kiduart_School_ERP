// import { config } from "dotenv";
import 'dotenv/config';
import logger from "#config/logger.js";
import local from "#config/env/local.js";
import development from "#config/env/development.js";
import staging from "#config/env/staging.js";
import production from "#config/env/production.js";

const configs = { local, development, staging, production };

const currentEnv = process.env.NODE_ENV || "local";

if (!configs[currentEnv]) {
  logger.error(`Invalid NODE_ENV: ${currentEnv}`);
  throw new Error("Invalid environment");
}

const appConfig = {
  env: currentEnv,
  port: Number(process.env.PORT) || configs[currentEnv].port,
  dbUri: process.env.DB_URI,
  redisUri: process.env.REDIS_URI,
  baseUrl: process.env.BASE_URL,
  jwt: {
    accessSecret: process.env.JWT_SECRET || "change_me_access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    issuer: process.env.JWT_ISSUER || "school-erp",
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  ...configs[currentEnv],
};

// console.log('appConfig:', JSON.stringify(appConfig, null, 2));

// // Validate critical keys
// const required = ["dbUri", "redisUri", "jwt.accessSecret", "jwt.refreshSecret"];
// required.forEach((key) => {
//   if (!appConfig[key]) throw new Error(`Missing config: ${key}`);
// });

const requiredKeys = [
  { path: ['jwt', 'accessSecret'], name: 'jwt.accessSecret' },
  { path: ['dbUri'], name: 'dbUri' },
  { path: ['redisUri'], name: 'redisUri' },
  { path: ['jwt', 'refreshSecret'], name: 'jwt.refreshSecret' },
  // other keys
];
requiredKeys.forEach(({ path, name }) => {
  let value = appConfig;
  for (const key of path) {
    value = value?.[key];
    if (!value) throw new Error(`Missing config: ${name}`);
  }
});

console.info(`Loaded config for ${currentEnv}`);

export default appConfig;
