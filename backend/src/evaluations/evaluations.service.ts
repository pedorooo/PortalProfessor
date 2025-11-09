import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEvaluationDto } from './dto/create-evaluation.dto';
import type { UpdateEvaluationDto } from './dto/update-evaluation.dto';

export interface EvaluationResponse {
  id: number;
  name: string;
  classId: number;
  dueDate: Date;
  status: string;
  gradeWeight: number;
  createdAt?: Date;
}

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new evaluation
   */
  async createEvaluation(
    dto: CreateEvaluationDto,
  ): Promise<EvaluationResponse> {
    const newWeight = dto.gradeWeight || 0;

    // Get total weight of existing evaluations for this class
    const existingEvaluations = await this.prisma.evaluation.findMany({
      where: { classId: dto.classId },
      select: { gradeWeight: true },
    });

    const totalExistingWeight = existingEvaluations.reduce(
      (sum, e) => sum + (e.gradeWeight || 0),
      0,
    );

    // Check if adding the new weight would exceed 100%
    if (totalExistingWeight + newWeight > 100) {
      throw new BadRequestException(
        `Total weight cannot exceed 100%. Current total: ${totalExistingWeight}%, ` +
          `adding ${newWeight}% would result in ${totalExistingWeight + newWeight}%`,
      );
    }

    const evaluation = await this.prisma.evaluation.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        dueDate: dto.dueDate,
        gradeWeight: newWeight,
        status: dto.status || 'OPEN',
      },
    });

    return this.formatEvaluationResponse(evaluation);
  }

  /**
   * Get all evaluations with pagination and optional filtering
   */
  async getAllEvaluations(
    page: number = 1,
    limit: number = 10,
    search?: string,
    classId?: number,
    status?: string,
  ): Promise<{
    evaluations: EvaluationResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    if (classId !== undefined) {
      whereClause.classId = classId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const total = await this.prisma.evaluation.count({ where: whereClause });

    const evaluations = await this.prisma.evaluation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { dueDate: 'desc' },
    });

    return {
      evaluations: evaluations.map((e) => this.formatEvaluationResponse(e)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single evaluation by ID
   */
  async getEvaluationById(evaluationId: number): Promise<EvaluationResponse> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found');
    }

    return this.formatEvaluationResponse(evaluation);
  }

  /**
   * Update an evaluation
   */
  async updateEvaluation(
    evaluationId: number,
    dto: UpdateEvaluationDto,
  ): Promise<EvaluationResponse> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found');
    }

    // If gradeWeight is being updated, validate total weight
    if (dto.gradeWeight !== undefined) {
      // Get total weight of other evaluations in the same class
      const otherEvaluations = await this.prisma.evaluation.findMany({
        where: {
          classId: evaluation.classId,
          id: { not: evaluationId }, // Exclude current evaluation
        },
        select: { gradeWeight: true },
      });

      const totalOtherWeight = otherEvaluations.reduce(
        (sum, e) => sum + (e.gradeWeight || 0),
        0,
      );

      // Check if the new weight would exceed 100%
      if (totalOtherWeight + dto.gradeWeight > 100) {
        throw new BadRequestException(
          `Total weight cannot exceed 100%. Other evaluations total: ${totalOtherWeight}%, ` +
            `setting this to ${dto.gradeWeight}% would result in ${totalOtherWeight + dto.gradeWeight}%`,
        );
      }
    }

    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.gradeWeight !== undefined) {
      updateData.gradeWeight = dto.gradeWeight;
    }

    const updatedEvaluation = await this.prisma.evaluation.update({
      where: { id: evaluationId },
      data: updateData,
    });

    return this.formatEvaluationResponse(updatedEvaluation);
  }

  /**
   * Delete an evaluation
   */
  async deleteEvaluation(evaluationId: number): Promise<void> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found');
    }

    // Delete related records first
    await this.prisma.evaluationSubmission.deleteMany({
      where: { evaluationId },
    });

    await this.prisma.grade.deleteMany({
      where: {
        enrollment: {
          class: {
            evaluations: {
              some: {
                id: evaluationId,
              },
            },
          },
        },
      },
    });

    await this.prisma.evaluation.delete({
      where: { id: evaluationId },
    });
  }

  /**
   * Helper method to format evaluation response
   */
  private formatEvaluationResponse(evaluation: any): EvaluationResponse {
    return {
      id: evaluation.id,
      name: evaluation.name,
      classId: evaluation.classId,
      dueDate: evaluation.dueDate,
      status: evaluation.status,
      gradeWeight: evaluation.gradeWeight,
    };
  }
}
