import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateClassSchema } from './dto/create-class.dto';
import { UpdateClassSchema } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Pagination } from '../common/decorators/pagination.decorator';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import type { PaginationParams } from '../common/utils/pagination.util';
import type { ClassResponse } from './classes.service';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  async getAllClasses(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('professorId', new ParseIdPipe('professorId')) professorId?: number,
    @Query('subject') subject?: string,
  ): Promise<{
    data: ClassResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const result = await this.classesService.getAllClasses(
      pagination.page,
      pagination.limit,
      search,
      professorId,
      subject,
    );

    return createPaginatedResponse(
      result.classes,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':classId')
  async getClass(
    @Param('classId', ParseIntPipe) classId: number,
  ): Promise<ClassResponse> {
    if (!Number.isInteger(classId) || classId < 1) {
      throw new BadRequestException('Invalid class ID');
    }

    return this.classesService.getClassById(classId);
  }

  @Post()
  async createClass(
    @Body(new ZodValidationPipe(CreateClassSchema))
    dto: any,
  ): Promise<ClassResponse> {
    return this.classesService.createClass(dto);
  }

  @Put(':classId')
  async updateClass(
    @Param('classId', ParseIntPipe) classId: number,
    @Body(new ZodValidationPipe(UpdateClassSchema))
    dto: any,
  ): Promise<ClassResponse> {
    if (!Number.isInteger(classId) || classId < 1) {
      throw new BadRequestException('Invalid class ID');
    }

    return this.classesService.updateClass(classId, dto);
  }

  @Delete(':classId')
  async deleteClass(
    @Param('classId', ParseIntPipe) classId: number,
  ): Promise<{ message: string }> {
    if (!Number.isInteger(classId) || classId < 1) {
      throw new BadRequestException('Invalid class ID');
    }

    await this.classesService.deleteClass(classId);
    return { message: 'Class deleted successfully' };
  }

  @Get(':classId/students')
  async getClassStudents(
    @Param('classId', ParseIntPipe) classId: number,
    @Pagination() pagination: PaginationParams,
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
    const result = await this.classesService.getClassStudents(
      classId,
      pagination.page,
      pagination.limit,
    );

    return createPaginatedResponse(
      result.students,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':classId/evaluations')
  async getClassEvaluations(
    @Param('classId', ParseIntPipe) classId: number,
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('status') status?: string,
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
    const result = await this.classesService.getClassEvaluations(
      classId,
      pagination.page,
      pagination.limit,
      search,
      status,
    );

    return createPaginatedResponse(
      result.evaluations,
      result.total,
      result.page,
      result.limit,
    );
  }
}
