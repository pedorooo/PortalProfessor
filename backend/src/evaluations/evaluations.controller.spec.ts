import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import type { EvaluationResponse } from './evaluations.service';

const mockEvaluationResponse: EvaluationResponse = {
  id: 1,
  name: 'Midterm Exam',
  classId: 1,
  dueDate: new Date('2025-12-01'),
  status: 'OPEN',
};

describe('EvaluationsController', () => {
  let controller: EvaluationsController;
  let service: EvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [
        {
          provide: EvaluationsService,
          useValue: {
            createEvaluation: jest.fn(),
            getAllEvaluations: jest.fn(),
            getEvaluationById: jest.fn(),
            updateEvaluation: jest.fn(),
            deleteEvaluation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
    service = module.get<EvaluationsService>(EvaluationsService);
  });

  describe('createEvaluation', () => {
    it('should create a new evaluation', async () => {
      const dto = {
        name: 'Final Exam',
        classId: 1,
        dueDate: new Date('2025-12-15'),
      };

      jest
        .spyOn(service, 'createEvaluation')
        .mockResolvedValue(mockEvaluationResponse as any);

      const result = await controller.createEvaluation(dto);

      expect(service.createEvaluation).toHaveBeenCalledWith(dto);
      expect(result.name).toBe(mockEvaluationResponse.name);
      expect(result.classId).toBe(mockEvaluationResponse.classId);
    });

    it('should throw error on invalid input', async () => {
      const dto = {
        name: 'Quiz',
        classId: 1,
        dueDate: new Date('2025-12-10'),
      };

      jest
        .spyOn(service, 'createEvaluation')
        .mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(controller.createEvaluation(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllEvaluations', () => {
    it('should return list with default pagination', async () => {
      const mockResponse = {
        evaluations: [mockEvaluationResponse],
        total: 10,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluations')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllEvaluations({
        page: 1,
        limit: 10,
      });

      expect(service.getAllEvaluations).toHaveBeenCalledWith(
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
        evaluations: [mockEvaluationResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllEvaluations({ page: 1, limit: 10 }, 'Exam');

      expect(service.getAllEvaluations).toHaveBeenCalledWith(
        1,
        10,
        'Exam',
        undefined,
        undefined,
      );
    });

    it('should handle classId filter', async () => {
      const mockResponse = {
        evaluations: [mockEvaluationResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllEvaluations(
        { page: 1, limit: 10 },
        undefined,
        '1',
      );

      expect(service.getAllEvaluations).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        1,
        undefined,
      );
    });

    it('should handle status filter', async () => {
      const mockResponse = {
        evaluations: [mockEvaluationResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluations')
        .mockResolvedValue(mockResponse as any);

      await controller.getAllEvaluations(
        { page: 1, limit: 10 },
        undefined,
        undefined,
        'OPEN',
      );

      expect(service.getAllEvaluations).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        'OPEN',
      );
    });

    it('should return correct pagination structure', async () => {
      const mockResponse = {
        evaluations: [mockEvaluationResponse],
        total: 10,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluations')
        .mockResolvedValue(mockResponse as any);

      const result = await controller.getAllEvaluations({
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

  describe('getEvaluation', () => {
    it('should return an evaluation by id', async () => {
      jest
        .spyOn(service, 'getEvaluationById')
        .mockResolvedValue(mockEvaluationResponse as any);

      const result = await controller.getEvaluation(1);

      expect(service.getEvaluationById).toHaveBeenCalledWith(1);
      expect(result.name).toBe(mockEvaluationResponse.name);
    });

    it('should throw error if evaluation not found', async () => {
      jest
        .spyOn(service, 'getEvaluationById')
        .mockRejectedValue(new BadRequestException('Evaluation not found'));

      await expect(controller.getEvaluation(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateEvaluation', () => {
    it('should update evaluation name', async () => {
      const dto = { name: 'Updated Name' };
      const updatedEvaluation = {
        ...mockEvaluationResponse,
        name: dto.name,
      };

      jest
        .spyOn(service, 'updateEvaluation')
        .mockResolvedValue(updatedEvaluation as any);

      const result = await controller.updateEvaluation(1, dto);

      expect(service.updateEvaluation).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if evaluation not found', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(service, 'updateEvaluation')
        .mockRejectedValue(new BadRequestException('Evaluation not found'));

      await expect(controller.updateEvaluation(999, dto)).rejects.toThrow(
        'Evaluation not found',
      );
    });
  });

  describe('deleteEvaluation', () => {
    it('should delete an evaluation', async () => {
      jest.spyOn(service, 'deleteEvaluation').mockResolvedValue(undefined);

      await controller.deleteEvaluation(1);

      expect(service.deleteEvaluation).toHaveBeenCalledWith(1);
    });

    it('should throw error if evaluation not found', async () => {
      jest
        .spyOn(service, 'deleteEvaluation')
        .mockRejectedValue(new BadRequestException('Evaluation not found'));

      await expect(controller.deleteEvaluation(999)).rejects.toThrow(
        'Evaluation not found',
      );
    });
  });
});
