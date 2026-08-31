import request from 'supertest';
import app from '../app';
import { sendVerificationEmail } from '../services/email.service';

describe('Auth API', () => {
  it('should register a new user and return success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(sendVerificationEmail).toHaveBeenCalled();
  });

  it('should verify email with token from email service', async () => {
    // Mock implementation to capture token
    let verificationToken = '';
    (sendVerificationEmail as jest.Mock).mockImplementation((email, token) => {
      verificationToken = token;
      return Promise.resolve();
    });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'verify@example.com',
        password: 'Password123',
      });

    expect(registerRes.status).toBe(201);

    const verifyRes = await request(app)
      .get(`/api/auth/verify-email?token=${verificationToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
  });

  it('should login with correct credentials', async () => {
    // Create a verified user directly
    const { createTestUser } = require('./helpers');
    await createTestUser({ email: 'login@example.com', password: 'Password123', isVerified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});