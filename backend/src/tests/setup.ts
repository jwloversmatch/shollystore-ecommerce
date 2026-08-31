/// <reference types="jest" />

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Mock external services so no real API calls/emails happen
jest.mock('../services/email.service', () => ({
  sendOrderConfirmation: jest.fn(),
  sendAdminOrderNotification: jest.fn(),
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendPasswordChangedEmail: jest.fn(),
  sendEmailChangeVerification: jest.fn(),
  sendContactNotification: jest.fn(),
}));

jest.mock('../services/marketingEmail.service', () => ({
  sendWelcomeEmail: jest.fn(),
}));

jest.mock('../config/paystack', () => ({
  paystack: {
    initializePayment: jest.fn().mockResolvedValue({
      status: true,
      data: { authorization_url: 'https://checkout.paystack.com/mock', reference: 'ref123' },
    }),
    verifyPayment: jest.fn().mockResolvedValue({ status: true, data: { status: 'success' } }),
    verifyWebhookSignature: jest.fn().mockReturnValue(true),
  },
  PaystackError: class PaystackError extends Error {},
  ValidationError: class ValidationError extends Error {},
}));

jest.mock('../middleware/rateLimiter', () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
  checkoutLimiter: (req: any, res: any, next: any) => next(),
}));

// Mock auth middleware to use a global test user
declare global {
  var __TEST_USER__: any;
}

jest.mock('../middleware/auth', () => ({
  protect: (req: any, res: any, next: any) => {
    req.user = global.__TEST_USER__;
    next();
  },
  admin: (req: any, res: any, next: any) => next(),
}));

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});