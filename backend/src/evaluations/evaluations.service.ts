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

  async createEvaluation(
    dto: CreateEvaluationDto,
  ): Promise<EvaluationResponse> {
    const newWeight = dto.gradeWeight || 0;

    const existingEvaluations = await this.prisma.evaluation.findMany({
      where: { classId: dto.classId },
      select: { gradeWeight: true },
    });

    const totalExistingWeight = existingEvaluations.reduce(
      (sum, e) => sum + (e.gradeWeight || 0),
      0,
    );

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

  async getEvaluationById(evaluationId: number): Promise<EvaluationResponse> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found');
    }

    return this.formatEvaluationResponse(evaluation);
  }

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

    if (dto.gradeWeight !== undefined) {
      const otherEvaluations = await this.prisma.evaluation.findMany({
        where: {
          classId: evaluation.classId,
          id: { not: evaluationId },
        },
        select: { gradeWeight: true },
      });

      const totalOtherWeight = otherEvaluations.reduce(
        (sum, e) => sum + (e.gradeWeight || 0),
        0,
      );

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

  async deleteEvaluation(evaluationId: number): Promise<void> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found');
    }

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
