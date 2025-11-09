jest.mock('bcrypt', () => ({ compare: jest.fn() }));
jest.mock('node:crypto', () => {
  const actual = jest.requireActual('node:crypto');
  return { ...actual, randomBytes: jest.fn(() => Buffer.from('aa', 'hex')) };
});

import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import * as crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';

describe('AuthService (unit)', () => {
  let service: AuthService;
  const mockUsersService: any = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
  };
  const mockPrisma: any = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(mockUsersService, mockPrisma);
  });

  describe('validateUser', () => {
    it('returns public user when password matches', async () => {
      const dbUser = {
        id: 1,
        email: 'a@a.com',
        passwordHash: 'hashed',
        name: 'A',
        role: 'STUDENT',
      } as any;
      mockUsersService.findByEmail.mockResolvedValue(dbUser);
      (bcrypt as any).compare.mockResolvedValue(true as any);

      const result = await service.validateUser('a@a.com', 'pw');
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
      expect((result as any).email).toEqual(dbUser.email);
    });

    it('returns null when user not found or password wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const r1 = await service.validateUser('x', 'y');
      expect(r1).toBeNull();

      mockUsersService.findByEmail.mockResolvedValue({ passwordHash: 'h' });
      (bcrypt as any).compare.mockResolvedValue(false as any);
      const r2 = await service.validateUser('x', 'y');
      expect(r2).toBeNull();
    });
  });

  describe('login', () => {
    it('creates a refresh token record and returns tokens', async () => {
      const publicUser = {
        id: 11,
        email: 'u@u',
        role: 'ADMIN',
        name: 'T',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      jest.spyOn(jwt, 'sign').mockReturnValue('signed-access' as any);
      (crypto as any).randomBytes.mockImplementation(() =>
        Buffer.from('aa', 'hex'),
      );
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 1 });

      const res = await service.login(publicUser);

      expect(res.accessToken).toEqual('signed-access');
      expect(res.refreshToken).toEqual(
        Buffer.from('aa', 'hex').toString('hex'),
      );
      expect(res.expiresAt).toBeInstanceOf(Date);

      const expectedHash = createHash('sha256')
        .update(res.refreshToken)
        .digest('hex');
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tokenHash: expectedHash,
            userId: publicUser.id,
          }),
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('rotates token and returns new access + refresh', async () => {
      const oldToken = 'oldtok';
      const oldHash = createHash('sha256').update(oldToken).digest('hex');
      const tokenRecord = {
        id: 333,
        tokenHash: oldHash,
        userId: 22,
        revoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      mockPrisma.refreshToken.findUnique.mockResolvedValue(tokenRecord);
      mockUsersService.findById.mockResolvedValue({
        id: 22,
        email: 'u',
        role: 'STUDENT',
      });
      mockPrisma.refreshToken.update.mockResolvedValue({
        ...tokenRecord,
        revoked: true,
      });

      (crypto as any).randomBytes.mockImplementation(() =>
        Buffer.from('bb', 'hex'),
      );
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 444 });
      jest.spyOn(jwt, 'sign').mockReturnValue('new-access' as any);

      const out = await service.refreshToken(oldToken);
      expect(out.accessToken).toEqual('new-access');
      expect(out.refreshToken).toEqual(
        Buffer.from('bb', 'hex').toString('hex'),
      );

      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      const expectedNewHash = createHash('sha256')
        .update(out.refreshToken)
        .digest('hex');
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tokenHash: expectedNewHash,
            userId: 22,
          }),
        }),
      );
    });

    it('throws UnauthorizedException for invalid token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refreshToken('unknown')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('returns true when token found and revoked', async () => {
      const t = 'tok';
      const h = createHash('sha256').update(t).digest('hex');
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 7,
        tokenHash: h,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({
        id: 7,
        revoked: true,
      });
      const r = await service.revokeRefreshToken(t);
      expect(r).toBe(true);
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
    });

    it('returns false when token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      const r = await service.revokeRefreshToken('nope');
      expect(r).toBe(false);
    });
  });
});
