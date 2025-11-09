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
import { StudentsService } from './students.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateStudentSchema } from './dto/create-student.dto';
import { UpdateStudentSchema } from './dto/update-student.dto';
import { Pagination } from '../common/decorators/pagination.decorator';
import { createPaginatedResponse } from '../common/utils/pagination.util';
import type { PaginationParams } from '../common/utils/pagination.util';
import type { StudentResponse, StudentListResponse } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async getAllStudents(
    @Pagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('classId') classId?: string,
  ): Promise<{
    data: StudentListResponse[];
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

    if (
      classIdNum !== undefined &&
      (Number.isNaN(classIdNum) || classIdNum < 1)
    ) {
      throw new BadRequestException('ClassId must be a positive number');
    }

    const result = await this.studentsService.getAllStudents(
      pagination.page,
      pagination.limit,
      search,
      status,
      classIdNum,
    );

    return createPaginatedResponse(
      result.students,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':studentId')
  async getStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<StudentResponse> {
    if (!Number.isInteger(studentId) || studentId < 1) {
      throw new BadRequestException('Invalid student ID');
    }

    return this.studentsService.getStudentById(studentId);
  }

  @Post()
  async createStudent(
    @Body(new ZodValidationPipe(CreateStudentSchema))
    dto: any,
  ): Promise<StudentResponse> {
    return this.studentsService.createStudent(dto);
  }

  @Put(':studentId')
  async updateStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body(new ZodValidationPipe(UpdateStudentSchema))
    dto: any,
  ): Promise<StudentResponse> {
    if (!Number.isInteger(studentId) || studentId < 1) {
      throw new BadRequestException('Invalid student ID');
    }

    return this.studentsService.updateStudent(studentId, dto);
  }

  @Delete(':studentId')
  async deleteStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<{ message: string }> {
    if (!Number.isInteger(studentId) || studentId < 1) {
      throw new BadRequestException('Invalid student ID');
    }

    await this.studentsService.deleteStudent(studentId);
    return { message: 'Student deleted successfully' };
  }
}
