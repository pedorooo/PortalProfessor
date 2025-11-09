import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: EnrollmentsService;

  const mockEnrollment = {
    id: 1,
    studentId: 1,
    studentName: 'John Student',
    classId: 1,
    className: 'Mathematics 101',
    status: 'ACTIVE',
    enrolledAt: new Date(),
    gradeAverage: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: {
            createEnrollment: jest.fn(),
            getStudentEnrollments: jest.fn(),
            deleteEnrollment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEnrollment', () => {
    it('should create a new enrollment', async () => {
      const body = {
        studentId: 1,
        classId: 1,
      };

      jest.spyOn(service, 'createEnrollment').mockResolvedValue(mockEnrollment);

      const result = await controller.createEnrollment(body);

      expect(service.createEnrollment).toHaveBeenCalledWith({
        studentId: 1,
        classId: 1,
      });
      expect(result.data).toEqual(mockEnrollment);
    });

    it('should throw error for invalid input', async () => {
      const body = {
        studentId: 'invalid',
        classId: 1,
      };

      await expect(controller.createEnrollment(body)).rejects.toThrow();
    });

    it('should throw error if student not found', async () => {
      const body = {
        studentId: 999,
        classId: 1,
      };

      jest
        .spyOn(service, 'createEnrollment')
        .mockRejectedValue(new NotFoundException('Student not found'));

      await expect(controller.createEnrollment(body)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if class not found', async () => {
      const body = {
        studentId: 1,
        classId: 999,
      };

      jest
        .spyOn(service, 'createEnrollment')
        .mockRejectedValue(new NotFoundException('Class not found'));

      await expect(controller.createEnrollment(body)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if student already enrolled', async () => {
      const body = {
        studentId: 1,
        classId: 1,
      };

      jest
        .spyOn(service, 'createEnrollment')
        .mockRejectedValue(
          new BadRequestException('Student is already enrolled in this class'),
        );

      await expect(controller.createEnrollment(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if class is full', async () => {
      const body = {
        studentId: 1,
        classId: 1,
      };

      jest
        .spyOn(service, 'createEnrollment')
        .mockRejectedValue(
          new BadRequestException('Class has reached maximum capacity of 30'),
        );

      await expect(controller.createEnrollment(body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return paginated enrollments for a student', async () => {
      const mockResult = {
        enrollments: [mockEnrollment],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getStudentEnrollments')
        .mockResolvedValue(mockResult);

      const result = await controller.getStudentEnrollments(1, {
        page: 1,
        limit: 10,
      });

      expect(service.getStudentEnrollments).toHaveBeenCalledWith(1, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should return empty list if student has no enrollments', async () => {
      const mockResult = {
        enrollments: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getStudentEnrollments')
        .mockResolvedValue(mockResult);

      const result = await controller.getStudentEnrollments(1, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should throw error if student not found', async () => {
      jest
        .spyOn(service, 'getStudentEnrollments')
        .mockRejectedValue(new NotFoundException('Student not found'));

      await expect(
        controller.getStudentEnrollments(999, { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle pagination correctly', async () => {
      const mockResult = {
        enrollments: [],
        total: 25,
        page: 2,
        limit: 10,
      };

      jest
        .spyOn(service, 'getStudentEnrollments')
        .mockResolvedValue(mockResult);

      const result = await controller.getStudentEnrollments(1, {
        page: 2,
        limit: 10,
      });

      expect(service.getStudentEnrollments).toHaveBeenCalledWith(1, 2, 10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete an enrollment', async () => {
      jest.spyOn(service, 'deleteEnrollment').mockResolvedValue(undefined);

      const result = await controller.deleteEnrollment(1);

      expect(service.deleteEnrollment).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw error if enrollment not found', async () => {
      jest
        .spyOn(service, 'deleteEnrollment')
        .mockRejectedValue(new NotFoundException('Enrollment not found'));

      await expect(controller.deleteEnrollment(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
