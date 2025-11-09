import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: PrismaService;

  const mockStudent = {
    id: 1,
    userId: 1,
    phone: '1234567890',
    user: {
      id: 1,
      email: 'student@example.com',
      name: 'John Student',
      passwordHash: 'hashed-password',
      role: 'STUDENT',
      createdAt: new Date(),
    },
  };

  const mockClass = {
    id: 1,
    name: 'Mathematics 101',
    subject: 'Mathematics',
    description: 'Introduction to Mathematics',
    maxCapacity: 30,
    professorId: 1,
    createdAt: new Date(),
  };

  const mockEnrollment = {
    id: 1,
    studentId: 1,
    classId: 1,
    enrolledAt: new Date(),
    status: 'ACTIVE',
    gradeAverage: null,
    student: mockStudent,
    class: mockClass,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findUnique: jest.fn(),
            },
            class: {
              findUnique: jest.fn(),
            },
            enrollment: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            grade: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEnrollment', () => {
    it('should create a new enrollment', async () => {
      const dto = {
        studentId: 1,
        classId: 1,
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest.spyOn(prisma.enrollment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(5);
      jest
        .spyOn(prisma.enrollment, 'create')
        .mockResolvedValue(mockEnrollment as any);

      const result = await service.createEnrollment(dto);

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.enrollment.create).toHaveBeenCalled();
      expect(result.studentName).toBe(mockStudent.user.name);
      expect(result.className).toBe(mockClass.name);
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error if student not found', async () => {
      const dto = {
        studentId: 999,
        classId: 1,
      };

      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);

      await expect(service.createEnrollment(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if class not found', async () => {
      const dto = {
        studentId: 1,
        classId: 999,
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest.spyOn(prisma.class, 'findUnique').mockResolvedValue(null);

      await expect(service.createEnrollment(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if student already enrolled', async () => {
      const dto = {
        studentId: 1,
        classId: 1,
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest
        .spyOn(prisma.enrollment, 'findFirst')
        .mockResolvedValue(mockEnrollment as any);

      await expect(service.createEnrollment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if class is full', async () => {
      const dto = {
        studentId: 1,
        classId: 1,
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest.spyOn(prisma.enrollment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(30); // Full

      await expect(service.createEnrollment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create enrollment with custom status', async () => {
      const dto = {
        studentId: 1,
        classId: 1,
        status: 'COMPLETED' as const,
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest.spyOn(prisma.enrollment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.enrollment, 'create').mockResolvedValue({
        ...mockEnrollment,
        status: 'COMPLETED',
      } as any);

      const result = await service.createEnrollment(dto);

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return paginated enrollments for a student', async () => {
      const mockEnrollments = [mockEnrollment];

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest
        .spyOn(prisma.enrollment, 'findMany')
        .mockResolvedValue(mockEnrollments as any);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(1);

      const result = await service.getStudentEnrollments(1, 1, 10);

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.enrollment.findMany).toHaveBeenCalled();
      expect(result.enrollments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return empty list if student has no enrollments', async () => {
      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(0);

      const result = await service.getStudentEnrollments(1, 1, 10);

      expect(result.enrollments).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValue(null);

      await expect(service.getStudentEnrollments(999, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle pagination correctly', async () => {
      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValue(mockStudent as any);
      jest.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.enrollment, 'count').mockResolvedValue(25);

      const result = await service.getStudentEnrollments(1, 2, 10);

      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete an enrollment', async () => {
      jest
        .spyOn(prisma.enrollment, 'findUnique')
        .mockResolvedValue(mockEnrollment as any);
      jest
        .spyOn(prisma.grade, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);
      jest
        .spyOn(prisma.enrollment, 'delete')
        .mockResolvedValue(mockEnrollment as any);

      await service.deleteEnrollment(1);

      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.grade.deleteMany).toHaveBeenCalledWith({
        where: { enrollmentId: 1 },
      });
      expect(prisma.enrollment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if enrollment not found', async () => {
      jest.spyOn(prisma.enrollment, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteEnrollment(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
