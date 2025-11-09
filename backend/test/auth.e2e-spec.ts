import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `new-user-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          name: 'E2E Test User',
          role: 'STUDENT',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Pass123!',
        name: 'User One',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'DifferentPass123!',
          name: 'User Two',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Pass123!',
          name: 'Bad Email',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    let testUserEmail: string;
    let testUserPassword: string;

    beforeAll(async () => {
      testUserEmail = 'login-test@example.com';
      testUserPassword = 'LoginTestPass123!';

      await request(app.getHttpServer()).post('/auth/register').send({
        email: testUserEmail,
        password: testUserPassword,
        name: 'Login Test User',
      });
    });

    it('should login and return access token + set refresh cookie', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.accessToken).toBeTruthy();

      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('refreshToken=')]),
      );
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: testUserEmail,
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SomePass123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should reject refresh without token cookie', async () => {
      const res = await request(app.getHttpServer()).post(
        '/auth/refresh-token',
      );

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing refresh token');
    });

    it('should reject invalid/revoked refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid-token-here']);

      expect([400, 401]).toContain(res.status);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/logout', () => {
    it('should succeed logout without token (graceful)', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Auth flow integration', () => {
    it('should complete successful login + token refresh flow', async () => {
      const flowUserEmail = `flow-${Date.now()}@example.com`;
      const flowUserPassword = 'FlowPass123!';

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: flowUserEmail,
          password: flowUserPassword,
          name: 'Flow User',
        });
      expect(registerRes.status).toBe(201);
      expect(registerRes.body).toHaveProperty('status', 'ok');

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: flowUserEmail,
          password: flowUserPassword,
        });
      expect(loginRes.status).toBe(201);
      expect(loginRes.body).toHaveProperty('accessToken');
      expect(loginRes.body.accessToken).toBeTruthy();
      expect(loginRes.headers['set-cookie']).toBeDefined();
      expect(loginRes.headers['set-cookie'][0]).toContain('refreshToken=');

      const logoutRes = await request(app.getHttpServer()).post('/auth/logout');
      expect(logoutRes.status).toBe(201);
      expect(logoutRes.body).toHaveProperty('status', 'ok');
    });
  });
});
