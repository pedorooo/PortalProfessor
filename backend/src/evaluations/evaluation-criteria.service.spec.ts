import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvaluationCriteriaService', () => {
  let service: EvaluationCriteriaService;
  let prisma: PrismaService;

  const mockCriteria = {
    id: 1,
    name: 'Test Criteria',
    weight: 30,
    description: 'Test description',
    evaluationId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationCriteriaService,
        {
          provide: PrismaService,
          useValue: {
            evaluation: {
              findUnique: jest.fn(),
            },
            evaluationCriterion: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
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

    service = module.get<EvaluationCriteriaService>(EvaluationCriteriaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvaluationCriteria', () => {
    it('should create a new evaluation criteria', async () => {
      const dto = {
        name: 'Final Exam',
        evaluationId: 1,
        weight: 30,
        description: 'Test description',
      };

      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Evaluation',
      } as any);
      jest.spyOn(prisma.evaluationCriterion, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.evaluationCriterion, 'create')
        .mockResolvedValue(mockCriteria as any);

      const result = await service.createEvaluationCriteria(dto);

      expect(prisma.evaluationCriterion.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          weight: dto.weight,
          description: dto.description,
          evaluationId: dto.evaluationId,
        },
      });
      expect(result.name).toBe(mockCriteria.name);
      expect(result.weight).toBe(mockCriteria.weight);
    });

    it('should throw error if evaluation not found', async () => {
      const dto = {
        name: 'Final Exam',
        evaluationId: 999,
        weight: 30,
      };

      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue(null);

      await expect(service.createEvaluationCriteria(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if total weight exceeds 100%', async () => {
      const dto = {
        name: 'Final Exam',
        evaluationId: 1,
        weight: 40,
      };

      const existingCriteria = {
        ...mockCriteria,
        weight: 70,
      };

      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Evaluation',
      } as any);
      jest
        .spyOn(prisma.evaluationCriterion, 'findMany')
        .mockResolvedValue([existingCriteria] as any);

      await expect(service.createEvaluationCriteria(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow creating criteria when total weight equals 100%', async () => {
      const dto = {
        name: 'Final Exam',
        evaluationId: 1,
        weight: 40,
      };

      const existingCriteria = {
        ...mockCriteria,
        weight: 60,
      };

      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Evaluation',
      } as any);
      jest
        .spyOn(prisma.evaluationCriterion, 'findMany')
        .mockResolvedValue([existingCriteria] as any);
      jest.spyOn(prisma.evaluationCriterion, 'create').mockResolvedValue({
        ...mockCriteria,
        weight: 40,
      } as any);

      const result = await service.createEvaluationCriteria(dto);

      expect(result.weight).toBe(40);
    });
  });

  describe('getAllEvaluationCriteria', () => {
    it('should return paginated criteria', async () => {
      const mockCriteriaList = [mockCriteria];

      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Evaluation',
      } as any);
      jest.spyOn(prisma.evaluationCriterion, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.evaluationCriterion, 'findMany')
        .mockResolvedValue(mockCriteriaList as any);

      const result = await service.getAllEvaluationCriteria(1, 1, 10);

      expect(result.criteria).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should throw error if evaluation not found', async () => {
      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getAllEvaluationCriteria(999, 1, 10),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEvaluationCriteriaById', () => {
    it('should return criteria by id', async () => {
      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(mockCriteria as any);

      const result = await service.getEvaluationCriteriaById(1);

      expect(prisma.evaluationCriterion.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.name).toBe(mockCriteria.name);
    });

    it('should throw error if criteria not found', async () => {
      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getEvaluationCriteriaById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEvaluationCriteria', () => {
    it('should update criteria name', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(mockCriteria as any);
      jest.spyOn(prisma.evaluationCriterion, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.evaluationCriterion, 'update').mockResolvedValue({
        ...mockCriteria,
        name: dto.name,
      } as any);

      const result = await service.updateEvaluationCriteria(1, dto);

      expect(prisma.evaluationCriterion.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: dto.name,
          weight: undefined,
          description: undefined,
        },
      });
      expect(result.name).toBe(dto.name);
    });

    it('should update criteria weight', async () => {
      const dto = { weight: 50 };

      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(mockCriteria as any);
      jest.spyOn(prisma.evaluationCriterion, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.evaluationCriterion, 'update').mockResolvedValue({
        ...mockCriteria,
        weight: 50,
      } as any);

      const result = await service.updateEvaluationCriteria(1, dto);

      expect(result.weight).toBe(50);
    });

    it('should throw error if weight update exceeds 100%', async () => {
      const dto = { weight: 60 };

      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(mockCriteria as any);

      const otherCriteria = {
        ...mockCriteria,
        id: 2,
        weight: 50,
      };

      jest
        .spyOn(prisma.evaluationCriterion, 'findMany')
        .mockResolvedValue([otherCriteria] as any);

      await expect(service.updateEvaluationCriteria(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if criteria not found', async () => {
      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.updateEvaluationCriteria(999, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvaluationCriteria', () => {
    it('should delete criteria and related grades', async () => {
      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(mockCriteria as any);
      jest
        .spyOn(prisma.grade, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);
      jest
        .spyOn(prisma.evaluationCriterion, 'delete')
        .mockResolvedValue(mockCriteria as any);

      await service.deleteEvaluationCriteria(1);

      expect(prisma.grade.deleteMany).toHaveBeenCalledWith({
        where: { criterionId: 1 },
      });
      expect(prisma.evaluationCriterion.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if criteria not found', async () => {
      jest
        .spyOn(prisma.evaluationCriterion, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.deleteEvaluationCriteria(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
