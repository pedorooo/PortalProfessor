import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, type PublicUser } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'STUDENT' as Role,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUserWithoutPassword: PublicUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT' as Role,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should call findUnique with correct user id', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await service.findById(42);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
      });
    });
  });

  describe('toPublicProfile', () => {
    it('should convert user to public profile by removing passwordHash', () => {
      const result = service.toPublicProfile(mockUser);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null when user is null', () => {
      const result = service.toPublicProfile(null);

      expect(result).toBeNull();
    });

    it('should preserve all public fields', () => {
      const result = service.toPublicProfile(mockUser);

      expect(result?.id).toBe(mockUser.id);
      expect(result?.email).toBe(mockUser.email);
      expect(result?.name).toBe(mockUser.name);
      expect(result?.role).toBe(mockUser.role);
      expect(result?.createdAt).toEqual(mockUser.createdAt);
      expect(result?.updatedAt).toEqual(mockUser.updatedAt);
    });

    it('should not include passwordHash in the result', () => {
      const result = service.toPublicProfile(mockUser);

      expect(Object.keys(result as object)).not.toContain('passwordHash');
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, { name: 'Updated Name' });

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name' },
      });
    });

    it('should update user phone', async () => {
      const updatedUser = { ...mockUser };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      await service.updateProfile(1, { phone: '+55 11 99999-9999' });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { phone: '+55 11 99999-9999' },
      });
    });

    it('should update both name and phone', async () => {
      const updatedUser = { ...mockUser, name: 'New Name' };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      await service.updateProfile(1, {
        name: 'New Name',
        phone: '+55 11 88888-8888',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New Name', phone: '+55 11 88888-8888' },
      });
    });

    it('should not update when DTO is empty', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.updateProfile(1, {});

      expect(result).toEqual(mockUser);
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should not include undefined fields in update data', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      await service.updateProfile(1, { name: 'New Name', phone: undefined });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New Name' },
      });
    });

    it('should handle updating with only name field defined', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      await service.updateProfile(1, { name: 'Only Name' });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Only Name' },
      });
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('should handle updating with only phone field defined', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      await service.updateProfile(1, { phone: 'Only Phone' });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { phone: 'Only Phone' },
      });
    });

    it('should call findById when no fields need updating', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);

      const result = await service.updateProfile(1, {});

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should be case-sensitive for email lookup', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await service.findByEmail('TEST@EXAMPLE.COM');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
      });
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
    });

    it('should create user with all required fields', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.createUser(
        'test@example.com',
        'password123',
        'Test User',
        'STUDENT',
      );

      expect(result).toEqual(mockUserWithoutPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: '$2b$10$hashedpassword',
          name: 'Test User',
          role: 'STUDENT',
        },
      });
    });

    it('should hash password before storing', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      await service.createUser(
        'test@example.com',
        'mypassword',
        'Test User',
        'STUDENT',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });

    it('should use default role STUDENT when not provided', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      await service.createUser('test@example.com', 'password123', 'Test User');

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'STUDENT',
        }),
      });
    });

    it('should accept different roles', async () => {
      const professorUser = { ...mockUser, role: 'PROFESSOR' as Role };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(professorUser);

      await service.createUser(
        'prof@example.com',
        'password123',
        'Professor',
        'PROFESSOR',
      );

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'PROFESSOR',
        }),
      });
    });

    it('should not return passwordHash in result', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.createUser(
        'test@example.com',
        'password123',
        'Test User',
      );

      expect(result).not.toHaveProperty('passwordHash');
      expect(Object.keys(result as object)).not.toContain('passwordHash');
    });

    it('should return all public fields in created user', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.createUser(
        'test@example.com',
        'password123',
        'Test User',
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
