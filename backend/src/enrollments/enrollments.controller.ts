import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentSchema } from './dto/create-enrollment.dto';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import { Pagination } from '../common/decorators/pagination.decorator';
import type { PaginationParams } from '../common/utils/pagination.util';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEnrollment(@Body() body: unknown): Promise<{ data: unknown }> {
    const dto = CreateEnrollmentSchema.parse(body);
    const data = await this.enrollmentsService.createEnrollment(dto);
    return { data };
  }

  @Get('student/:studentId')
  async getStudentEnrollments(
    @Param('studentId', ParseIntPipe) studentId: number,
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
    const result = await this.enrollmentsService.getStudentEnrollments(
      studentId,
      pagination.page,
      pagination.limit,
    );

    return createPaginatedResponse(
      result.enrollments,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Delete(':enrollmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ): Promise<void> {
    await this.enrollmentsService.deleteEnrollment(enrollmentId);
  }
}
