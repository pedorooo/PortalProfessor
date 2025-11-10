import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import type { ClassResponse } from './classes.service';

const mockClassResponse: ClassResponse = {
  id: 1,
  name: 'Mathematics 101',
  subject: 'Mathematics',
  description: 'Introduction to Mathematics',
  maxCapacity: 30,
  professorId: 1,
  professorName: 'Prof. John',
  enrollmentCount: 5,
  createdAt: new Date(),
};

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: {
            createClass: jest.fn(),
            getAllClasses: jest.fn(),
            getClassById: jest.fn(),
            updateClass: jest.fn(),
            deleteClass: jest.fn(),
            getClassStudents: jest.fn(),
            getClassEvaluations: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  describe('getAllClasses', () => {
    it('should return list of classes with default pagination', async () => {
      const mockResponse = {
        classes: [mockClassResponse],
        total: 10,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllClasses')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllClasses({
        page: 1,
        limit: 10,
      });

      expect(service.getAllClasses).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(10);
    });

    it('should handle search parameter', async () => {
      const mockResponse = {
        classes: [mockClassResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllClasses')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllClasses({ page: 1, limit: 10 }, 'Math');

      expect(service.getAllClasses).toHaveBeenCalledWith(
        1,
        10,
        'Math',
        undefined,
        undefined,
      );
    });

    it('should handle professorId filter (parsed by pipe)', async () => {
      const mockResponse = {
        classes: [mockClassResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllClasses')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllClasses({ page: 1, limit: 10 }, undefined, 1);

      expect(service.getAllClasses).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        1,
        undefined,
      );
    });

    it('should handle subject filter', async () => {
      const mockResponse = {
        classes: [mockClassResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllClasses')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllClasses(
        { page: 1, limit: 10 },
        undefined,
        undefined,
        'Mathematics',
      );

      expect(service.getAllClasses).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        'Mathematics',
      );
    });

    it('should handle all filters combined', async () => {
      const mockResponse = {
        classes: [mockClassResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllClasses')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllClasses(
        { page: 1, limit: 10 },
        'Math',
        1,
        'Mathematics',
      );

      expect(service.getAllClasses).toHaveBeenCalledWith(
        1,
        10,
        'Math',
        1,
        'Mathematics',
      );
    });
  });

  describe('getClass', () => {
    it('should return a class by id', async () => {
      jest
        .spyOn(service, 'getClassById')
        .mockResolvedValue(mockClassResponse as any);

      const result = await controller.getClass(1);

      expect(service.getClassById).toHaveBeenCalledWith(1);
      expect(result.name).toBe(mockClassResponse.name);
    });

    it('should throw error if class not found', async () => {
      jest
        .spyOn(service, 'getClassById')
        .mockRejectedValue(new BadRequestException('Class not found'));

      await expect(controller.getClass(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid class id', async () => {
      await expect(controller.getClass(-1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero class id', async () => {
      await expect(controller.getClass(0)).rejects.toThrow(BadRequestException);
    });
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
        .spyOn(service, 'createClass')
        .mockResolvedValue(mockClassResponse as any);

      const result = await controller.createClass(dto);

      expect(service.createClass).toHaveBeenCalledWith(dto);
      expect(result.name).toBe(mockClassResponse.name);
    });

    it('should throw error if professor not found', async () => {
      const dto = {
        name: 'Physics 101',
        subject: 'Physics',
        description: 'Introduction to Physics',
        maxCapacity: 25,
        professorId: 999,
      };

      jest
        .spyOn(service, 'createClass')
        .mockRejectedValue(new BadRequestException('Professor not found'));

      await expect(controller.createClass(dto)).rejects.toThrow(
        'Professor not found',
      );
    });
  });

  describe('updateClass', () => {
    it('should update a class', async () => {
      const dto = { name: 'Advanced Mathematics' };
      const updatedClass = { ...mockClassResponse, name: dto.name };

      jest.spyOn(service, 'updateClass').mockResolvedValue(updatedClass as any);

      const result = await controller.updateClass(1, dto);

      expect(service.updateClass).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if class not found', async () => {
      const dto = { name: 'Advanced Mathematics' };

      jest
        .spyOn(service, 'updateClass')
        .mockRejectedValue(new BadRequestException('Class not found'));

      await expect(controller.updateClass(999, dto)).rejects.toThrow(
        'Class not found',
      );
    });

    it('should throw error for invalid class id', async () => {
      const dto = { name: 'Advanced Mathematics' };

      await expect(controller.updateClass(-1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero class id', async () => {
      const dto = { name: 'Advanced Mathematics' };

      await expect(controller.updateClass(0, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteClass', () => {
    it('should delete a class', async () => {
      jest.spyOn(service, 'deleteClass').mockResolvedValue(void 0);

      const result = await controller.deleteClass(1);

      expect(service.deleteClass).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Class deleted successfully');
    });

    it('should throw error if class not found', async () => {
      jest
        .spyOn(service, 'deleteClass')
        .mockRejectedValue(new BadRequestException('Class not found'));

      await expect(controller.deleteClass(999)).rejects.toThrow(
        'Class not found',
      );
    });

    it('should throw error for invalid class id', async () => {
      await expect(controller.deleteClass(-1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero class id', async () => {
      await expect(controller.deleteClass(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getClassStudents', () => {
    it('should return paginated students list', async () => {
      const mockStudents = [
        {
          id: 1,
          userId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      ];

      const mockResponse = {
        students: mockStudents,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getClassStudents(1, {
        page: 1,
        limit: 10,
      });

      expect(service.getClassStudents).toHaveBeenCalledWith(1, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should return empty list if no students', async () => {
      const mockResponse = {
        students: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getClassStudents(1, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should throw error if class not found', async () => {
      jest
        .spyOn(service, 'getClassStudents')
        .mockRejectedValue(new BadRequestException('Class not found'));

      await expect(
        controller.getClassStudents(999, { page: 1, limit: 10 }),
      ).rejects.toThrow('Class not found');
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        students: [],
        total: 25,
        page: 2,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getClassStudents(1, {
        page: 2,
        limit: 10,
      });

      expect(service.getClassStudents).toHaveBeenCalledWith(1, 2, 10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('getClassEvaluations', () => {
    it('should return paginated evaluations list', async () => {
      const mockEvaluations = [
        {
          id: 1,
          name: 'Midterm Exam',
          dueDate: new Date('2025-12-15'),
          status: 'OPEN',
        },
      ];

      const mockResponse = {
        evaluations: mockEvaluations,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassEvaluations')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getClassEvaluations(1, {
        page: 1,
        limit: 10,
      });

      expect(service.getClassEvaluations).toHaveBeenCalledWith(
        1,
        1,
        10,
        undefined,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle search filter', async () => {
      const mockResponse = {
        evaluations: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getClassEvaluations(1, { page: 1, limit: 10 }, 'Exam');

      expect(service.getClassEvaluations).toHaveBeenCalledWith(
        1,
        1,
        10,
        'Exam',
        undefined,
      );
    });

    it('should handle status filter', async () => {
      const mockResponse = {
        evaluations: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getClassEvaluations(
        1,
        { page: 1, limit: 10 },
        undefined,
        'CLOSED',
      );

      expect(service.getClassEvaluations).toHaveBeenCalledWith(
        1,
        1,
        10,
        undefined,
        'CLOSED',
      );
    });

    it('should handle search and status filters combined', async () => {
      const mockResponse = {
        evaluations: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getClassEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getClassEvaluations(
        1,
        { page: 1, limit: 10 },
        'Exam',
        'OPEN',
      );

      expect(service.getClassEvaluations).toHaveBeenCalledWith(
        1,
        1,
        10,
        'Exam',
        'OPEN',
      );
    });

    it('should throw error if class not found', async () => {
      jest
        .spyOn(service, 'getClassEvaluations')
        .mockRejectedValue(new BadRequestException('Class not found'));

      await expect(
        controller.getClassEvaluations(999, { page: 1, limit: 10 }),
      ).rejects.toThrow('Class not found');
    });
  });
});
