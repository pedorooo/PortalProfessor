import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateEvaluationSchema } from './dto/create-evaluation.dto';
import { UpdateEvaluationSchema } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Pagination } from '../common/decorators/pagination.decorator';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import type { PaginationParams } from '../common/utils/pagination.util';
import type { EvaluationResponse } from './evaluations.service';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  /**
   * Create a new evaluation
   * POST /evaluations
   */
  @Post()
  async createEvaluation(
    @Body(new ZodValidationPipe(CreateEvaluationSchema))
    dto: any,
  ): Promise<EvaluationResponse> {
    return this.evaluationsService.createEvaluation(dto);
  }

  /**
   * Get all evaluations with pagination and filtering
   * GET /evaluations?page=1&limit=10&search=exam&classId=1&status=OPEN
   */
  @Get()
  async getAllEvaluations(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
    @Query('status') status?: string,
  ): Promise<{
    data: EvaluationResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const classIdNum = classId ? Number.parseInt(classId, 10) : undefined;

    const result = await this.evaluationsService.getAllEvaluations(
      pagination.page,
      pagination.limit,
      search,
      classIdNum,
      status,
    );

    return createPaginatedResponse(
      result.evaluations,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Get a single evaluation by ID
   * GET /evaluations/:evaluationId
   */
  @Get(':evaluationId')
  async getEvaluation(
    @Param('evaluationId', new ParseIdPipe('evaluationId'))
    evaluationId: number,
  ): Promise<EvaluationResponse> {
    return this.evaluationsService.getEvaluationById(evaluationId);
  }

  /**
   * Update an evaluation
   * PUT /evaluations/:evaluationId
   */
  @Put(':evaluationId')
  async updateEvaluation(
    @Param('evaluationId', new ParseIdPipe('evaluationId'))
    evaluationId: number,
    @Body(new ZodValidationPipe(UpdateEvaluationSchema))
    dto: any,
  ): Promise<EvaluationResponse> {
    return this.evaluationsService.updateEvaluation(evaluationId, dto);
  }

  /**
   * Delete an evaluation
   * DELETE /evaluations/:evaluationId
   */
  @Delete(':evaluationId')
  @HttpCode(204)
  async deleteEvaluation(
    @Param('evaluationId', new ParseIdPipe('evaluationId'))
    evaluationId: number,
  ): Promise<void> {
    return this.evaluationsService.deleteEvaluation(evaluationId);
  }
}
