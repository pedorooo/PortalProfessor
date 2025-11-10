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
            student: {
              count: jest.fn(),
            },
            class: {
              count: jest.fn(),
            },
            evaluation: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            enrollment: {
              findMany: jest.fn(),
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

  describe('getDashboardStats', () => {
    it('should return dashboard statistics for all students and classes', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(50);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(5);

      const mockEvaluations = [
        {
          id: 1,
          submissions: [
            { grade: 85.5 },
            { grade: 90 },
            { grade: null },
          ],
        },
        {
          id: 2,
          submissions: [{ grade: 78 }, { grade: 92.5 }],
        },
      ];
      jest
        .spyOn(prisma.evaluation, 'findMany')
        .mockResolvedValue(mockEvaluations as any);

      const mockEnrollments = [
        { enrolledAt: new Date('2025-09-15') },
        { enrolledAt: new Date('2025-09-20') },
        { enrolledAt: new Date('2025-10-05') },
        { enrolledAt: new Date('2025-10-10') },
        { enrolledAt: new Date('2025-11-01') },
      ];
      jest
        .spyOn(prisma.enrollment, 'findMany')
        .mockResolvedValue(mockEnrollments as any);

      const result = await service.getDashboardStats();

      expect(result.totalStudents).toBe(50);
      expect(result.totalClasses).toBe(10);
      expect(result.upcomingEvaluations).toBe(5);
      expect(result.avgStudentScore).toBe(86.5);
      expect(result.enrollmentTrend).toBeInstanceOf(Array);
      expect(result.enrollmentTrend.length).toBeGreaterThanOrEqual(1);
      expect(result.enrollmentTrend.length).toBeLessThanOrEqual(6);

      expect(prisma.student.count).toHaveBeenCalled();
      expect(prisma.class.count).toHaveBeenCalled();
      expect(prisma.evaluation.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dueDate: expect.any(Object),
          }),
        }),
      );
      expect(prisma.evaluation.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          submissions: {
            select: { grade: true },
          },
        },
      });
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            enrolledAt: expect.any(Object),
          }),
          select: { enrolledAt: true },
          orderBy: { enrolledAt: 'asc' },
        }),
      );
    });

    it('should handle zero students and classes', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.totalStudents).toBe(0);
      expect(result.totalClasses).toBe(0);
      expect(result.upcomingEvaluations).toBe(0);
      expect(result.avgStudentScore).toBe(0);
      expect(result.enrollmentTrend).toBeInstanceOf(Array);
    });

    it('should calculate average score correctly with no grades', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([
        {
          id: 1,
          submissions: [{ grade: null }, { grade: null }],
        },
      ] as any);
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.avgStudentScore).toBe(0);
    });

    it('should round average score to 2 decimal places', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([
        {
          id: 1,
          submissions: [{ grade: 85.333 }, { grade: 90.666 }],
        },
      ] as any);
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.avgStudentScore).toBe(88);
    });

    it('should generate enrollment trend for last 6 months', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);

      const mockEnrollments = [
        { enrolledAt: new Date('2025-06-15') },
        { enrolledAt: new Date('2025-07-20') },
        { enrolledAt: new Date('2025-08-05') },
        { enrolledAt: new Date('2025-09-10') },
        { enrolledAt: new Date('2025-10-15') },
        { enrolledAt: new Date('2025-11-05') },
        { enrolledAt: new Date('2025-04-01') },
      ];
      jest
        .spyOn(prisma.enrollment, 'findMany')
        .mockResolvedValue(mockEnrollments as any);

      const result = await service.getDashboardStats();

      expect(result.enrollmentTrend).toBeInstanceOf(Array);
      expect(result.enrollmentTrend.length).toBeGreaterThanOrEqual(1);
      expect(result.enrollmentTrend.length).toBeLessThanOrEqual(6);
      expect(result.enrollmentTrend[0]).toHaveProperty('month');
      expect(result.enrollmentTrend[0]).toHaveProperty('students');
      expect(typeof result.enrollmentTrend[0].month).toBe('string');
      expect(typeof result.enrollmentTrend[0].students).toBe('number');
    });
  });
});
