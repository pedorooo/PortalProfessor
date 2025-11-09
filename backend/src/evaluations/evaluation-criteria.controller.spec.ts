import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaService } from './evaluation-criteria.service';

describe('EvaluationCriteriaController', () => {
  let controller: EvaluationCriteriaController;
  let service: EvaluationCriteriaService;

  const mockCriteria = {
    id: 1,
    name: 'Test Criteria',
    weight: 30,
    description: 'Test description',
    evaluationId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationCriteriaController],
      providers: [
        {
          provide: EvaluationCriteriaService,
          useValue: {
            createEvaluationCriteria: jest.fn(),
            getAllEvaluationCriteria: jest.fn(),
            getEvaluationCriteriaById: jest.fn(),
            updateEvaluationCriteria: jest.fn(),
            deleteEvaluationCriteria: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EvaluationCriteriaController>(
      EvaluationCriteriaController,
    );
    service = module.get<EvaluationCriteriaService>(EvaluationCriteriaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvaluationCriteria', () => {
    it('should create evaluation criteria', async () => {
      const body = {
        name: 'Final Exam',
        evaluationId: 1,
        weight: 30,
        description: 'Test description',
      };

      jest
        .spyOn(service, 'createEvaluationCriteria')
        .mockResolvedValue(mockCriteria);

      const result = await controller.createEvaluationCriteria(body);

      expect(service.createEvaluationCriteria).toHaveBeenCalledWith({
        name: body.name,
        evaluationId: body.evaluationId,
        weight: body.weight,
        description: body.description,
      });
      expect(result.data).toEqual(mockCriteria);
    });

    it('should throw error for invalid input', async () => {
      const body = {
        name: '',
        evaluationId: 'invalid',
        weight: 30,
      };

      await expect(controller.createEvaluationCriteria(body)).rejects.toThrow();
    });
  });

  describe('getAllEvaluationCriteria', () => {
    it('should return paginated criteria', async () => {
      const mockResult = {
        criteria: [mockCriteria],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluationCriteria')
        .mockResolvedValue(mockResult);

      const result = await controller.getAllEvaluationCriteria('1', '1', '10');

      expect(service.getAllEvaluationCriteria).toHaveBeenCalledWith(1, 1, 10);
      expect(result.data).toEqual(mockResult);
    });

    it('should use default pagination values', async () => {
      const mockResult = {
        criteria: [mockCriteria],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(service, 'getAllEvaluationCriteria')
        .mockResolvedValue(mockResult);

      await controller.getAllEvaluationCriteria('1');

      expect(service.getAllEvaluationCriteria).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('getEvaluationCriteriaById', () => {
    it('should return criteria by id', async () => {
      jest
        .spyOn(service, 'getEvaluationCriteriaById')
        .mockResolvedValue(mockCriteria);

      const result = await controller.getEvaluationCriteriaById('1');

      expect(service.getEvaluationCriteriaById).toHaveBeenCalledWith(1);
      expect(result.data).toEqual(mockCriteria);
    });
  });

  describe('updateEvaluationCriteria', () => {
    it('should update evaluation criteria', async () => {
      const body = { name: 'Updated Name' };
      const updatedCriteria = { ...mockCriteria, name: body.name };

      jest
        .spyOn(service, 'updateEvaluationCriteria')
        .mockResolvedValue(updatedCriteria);

      const result = await controller.updateEvaluationCriteria('1', body);

      expect(service.updateEvaluationCriteria).toHaveBeenCalledWith(1, {
        name: body.name,
      });
      expect(result.data).toEqual(updatedCriteria);
    });

    it('should update weight', async () => {
      const body = { weight: 50 };
      const updatedCriteria = { ...mockCriteria, weight: 50 };

      jest
        .spyOn(service, 'updateEvaluationCriteria')
        .mockResolvedValue(updatedCriteria);

      const result = await controller.updateEvaluationCriteria('1', body);

      expect((result.data as typeof updatedCriteria).weight).toBe(50);
    });
  });

  describe('deleteEvaluationCriteria', () => {
    it('should delete criteria', async () => {
      jest
        .spyOn(service, 'deleteEvaluationCriteria')
        .mockResolvedValue(undefined);

      const result = await controller.deleteEvaluationCriteria('1');

      expect(service.deleteEvaluationCriteria).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
