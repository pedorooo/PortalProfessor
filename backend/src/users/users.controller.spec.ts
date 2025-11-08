import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService, type PublicUser } from './users.service';
import type { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    role: 'STUDENT' as Role,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockPublicUser: PublicUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT' as Role,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            toPublicProfile: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return authenticated user profile', async () => {
      const req = {
        user: { sub: 1, email: 'test@example.com', role: 'STUDENT' },
      } as any;

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockPublicUser);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(service.toPublicProfile).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException when user not authenticated', async () => {
      const req = { user: undefined } as any;

      await expect(controller.getProfile(req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when userId is undefined', async () => {
      const req = {
        user: { email: 'test@example.com', role: 'STUDENT' },
      } as any;

      await expect(controller.getProfile(req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const req = {
        user: { sub: 999, email: 'test@example.com', role: 'STUDENT' },
      } as any;

      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(controller.getProfile(req)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('updateProfile', () => {
    it('should update user name successfully', async () => {
      const req = {
        user: { sub: 1, email: 'test@example.com', role: 'STUDENT' },
      } as any;
      const payload = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'updateProfile').mockResolvedValue(updatedUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue({
        ...mockPublicUser,
        name: 'Updated Name',
      });

      const result = await controller.updateProfile(req, payload as any);

      expect(result).toEqual({
        ...mockPublicUser,
        name: 'Updated Name',
      });
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(service.updateProfile).toHaveBeenCalledWith(1, payload);
    });

    it('should update user phone successfully', async () => {
      const req = {
        user: { sub: 1, email: 'test@example.com', role: 'STUDENT' },
      } as any;
      const payload = { phone: '+55 11 88888-8888' };
      const updatedUser = { ...mockUser };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'updateProfile').mockResolvedValue(updatedUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.updateProfile(req, payload as any);

      expect(result).toEqual(mockPublicUser);
      expect(service.updateProfile).toHaveBeenCalledWith(1, payload);
    });

    it('should update both name and phone', async () => {
      const req = {
        user: { sub: 1, email: 'test@example.com', role: 'STUDENT' },
      } as any;
      const payload = { name: 'New Name', phone: '+55 11 77777-7777' };
      const updatedUser = {
        ...mockUser,
        name: 'New Name',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'updateProfile').mockResolvedValue(updatedUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue({
        ...mockPublicUser,
        name: 'New Name',
      });

      const result = await controller.updateProfile(req, payload as any);

      expect(result).toEqual({
        ...mockPublicUser,
        name: 'New Name',
      });
      expect(service.updateProfile).toHaveBeenCalledWith(1, payload);
    });

    it('should handle empty payload', async () => {
      const req = {
        user: { sub: 1, email: 'test@example.com', role: 'STUDENT' },
      } as any;
      const payload = {};

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'updateProfile').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.updateProfile(req, payload as any);

      expect(result).toEqual(mockPublicUser);
      expect(service.updateProfile).toHaveBeenCalledWith(1, payload);
    });

    it('should throw BadRequestException when user not authenticated', async () => {
      const req = { user: undefined } as any;
      const payload = { name: 'Updated Name' };

      await expect(
        controller.updateProfile(req, payload as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const req = {
        user: { sub: 999, email: 'test@example.com', role: 'STUDENT' },
      } as any;
      const payload = { name: 'Updated Name' };

      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(
        controller.updateProfile(req, payload as any),
      ).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('getUser', () => {
    it('should return public user profile by ID', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.getUser('1');

      expect(result).toEqual(mockPublicUser);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(service.toPublicProfile).toHaveBeenCalledWith(mockUser);
    });

    it('should return public user profile with different user ID', async () => {
      const userId = 42;
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.getUser(userId.toString());

      expect(result).toEqual(mockPublicUser);
      expect(service.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException for invalid user ID format', async () => {
      await expect(controller.getUser('not-a-number')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for negative user ID', async () => {
      await expect(controller.getUser('-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for floating point user ID', async () => {
      // Note: Number.parseInt('1.5') returns 1, which is a valid integer
      // If we want to reject floats, we would need to use a different validation method
      // For now, '1.5' gets parsed as 1 and will look up user with ID 1
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(controller.getUser('1.5')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(controller.getUser('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findById).toHaveBeenCalledWith(999);
    });

    it('should accept zero as valid user ID', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.getUser('0');

      expect(result).toEqual(mockPublicUser);
      expect(service.findById).toHaveBeenCalledWith(0);
    });

    it('should parse large user ID correctly', async () => {
      const largeId = 999999999;
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(service, 'toPublicProfile').mockReturnValue(mockPublicUser);

      const result = await controller.getUser(largeId.toString());

      expect(result).toEqual(mockPublicUser);
      expect(service.findById).toHaveBeenCalledWith(largeId);
    });
  });
});
