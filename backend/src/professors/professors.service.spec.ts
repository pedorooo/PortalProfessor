import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const mockUser = {
  id: 1,
  email: 'professor@example.com',
  name: 'Prof. John',
  passwordHash: 'hashed-password',
  role: 'PROFESSOR',
  createdAt: new Date(),
};

const mockProfessor = {
  id: 1,
  userId: 1,
  createdAt: new Date(),
  user: mockUser,
};

describe('ProfessorsService', () => {
  let service: ProfessorsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorsService,
        {
          provide: PrismaService,
          useValue: {
            professor: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            user: {
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfessorsService>(ProfessorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createProfessor', () => {
    it('should create a new professor', async () => {
      const dto = {
        email: 'newprof@example.com',
        password: 'Password123',
        name: 'Prof. Jane',
      };

      jest
        .spyOn(service['usersService'], 'findByEmail')
        .mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest
        .spyOn(prisma.professor, 'create')
        .mockResolvedValue(mockProfessor as any);

      const result = await service.createProfessor(dto);

      expect(service['usersService'].findByEmail).toHaveBeenCalledWith(
        dto.email,
      );
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.professor.create).toHaveBeenCalled();
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Prof. Jane',
      };

      jest
        .spyOn(service['usersService'], 'findByEmail')
        .mockResolvedValue(mockUser as any);

      await expect(service.createProfessor(dto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('getAllProfessors', () => {
    it('should return paginated professors', async () => {
      const mockProfessors = [mockProfessor];

      jest.spyOn(prisma.professor, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.professor, 'findMany')
        .mockResolvedValue(mockProfessors as any);

      const result = await service.getAllProfessors(1, 10);

      expect(result.professors).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter professors by search term (name)', async () => {
      jest.spyOn(prisma.professor, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.professor, 'findMany').mockResolvedValue([]);

      await service.getAllProfessors(1, 10, 'John');

      expect(prisma.professor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      jest.spyOn(prisma.professor, 'count').mockResolvedValue(25);
      jest.spyOn(prisma.professor, 'findMany').mockResolvedValue([]);

      const result = await service.getAllProfessors(2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(prisma.professor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('getProfessorById', () => {
    it('should return a professor by id', async () => {
      jest
        .spyOn(prisma.professor, 'findUnique')
        .mockResolvedValue(mockProfessor as any);

      const result = await service.getProfessorById(1);

      expect(prisma.professor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error if professor not found', async () => {
      jest.spyOn(prisma.professor, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfessorById(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProfessorByUserId', () => {
    it('should return a professor by userId', async () => {
      jest
        .spyOn(prisma.professor, 'findUnique')
        .mockResolvedValue(mockProfessor as any);

      const result = await service.getProfessorByUserId(1);

      expect(prisma.professor.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      });
      expect(result.name).toBe(mockUser.name);
    });

    it('should throw error if professor not found', async () => {
      jest.spyOn(prisma.professor, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfessorByUserId(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProfessor', () => {
    it('should update professor name', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(prisma.professor, 'findUnique')
        .mockResolvedValueOnce(mockProfessor as any)
        .mockResolvedValueOnce({
          ...mockProfessor,
          user: { ...mockUser, name: dto.name },
        } as any);

      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        name: dto.name,
      } as any);

      const result = await service.updateProfessor(1, dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockProfessor.userId },
        data: { name: dto.name },
      });
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if professor not found', async () => {
      jest.spyOn(prisma.professor, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateProfessor(999, { name: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
