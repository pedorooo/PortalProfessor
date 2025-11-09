import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockEvaluation = {
  id: 1,
  name: 'Midterm Exam',
  classId: 1,
  dueDate: new Date('2025-12-01'),
  status: 'OPEN',
};

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: PrismaService,
          useValue: {
            evaluation: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            evaluationSubmission: {
              deleteMany: jest.fn(),
            },
            grade: {
              deleteMany: jest.fn(),
            },
            evaluationCriterion: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createEvaluation', () => {
    it('should create a new evaluation', async () => {
      const dto = {
        name: 'Final Exam',
        classId: 1,
        dueDate: new Date('2025-12-15'),
      };

      jest
        .spyOn(prisma.evaluation, 'create')
        .mockResolvedValue(mockEvaluation as any);

      const result = await service.createEvaluation(dto);

      expect(prisma.evaluation.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          classId: dto.classId,
          dueDate: dto.dueDate,
          status: 'OPEN',
        },
      });
      expect(result.name).toBe(mockEvaluation.name);
      expect(result.classId).toBe(mockEvaluation.classId);
    });

    it('should create evaluation with custom status', async () => {
      const dto = {
        name: 'Quiz',
        classId: 1,
        dueDate: new Date('2025-12-10'),
        status: 'CLOSED' as const,
      };

      jest
        .spyOn(prisma.evaluation, 'create')
        .mockResolvedValue({ ...mockEvaluation, status: 'CLOSED' } as any);

      const result = await service.createEvaluation(dto);

      expect(prisma.evaluation.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          classId: dto.classId,
          dueDate: dto.dueDate,
          status: 'CLOSED',
        },
      });
      expect(result.status).toBe('CLOSED');
    });
  });

  describe('getAllEvaluations', () => {
    it('should return paginated evaluations', async () => {
      const mockEvaluations = [mockEvaluation];

      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.evaluation, 'findMany')
        .mockResolvedValue(mockEvaluations as any);

      const result = await service.getAllEvaluations(1, 10);

      expect(result.evaluations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by search term', async () => {
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);

      await service.getAllEvaluations(1, 10, 'Exam');

      expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'Exam', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter by classId', async () => {
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);

      await service.getAllEvaluations(1, 10, undefined, 5);

      expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classId: 5,
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);

      await service.getAllEvaluations(1, 10, undefined, undefined, 'CLOSED');

      expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CLOSED',
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      jest.spyOn(prisma.evaluation, 'count').mockResolvedValue(25);
      jest.spyOn(prisma.evaluation, 'findMany').mockResolvedValue([]);

      const result = await service.getAllEvaluations(3, 5);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
        }),
      );
    });
  });

  describe('getEvaluationById', () => {
    it('should return an evaluation by id', async () => {
      jest
        .spyOn(prisma.evaluation, 'findUnique')
        .mockResolvedValue(mockEvaluation as any);

      const result = await service.getEvaluationById(1);

      expect(prisma.evaluation.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.name).toBe(mockEvaluation.name);
    });

    it('should throw error if evaluation not found', async () => {
      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue(null);

      await expect(service.getEvaluationById(999)).rejects.toThrow(
        'Evaluation not found',
      );
    });
  });

  describe('updateEvaluation', () => {
    it('should update evaluation name', async () => {
      const dto = { name: 'Updated Name' };

      jest
        .spyOn(prisma.evaluation, 'findUnique')
        .mockResolvedValueOnce(mockEvaluation as any)
        .mockResolvedValueOnce({
          ...mockEvaluation,
          name: dto.name,
        } as any);

      jest.spyOn(prisma.evaluation, 'update').mockResolvedValue({
        ...mockEvaluation,
        name: dto.name,
      } as any);

      const result = await service.updateEvaluation(1, dto);

      expect(prisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: dto.name },
      });
      expect(result.name).toBe(dto.name);
    });

    it('should update evaluation status', async () => {
      const dto = { status: 'CLOSED' as const };

      jest
        .spyOn(prisma.evaluation, 'findUnique')
        .mockResolvedValueOnce(mockEvaluation as any)
        .mockResolvedValueOnce({
          ...mockEvaluation,
          status: dto.status,
        } as any);

      jest.spyOn(prisma.evaluation, 'update').mockResolvedValue({
        ...mockEvaluation,
        status: dto.status,
      } as any);

      const result = await service.updateEvaluation(1, dto);

      expect(prisma.evaluation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CLOSED' },
      });
      expect(result.status).toBe('CLOSED');
    });

    it('should throw error if evaluation not found', async () => {
      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateEvaluation(999, { name: 'Test' }),
      ).rejects.toThrow('Evaluation not found');
    });
  });

  describe('deleteEvaluation', () => {
    it('should delete an evaluation and related records', async () => {
      jest
        .spyOn(prisma.evaluation, 'findUnique')
        .mockResolvedValue(mockEvaluation as any);

      jest
        .spyOn(prisma.evaluationSubmission, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);

      jest
        .spyOn(prisma.grade, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);

      jest
        .spyOn(prisma.evaluationCriterion, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);

      jest
        .spyOn(prisma.evaluation, 'delete')
        .mockResolvedValue(mockEvaluation as any);

      await service.deleteEvaluation(1);

      expect(prisma.evaluationSubmission.deleteMany).toHaveBeenCalledWith({
        where: { evaluationId: 1 },
      });
      expect(prisma.evaluationCriterion.deleteMany).toHaveBeenCalledWith({
        where: { evaluationId: 1 },
      });
      expect(prisma.evaluation.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if evaluation not found', async () => {
      jest.spyOn(prisma.evaluation, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteEvaluation(999)).rejects.toThrow(
        'Evaluation not found',
      );
    });
  });
});
