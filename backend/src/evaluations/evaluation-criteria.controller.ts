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
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { CreateEvaluationCriteriaSchema } from './dto/create-evaluation-criteria.dto';
import { UpdateEvaluationCriteriaSchema } from './dto/update-evaluation-criteria.dto';
import { createPaginatedResponse } from '../common/utils/pagination.util';

@Controller('evaluation-criteria')
@UseGuards(JwtAuthGuard)
export class EvaluationCriteriaController {
  constructor(
    private readonly evaluationCriteriaService: EvaluationCriteriaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvaluationCriteria(
    @Body() body: unknown,
  ): Promise<{ data: unknown }> {
    const dto = CreateEvaluationCriteriaSchema.parse(body);
    const data =
      await this.evaluationCriteriaService.createEvaluationCriteria(dto);
    return { data };
  }

  @Get()
  async getAllEvaluationCriteria(
    @Query('evaluationId') evaluationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{
    data: unknown[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const result =
      await this.evaluationCriteriaService.getAllEvaluationCriteria(
        Number.parseInt(evaluationId),
        Number.parseInt(page),
        Number.parseInt(limit),
      );
    return createPaginatedResponse(
      result.criteria,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':criteriaId')
  async getEvaluationCriteriaById(
    @Param('criteriaId') criteriaId: string,
  ): Promise<{ data: unknown }> {
    const data = await this.evaluationCriteriaService.getEvaluationCriteriaById(
      Number.parseInt(criteriaId),
    );
    return { data };
  }

  @Put(':criteriaId')
  async updateEvaluationCriteria(
    @Param('criteriaId') criteriaId: string,
    @Body() body: unknown,
  ): Promise<{ data: unknown }> {
    const dto = UpdateEvaluationCriteriaSchema.parse(body);
    const data = await this.evaluationCriteriaService.updateEvaluationCriteria(
      Number.parseInt(criteriaId),
      dto,
    );
    return { data };
  }

  @Delete(':criteriaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvaluationCriteria(
    @Param('criteriaId') criteriaId: string,
  ): Promise<void> {
    await this.evaluationCriteriaService.deleteEvaluationCriteria(
      Number.parseInt(criteriaId),
    );
  }
}
