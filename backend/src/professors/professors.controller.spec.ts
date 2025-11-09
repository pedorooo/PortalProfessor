import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfessorsController } from './professors.controller';
import { ProfessorsService } from './professors.service';
import type { ProfessorResponse } from './professors.service';

const mockProfessorResponse: ProfessorResponse = {
  id: 1,
  userId: 1,
  name: 'Prof. John',
  email: 'professor@example.com',
  createdAt: new Date(),
};

describe('ProfessorsController', () => {
  let controller: ProfessorsController;
  let service: ProfessorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessorsController],
      providers: [
        {
          provide: ProfessorsService,
          useValue: {
            getAllProfessors: jest.fn(),
            getProfessorById: jest.fn(),
            updateProfessor: jest.fn(),
            createProfessor: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfessorsController>(ProfessorsController);
    service = module.get<ProfessorsService>(ProfessorsService);
  });

  describe('createProfessor', () => {
    it('should create a new professor', async () => {
      const dto = {
        email: 'newprof@example.com',
        password: 'Password123',
        name: 'Prof. Jane',
      };

      jest
        .spyOn(service, 'createProfessor')
        .mockResolvedValue(mockProfessorResponse as any);

      const result = await controller.createProfessor(dto);

      expect(service.createProfessor).toHaveBeenCalledWith(dto);
      expect(result.name).toBe(mockProfessorResponse.name);
      expect(result.email).toBe(mockProfessorResponse.email);
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Prof. Jane',
      };

      jest
        .spyOn(service, 'createProfessor')
        .mockRejectedValue(new BadRequestException('Email already exists'));

      await expect(controller.createProfessor(dto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('getAllProfessors', () => {
    it('should return list of professors with default pagination', async () => {
      const mockResponse = {
        professors: [mockProfessorResponse],
        total: 10,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllProfessors')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllProfessors({
        page: 1,
        limit: 10,
      });

      expect(service.getAllProfessors).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(10);
    });

    it('should handle search parameter', async () => {
      const mockResponse = {
        professors: [mockProfessorResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllProfessors')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllProfessors({ page: 1, limit: 10 }, 'John');

      expect(service.getAllProfessors).toHaveBeenCalledWith(1, 10, 'John');
    });

    it('should return correct pagination structure', async () => {
      const mockResponse = {
        professors: [mockProfessorResponse],
        total: 10,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllProfessors')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllProfessors({
        page: 1,
        limit: 10,
      });

      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('pages');
      expect(result.pagination).toHaveProperty('hasNextPage');
      expect(result.pagination).toHaveProperty('hasPreviousPage');
    });
  });

  describe('getProfessor', () => {
    it('should return a professor by id', async () => {
      jest
        .spyOn(service, 'getProfessorById')
        .mockResolvedValue(mockProfessorResponse as any);

      const result = await controller.getProfessor(1);

      expect(service.getProfessorById).toHaveBeenCalledWith(1);
      expect(result.name).toBe(mockProfessorResponse.name);
      expect(result.email).toBe(mockProfessorResponse.email);
    });

    it('should throw error if professor not found', async () => {
      jest
        .spyOn(service, 'getProfessorById')
        .mockRejectedValue(new BadRequestException('Professor not found'));

      await expect(controller.getProfessor(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProfessor', () => {
    it('should update professor name', async () => {
      const dto = { name: 'Updated Name' };
      const updatedProfessor = {
        ...mockProfessorResponse,
        name: dto.name,
      };

      jest
        .spyOn(service, 'updateProfessor')
        .mockResolvedValue(updatedProfessor as any);

      const result = await controller.updateProfessor(1, dto);

      expect(service.updateProfessor).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if professor not found', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(service, 'updateProfessor')
        .mockRejectedValue(new BadRequestException('Professor not found'));

      await expect(controller.updateProfessor(999, dto)).rejects.toThrow(
        'Professor not found',
      );
    });
  });
});
