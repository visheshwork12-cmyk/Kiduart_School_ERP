import logger from "#config/logger.js";
/**
 * Validate required environment variables
 * @throws {Error} If any required variable is missing
 */
const validateEnv = () => {
  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DB_URI",
    "REDIS_URI",
    "JWT_SECRET",
    "BASE_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "PRODUCTION_API_URL",
    "RATE_LIMIT_WINDOW_MS",
    "RATE_LIMIT_MAX",
  ];
  const missingVars = requiredVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
    throw new Error("Missing required environment variables");
  }
};

// Validate environment variables
validateEnv();

/**
 * Local environment configuration
 * @type {Object}
 */
export default {
  env: process.env.NODE_ENV || "local",
  port: Number(process.env.PORT) || 3000,
  dbUri: process.env.DB_URI,
  redisUri: process.env.REDIS_URI,
  jwtSecret: process.env.JWT_SECRET,
  baseUrl: process.env.BASE_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  productionApiUrl: process.env.PRODUCTION_API_URL,
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
    max: Number(process.env.RATE_LIMIT_MAX),
  },
  // TODO: Add additional local-specific configurations (e.g., debug flags)
};
