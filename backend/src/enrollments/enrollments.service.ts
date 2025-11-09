import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEnrollmentDto } from './dto/create-enrollment.dto';

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  status: string;
  enrolledAt: Date;
  gradeAverage: number | null;
}

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEnrollment(
    dto: CreateEnrollmentDto,
  ): Promise<EnrollmentResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const classRecord = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId: dto.studentId,
        classId: dto.classId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'Student is already enrolled in this class',
      );
    }

    const enrollmentCount = await this.prisma.enrollment.count({
      where: { classId: dto.classId, status: 'ACTIVE' },
    });

    if (enrollmentCount >= classRecord.maxCapacity) {
      throw new BadRequestException(
        `Class has reached maximum capacity of ${classRecord.maxCapacity}`,
      );
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        status: dto.status || 'ACTIVE',
      },
      include: {
        student: {
          include: { user: true },
        },
        class: true,
      },
    });

    return this.formatEnrollmentResponse(enrollment);
  }

  async getStudentEnrollments(
    studentId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    enrollments: EnrollmentResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { studentId },
        include: {
          student: {
            include: { user: true },
          },
          class: true,
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where: { studentId } }),
    ]);

    return {
      enrollments: enrollments.map((e) => this.formatEnrollmentResponse(e)),
      total,
      page,
      limit,
    };
  }

  async deleteEnrollment(enrollmentId: number): Promise<void> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.grade.deleteMany({
      where: { enrollmentId },
    });

    await this.prisma.enrollment.delete({
      where: { id: enrollmentId },
    });
  }

  private formatEnrollmentResponse(enrollment: any): EnrollmentResponse {
    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      studentName: enrollment.student.user.name,
      classId: enrollment.classId,
      className: enrollment.class.name,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      gradeAverage: enrollment.gradeAverage,
    };
  }
}
