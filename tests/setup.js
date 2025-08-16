// tests/setup.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Mock external services
jest.mock('redis');
jest.mock('nodemailer');
jest.mock('cloudinary');
jest.mock('twilio');

// Setup MongoDB in-memory server
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 3000;
process.env.PRODUCTION_API_URL = 'http://localhost:3000/api/v1';