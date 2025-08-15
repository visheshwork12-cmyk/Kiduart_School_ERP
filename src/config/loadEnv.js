import dotenv from 'dotenv';

// Determine which .env file to load
const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envFile });
