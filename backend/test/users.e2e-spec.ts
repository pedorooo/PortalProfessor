import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Users Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Setup', () => {
    it('should register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'profile-test@example.com',
          password: 'SecurePass123!',
          name: 'Profile Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'profile-test@example.com');
      userId = response.body.id;
    });

    it('should login user and return access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile-test@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      accessToken = response.body.accessToken;
    });
  });

  describe('GET /users/profile', () => {
    it('should return authenticated user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'profile-test@example.com');
      expect(response.body).toHaveProperty('name', 'Profile Test User');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 400 when token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/users/profile');

      expect(response.status).toBe(400);
    });

    it('should return 400 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(400);
    });

    it('should return 400 when Authorization header has wrong format', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Basic ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user name', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('email', 'profile-test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject empty name', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
        });

      expect(response.status).toBe(400);
    });

    it('should allow optional name field (no update)', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should return 400 when token is missing', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .send({
          name: 'Some Name',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          name: 'Some Name',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /users/:userId', () => {
    it('should return public user profile by ID', async () => {
      const response = await request(app.getHttpServer()).get(
        `/users/${userId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'profile-test@example.com');
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer()).get('/users/999999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app.getHttpServer()).get(
        '/users/not-a-number',
      );

      expect(response.status).toBe(400);
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/users/${userId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
    });
  });
});
