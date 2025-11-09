import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma/prisma.service';

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
  department: 'Mathematics',
  createdAt: new Date(),
  user: mockUser,
};

const mockClass = {
  id: 1,
  name: 'Mathematics 101',
  subject: 'Mathematics',
  description: 'Introduction to Mathematics',
  maxCapacity: 30,
  professorId: 1,
  createdAt: new Date(),
  professor: mockProfessor,
  enrollments: [],
};

describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: PrismaService,
          useValue: {
            professor: {
              findUnique: jest.fn(),
            },
            class: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            studentLesson: {
              deleteMany: jest.fn(),
            },
            lesson: {
              deleteMany: jest.fn(),
            },
            enrollment: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createClass', () => {
    it('should create a new class', async () => {
      const dto = {
        name: 'Physics 101',
        subject: 'Physics',
        description: 'Introduction to Physics',
        maxCapacity: 25,
        professorId: 1,
      };

      jest
        .spyOn(prisma.professor, 'findUnique')
        .mockResolvedValue(mockProfessor as any);
      jest.spyOn(prisma.class, 'create').mockResolvedValue(mockClass as any);

      const result = await service.createClass(dto);

      expect(prisma.professor.findUnique).toHaveBeenCalledWith({
        where: { userId: dto.professorId },
        include: { user: true },
      });
      expect(prisma.class.create).toHaveBeenCalled();
      expect(result.name).toBe(mockClass.name);
      expect(result.subject).toBe(mockClass.subject);
    });

    it('should throw error if professor not found', async () => {
      const dto = {
        name: 'Physics 101',
        subject: 'Physics',
        description: 'Introduction to Physics',
        maxCapacity: 25,
        professorId: 999,
      };

      jest.spyOn(prisma.professor, 'findUnique').mockResolvedValue(null);

      await expect(service.createClass(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllClasses', () => {
    it('should return paginated classes', async () => {
      const mockClasses = [mockClass];

      jest.spyOn(prisma.class, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.class, 'findMany')
        .mockResolvedValue(mockClasses as any);

      const result = await service.getAllClasses(1, 10);

      expect(result.classes).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter classes by search term', async () => {
      jest.spyOn(prisma.class, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.class, 'findMany').mockResolvedValue([]);

      await service.getAllClasses(1, 10, 'Math');

      expect(prisma.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      jest.spyOn(prisma.class, 'count').mockResolvedValue(25);
      jest.spyOn(prisma.class, 'findMany').mockResolvedValue([]);

      const result = await service.getAllClasses(2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(prisma.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should filter classes by subject', async () => {
      jest.spyOn(prisma.class, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.class, 'findMany').mockResolvedValue([]);

      await service.getAllClasses(1, 10, undefined, undefined, 'Mathematics');

      expect(prisma.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subject: { equals: 'Mathematics', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter classes by professorId', async () => {
      jest
        .spyOn(prisma.professor, 'findUnique')
        .mockResolvedValue(mockProfessor as any);
      jest.spyOn(prisma.class, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.class, 'findMany')
        .mockResolvedValue([mockClass as any]);

      await service.getAllClasses(1, 10, undefined, 1);

      expect(prisma.professor.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prisma.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            professorId: mockProfessor.id,
          }),
        }),
      );
    });
  });

  describe('getClassById', () => {
    it('should return a class by id', async () => {
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);

      const result = await service.getClassById(1);

      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          professor: {
            include: { user: true },
          },
          enrollments: true,
        },
      });
      expect(result.name).toBe(mockClass.name);
    });

    it('should throw error if class not found', async () => {
      jest.spyOn(prisma.class, 'findUnique').mockResolvedValue(null);

      await expect(service.getClassById(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateClass', () => {
    it('should update class name', async () => {
      const dto = { name: 'Advanced Physics' };

      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValueOnce(mockClass as any)
        .mockResolvedValueOnce({
          ...mockClass,
          name: dto.name,
        } as any);

      jest.spyOn(prisma.class, 'update').mockResolvedValue({
        ...mockClass,
        name: dto.name,
      } as any);

      const result = await service.updateClass(1, dto);

      expect(prisma.class.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: dto.name },
        include: expect.any(Object),
      });
      expect(result.name).toBe(dto.name);
    });

    it('should update maxCapacity', async () => {
      const dto = { maxCapacity: 50 };

      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValueOnce(mockClass as any)
        .mockResolvedValueOnce({
          ...mockClass,
          maxCapacity: dto.maxCapacity,
        } as any);

      jest.spyOn(prisma.class, 'update').mockResolvedValue({
        ...mockClass,
        maxCapacity: dto.maxCapacity,
      } as any);

      const result = await service.updateClass(1, dto);

      expect(result.maxCapacity).toBe(dto.maxCapacity);
    });

    it('should throw error if class not found', async () => {
      jest.spyOn(prisma.class, 'findUnique').mockResolvedValue(null);

      await expect(service.updateClass(999, { name: 'Test' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if new professor not found', async () => {
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest.spyOn(prisma.professor, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateClass(1, { professorId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteClass', () => {
    it('should delete a class and related records', async () => {
      jest
        .spyOn(prisma.class, 'findUnique')
        .mockResolvedValue(mockClass as any);
      jest.spyOn(prisma.studentLesson, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest.spyOn(prisma.lesson, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest.spyOn(prisma.enrollment, 'deleteMany').mockResolvedValue({
        count: 0,
      } as any);
      jest.spyOn(prisma.class, 'delete').mockResolvedValue(mockClass as any);

      await service.deleteClass(1);

      expect(prisma.studentLesson.deleteMany).toHaveBeenCalled();
      expect(prisma.lesson.deleteMany).toHaveBeenCalledWith({
        where: { classId: 1 },
      });
      expect(prisma.enrollment.deleteMany).toHaveBeenCalledWith({
        where: { classId: 1 },
      });
      expect(prisma.class.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if class not found', async () => {
      jest.spyOn(prisma.class, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteClass(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
