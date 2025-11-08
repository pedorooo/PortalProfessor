import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

// Mock data
const mockUser = {
  id: 1,
  email: 'student@example.com',
  name: 'John Student',
  passwordHash: 'hashed-password',
  role: 'STUDENT',
  createdAt: new Date(),
};

const mockStudent = {
  id: 1,
  userId: 1,
  phone: '5511999999999',
  createdAt: new Date(),
  enrollments: [],
};

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: PrismaService;
  let usersService: UsersService;

  beforeEach(async () => {
    // Mock bcrypt.hash
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: {
            user: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
            student: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            studentLesson: { deleteMany: jest.fn() },
            evaluationSubmission: { deleteMany: jest.fn() },
            enrollment: { findMany: jest.fn(), deleteMany: jest.fn() },
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

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const dto = {
        email: 'newstudent@example.com',
        password: 'Password123!',
        name: 'New Student',
        phone: '5511999999999',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest
        .spyOn(prisma.student, 'create')
        .mockResolvedValue(mockStudent as any);

      const result = await service.createStudent(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.student.create).toHaveBeenCalled();
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Student',
        phone: '5511999999999',
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);

      await expect(service.createStudent(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllStudents', () => {
    it('should return paginated students', async () => {
      const mockStudents = [
        { ...mockStudent, user: mockUser, enrollments: [] },
      ];

      jest.spyOn(prisma.student, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.student, 'findMany')
        .mockResolvedValue(mockStudents as any);

      const result = await service.getAllStudents(1, 10);

      expect(result.students).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.pages).toBe(1);
    });

    it('should filter students by search term', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.student, 'findMany').mockResolvedValue([]);

      await service.getAllStudents(1, 10, 'John');

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter students by classId', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.student, 'findMany').mockResolvedValue([]);

      await service.getAllStudents(1, 10, undefined, undefined, 1);

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            enrollments: expect.any(Object),
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      jest.spyOn(prisma.student, 'count').mockResolvedValue(25);
      jest.spyOn(prisma.student, 'findMany').mockResolvedValue([]);

      const result = await service.getAllStudents(2, 10);

      expect(result.page).toBe(2);
      expect(result.pages).toBe(3);
      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('getStudentById', () => {
    it('should return a student by id', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue({
        ...mockStudent,
        user: mockUser,
      } as any);

      const result = await service.getStudentById(1);

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true, enrollments: true },
      });
      expect(result.name).toBe(mockUser.name);
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);

      await expect(service.getStudentById(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStudent', () => {
    it('should update student name', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValueOnce({
          ...mockStudent,
          user: mockUser,
          enrollments: [],
        } as any)
        .mockResolvedValueOnce({
          ...mockStudent,
          user: { ...mockUser, name: dto.name },
          enrollments: [],
        } as any);

      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        name: dto.name,
      } as any);

      const result = await service.updateStudent(1, dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockStudent.userId },
        data: { name: dto.name },
      });
      expect(result.name).toBe(dto.name);
    });

    it('should update student phone', async () => {
      const dto = { phone: '5511888888888' };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValueOnce({
          ...mockStudent,
          user: mockUser,
          enrollments: [],
        } as any)
        .mockResolvedValueOnce({
          ...mockStudent,
          phone: dto.phone,
          user: mockUser,
          enrollments: [],
        } as any);

      jest.spyOn(prisma.student, 'update').mockResolvedValue({
        ...mockStudent,
        phone: dto.phone,
      } as any);

      const result = await service.updateStudent(1, dto);

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { phone: dto.phone },
      });
      expect(result.phone).toBe(dto.phone);
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateStudent(999, { name: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student and related records', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue({
        ...mockStudent,
        user: mockUser,
      } as any);

      jest.spyOn(prisma.studentLesson, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest.spyOn(prisma.evaluationSubmission, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest.spyOn(prisma.enrollment, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest
        .spyOn(prisma.student, 'delete')
        .mockResolvedValue(mockStudent as any);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser as any);

      await service.deleteStudent(1);

      expect(prisma.studentLesson.deleteMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
      });
      expect(prisma.evaluationSubmission.deleteMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
      });
      expect(prisma.enrollment.deleteMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
      });
      expect(prisma.student.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockStudent.userId },
      });
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteStudent(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStudentsByClass', () => {
    it('should return students by class', async () => {
      const mockEnrollment = {
        id: 1,
        studentId: 1,
        classId: 1,
        status: 'ACTIVE',
        enrolledAt: new Date(),
        student: {
          ...mockStudent,
          user: mockUser,
        },
      };

      jest
        .spyOn(prisma.enrollment, 'findMany')
        .mockResolvedValue([mockEnrollment as any]);

      const result = await service.getStudentsByClass(1);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('ACTIVE');
    });

    it('should return empty array if no students in class', async () => {
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);

      const result = await service.getStudentsByClass(1);

      expect(result).toHaveLength(0);
    });
  });
});
