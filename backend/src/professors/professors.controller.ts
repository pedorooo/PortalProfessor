import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateProfessorSchema } from './dto/create-professor.dto';
import { UpdateProfessorSchema } from './dto/update-professor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Pagination } from '../common/decorators/pagination.decorator';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import type { PaginationParams } from '../common/utils/pagination.util';
import type { ProfessorResponse } from './professors.service';

@Controller('professors')
@UseGuards(JwtAuthGuard)
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  /**
   * Create a new professor
   * POST /professors
   */
  @Post()
  async createProfessor(
    @Body(new ZodValidationPipe(CreateProfessorSchema))
    dto: any,
  ): Promise<ProfessorResponse> {
    return this.professorsService.createProfessor(dto);
  }

  /**
   * Get all professors with pagination and search
   * GET /professors?page=1&limit=10&search=John
   */
  @Get()
  async getAllProfessors(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
  ): Promise<{
    data: ProfessorResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const result = await this.professorsService.getAllProfessors(
      pagination.page,
      pagination.limit,
      search,
    );

    return createPaginatedResponse(
      result.professors,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Get a single professor by ID
   * GET /professors/:professorId
   */
  @Get(':professorId')
  async getProfessor(
    @Param('professorId', new ParseIdPipe('professorId')) professorId: number,
  ): Promise<ProfessorResponse> {
    return this.professorsService.getProfessorById(professorId);
  }

  /**
   * Update a professor
   * PUT /professors/:professorId
   */
  @Put(':professorId')
  async updateProfessor(
    @Param('professorId', new ParseIdPipe('professorId')) professorId: number,
    @Body(new ZodValidationPipe(UpdateProfessorSchema))
    dto: any,
  ): Promise<ProfessorResponse> {
    return this.professorsService.updateProfessor(professorId, dto);
  }
}
