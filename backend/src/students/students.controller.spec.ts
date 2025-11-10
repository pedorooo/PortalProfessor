import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import type { StudentResponse } from './students.service';

const mockStudentResponse: StudentResponse = {
  id: 1,
  userId: 1,
  name: 'John Student',
  email: 'student@example.com',
  phone: '5511999999999',
  status: 'ACTIVE',
  createdAt: new Date(),
  enrollmentCount: 2,
};

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: {
            createStudent: jest.fn(),
            getAllStudents: jest.fn(),
            getStudentById: jest.fn(),
            updateStudent: jest.fn(),
            deleteStudent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  describe('getAllStudents', () => {
    it('should return list of students with pagination wrapper', async () => {
      const mockResponse = {
        students: [mockStudentResponse],
        total: 10,
        page: 1,
        limit: 10,
        pages: 1,
      };

      jest
        .spyOn(service, 'getAllStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllStudents({ page: 1, limit: 10 });

      expect(service.getAllStudents).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should handle different pagination parameters', async () => {
      const mockResponse = {
        students: [],
        total: 50,
        page: 2,
        limit: 20,
        pages: 3,
      };

      jest
        .spyOn(service, 'getAllStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllStudents({ page: 2, limit: 20 });

      expect(service.getAllStudents).toHaveBeenCalledWith(
        2,
        20,
        undefined,
        undefined,
        undefined,
      );
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should handle search parameter', async () => {
      const mockResponse = {
        students: [mockStudentResponse],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      };

      jest
        .spyOn(service, 'getAllStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllStudents(
        { page: 1, limit: 10 },
        'John',
      );

      expect(service.getAllStudents).toHaveBeenCalledWith(
        1,
        10,
        'John',
        undefined,
        undefined,
      );
      expect(result.data).toHaveLength(1);
    });

    it('should handle status filter', async () => {
      const mockResponse = {
        students: [],
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
      };

      jest
        .spyOn(service, 'getAllStudents')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllStudents(
        { page: 1, limit: 10 },
        undefined,
        'ACTIVE',
      );

      expect(service.getAllStudents).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        'ACTIVE',
        undefined,
      );
    });

    it('should handle classId filter', async () => {
      const mockResponse = {
        students: [],
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
      };

      jest
        .spyOn(service, 'getAllStudents')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllStudents(
        { page: 1, limit: 10 },
        undefined,
        undefined,
        '5',
      );

      expect(service.getAllStudents).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        5,
      );
      expect(result.data).toEqual([]);
    });

    it('should throw error for invalid classId', async () => {
      await expect(
        controller.getAllStudents(
          { page: 1, limit: 10 },
          undefined,
          undefined,
          '0',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for negative classId', async () => {
      await expect(
        controller.getAllStudents(
          { page: 1, limit: 10 },
          undefined,
          undefined,
          '-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStudent', () => {
    it('should return a student by id', async () => {
      jest
        .spyOn(service, 'getStudentById')
        .mockResolvedValue(mockStudentResponse as any);

      const result = await controller.getStudent(1);

      expect(service.getStudentById).toHaveBeenCalledWith(1);
      expect(result.name).toBe(mockStudentResponse.name);
    });

    it('should throw error if student not found', async () => {
      jest
        .spyOn(service, 'getStudentById')
        .mockRejectedValue(new BadRequestException('Student not found'));

      await expect(controller.getStudent(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid student id', async () => {
      await expect(controller.getStudent(-1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero student id', async () => {
      await expect(controller.getStudent(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const dto = {
        email: 'newstudent@example.com',
        password: 'Password123!',
        name: 'New Student',
        phone: '5511999999999',
      };

      jest
        .spyOn(service, 'createStudent')
        .mockResolvedValue(mockStudentResponse as any);

      const result = await controller.createStudent(dto);

      expect(service.createStudent).toHaveBeenCalledWith(dto);
      expect(result.email).toBe(mockStudentResponse.email);
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Student',
        phone: '5511999999999',
      };

      jest
        .spyOn(service, 'createStudent')
        .mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(controller.createStudent(dto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('updateStudent', () => {
    it('should update a student', async () => {
      const dto = { name: 'Updated Name' };
      const updatedStudent = { ...mockStudentResponse, name: dto.name };

      jest
        .spyOn(service, 'updateStudent')
        .mockResolvedValue(updatedStudent as any);

      const result = await controller.updateStudent(1, dto);

      expect(service.updateStudent).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if student not found', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(service, 'updateStudent')
        .mockRejectedValue(new BadRequestException('Student not found'));

      await expect(controller.updateStudent(999, dto)).rejects.toThrow(
        'Student not found',
      );
    });

    it('should throw error for invalid student id', async () => {
      const dto = { name: 'Updated Name' };

      await expect(controller.updateStudent(-1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero student id', async () => {
      const dto = { name: 'Updated Name' };

      await expect(controller.updateStudent(0, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student', async () => {
      jest.spyOn(service, 'deleteStudent').mockResolvedValue(void 0);

      const result = await controller.deleteStudent(1);

      expect(service.deleteStudent).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Student deleted successfully');
    });

    it('should throw error if student not found', async () => {
      jest
        .spyOn(service, 'deleteStudent')
        .mockRejectedValue(new BadRequestException('Student not found'));

      await expect(controller.deleteStudent(999)).rejects.toThrow(
        'Student not found',
      );
    });

    it('should throw error for invalid student id', async () => {
      await expect(controller.deleteStudent(-1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for zero student id', async () => {
      await expect(controller.deleteStudent(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
