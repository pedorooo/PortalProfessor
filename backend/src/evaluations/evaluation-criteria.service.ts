import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEvaluationCriteriaDto } from './dto/create-evaluation-criteria.dto';
import type { UpdateEvaluationCriteriaDto } from './dto/update-evaluation-criteria.dto';

interface EvaluationCriteriaResponse {
  id: number;
  name: string;
  weight: number;
  description?: string | null;
  evaluationId: number;
}

@Injectable()
export class EvaluationCriteriaService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvaluationCriteria(
    dto: CreateEvaluationCriteriaDto,
  ): Promise<EvaluationCriteriaResponse> {
    // Verify evaluation exists
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: dto.evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    // Check if total weight would exceed 100%
    const existingCriteria = await this.prisma.evaluationCriterion.findMany({
      where: { evaluationId: dto.evaluationId },
    });

    const totalWeight = existingCriteria.reduce(
      (sum, criteria) => sum + criteria.weight,
      0,
    );

    if (totalWeight + dto.weight > 100) {
      throw new BadRequestException(
        `Total criteria weight would exceed 100%. Current total: ${totalWeight}%, attempted to add: ${dto.weight}%`,
      );
    }

    const criteria = await this.prisma.evaluationCriterion.create({
      data: {
        name: dto.name,
        weight: dto.weight,
        description: dto.description,
        evaluationId: dto.evaluationId,
      },
    });

    return this.formatCriteriaResponse(criteria);
  }

  async getAllEvaluationCriteria(
    evaluationId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    criteria: EvaluationCriteriaResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Verify evaluation exists
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    const skip = (page - 1) * limit;

    const [criteria, total] = await Promise.all([
      this.prisma.evaluationCriterion.findMany({
        where: { evaluationId },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.evaluationCriterion.count({
        where: { evaluationId },
      }),
    ]);

    return {
      criteria: criteria.map((c) => this.formatCriteriaResponse(c)),
      total,
      page,
      limit,
    };
  }

  async getEvaluationCriteriaById(
    criteriaId: number,
  ): Promise<EvaluationCriteriaResponse> {
    const criteria = await this.prisma.evaluationCriterion.findUnique({
      where: { id: criteriaId },
    });

    if (!criteria) {
      throw new NotFoundException('Evaluation criteria not found');
    }

    return this.formatCriteriaResponse(criteria);
  }

  async updateEvaluationCriteria(
    criteriaId: number,
    dto: UpdateEvaluationCriteriaDto,
  ): Promise<EvaluationCriteriaResponse> {
    // Verify criteria exists
    const criteria = await this.prisma.evaluationCriterion.findUnique({
      where: { id: criteriaId },
    });

    if (!criteria) {
      throw new NotFoundException('Evaluation criteria not found');
    }

    // If weight is being updated, validate it doesn't exceed 100%
    if (dto.weight !== undefined && dto.weight !== criteria.weight) {
      const otherCriteria = await this.prisma.evaluationCriterion.findMany({
        where: {
          evaluationId: criteria.evaluationId,
          id: { not: criteriaId },
        },
      });

      const otherTotalWeight = otherCriteria.reduce(
        (sum, c) => sum + c.weight,
        0,
      );

      if (otherTotalWeight + dto.weight > 100) {
        throw new BadRequestException(
          `Total criteria weight would exceed 100%. Other criteria total: ${otherTotalWeight}%, attempted weight: ${dto.weight}%`,
        );
      }
    }

    const updated = await this.prisma.evaluationCriterion.update({
      where: { id: criteriaId },
      data: {
        name: dto.name,
        weight: dto.weight,
        description: dto.description,
      },
    });

    return this.formatCriteriaResponse(updated);
  }

  async deleteEvaluationCriteria(criteriaId: number): Promise<void> {
    const criteria = await this.prisma.evaluationCriterion.findUnique({
      where: { id: criteriaId },
    });

    if (!criteria) {
      throw new NotFoundException('Evaluation criteria not found');
    }

    await this.prisma.grade.deleteMany({
      where: { criterionId: criteriaId },
    });

    await this.prisma.evaluationCriterion.delete({
      where: { id: criteriaId },
    });
  }

  private formatCriteriaResponse(criteria: any): EvaluationCriteriaResponse {
    return {
      id: criteria.id,
      name: criteria.name,
      weight: criteria.weight,
      description: criteria.description,
      evaluationId: criteria.evaluationId,
    };
  }
}
