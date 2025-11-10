import { Injectable, BadRequestException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { CreateStudentDto } from './dto/create-student.dto';
import type { UpdateStudentDto } from './dto/update-student.dto';
import type { Role } from '@prisma/client';

export interface StudentResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  enrollmentCount: number;
}

export interface StudentListResponse extends StudentResponse {
  className?: string;
  classId?: number;
  grade?: number;
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createStudent(dto: CreateStudentDto): Promise<StudentListResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (dto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });
      if (!classExists) {
        throw new BadRequestException('Class not found');
      }
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await this.hashPassword(dto.password),
        name: dto.name,
        role: 'STUDENT' as Role,
      },
    });

    const student = await this.prisma.student.create({
      data: {
        userId: user.id,
        phone: dto.phone || null,
      },
    });

    let className: string | undefined;
    let classId: number | undefined;
    let enrollmentStatus: string | undefined;

    if (dto.classId) {
      const enrollmentStatusValue =
        dto.status === 'INACTIVE' ? 'CANCELED' : dto.status || 'ACTIVE';

      const enrollment = await this.prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: dto.classId,
          status: enrollmentStatusValue as any,
          enrolledAt: new Date(),
        },
        include: {
          class: true,
        },
      });
      className = enrollment.class.name;
      classId = enrollment.classId;
      enrollmentStatus = enrollment.status;
    }

    return {
      ...this.formatStudentResponse(student, user, enrollmentStatus),
      className,
      classId,
      grade: undefined,
    };
  }

  async getAllStudents(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    classId?: number,
  ): Promise<{
    students: StudentListResponse[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status && status !== 'ALL') {
      if (classId) {
        const enrollments = await this.prisma.enrollment.findMany({
          where: {
            class: { id: classId },
            status: (status === 'ACTIVE' ? 'ACTIVE' : 'COMPLETED') as any,
          },
          select: { studentId: true },
        });
        whereClause.id = { in: enrollments.map((e) => e.studentId) };
      }
    }

    if (classId) {
      whereClause.enrollments = {
        some: { classId },
      };
    }

    const total = await this.prisma.student.count({ where: whereClause });

    const students = await this.prisma.student.findMany({
      where: whereClause,
      include: {
        user: true,
        enrollments: {
          include: {
            class: true,
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
      },
      skip,
      take: limit,
      orderBy: { user: { name: 'asc' } },
    });

    const formattedStudents = await Promise.all(
      students.map(async (student) => {
        const latestEnrollment = student.enrollments[0];
        let className: string | undefined;
        let classId: number | undefined;
        let grade: number | undefined;

        if (latestEnrollment) {
          className = latestEnrollment.class.name;
          classId = latestEnrollment.class.id;

          const evaluationSubmissions =
            await this.prisma.evaluationSubmission.findMany({
              where: {
                studentId: student.id,
                evaluation: {
                  classId: latestEnrollment.classId,
                },
                grade: {
                  not: null,
                },
              },
              select: {
                grade: true,
              },
            });

          if (evaluationSubmissions.length > 0) {
            const totalGrade = evaluationSubmissions.reduce(
              (sum, sub) => sum + (sub.grade || 0),
              0,
            );
            grade = totalGrade / evaluationSubmissions.length;
          }
        }

        return {
          ...this.formatStudentResponse(
            student,
            student.user,
            latestEnrollment?.status,
          ),
          enrollmentCount: student.enrollments.length,
          className,
          classId,
          grade,
        };
      }),
    );

    return {
      students: formattedStudents,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getStudentById(studentId: number): Promise<StudentListResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        enrollments: {
          include: {
            class: true,
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const latestEnrollment = student.enrollments[0];
    let className: string | undefined;
    let classId: number | undefined;
    let grade: number | undefined;

    if (latestEnrollment) {
      className = latestEnrollment.class.name;
      classId = latestEnrollment.class.id;

      const evaluationSubmissions =
        await this.prisma.evaluationSubmission.findMany({
          where: {
            studentId: student.id,
            evaluation: {
              classId: latestEnrollment.classId,
            },
            grade: {
              not: null,
            },
          },
          select: {
            grade: true,
          },
        });

      if (evaluationSubmissions.length > 0) {
        const totalGrade = evaluationSubmissions.reduce(
          (sum, sub) => sum + (sub.grade || 0),
          0,
        );
        grade = totalGrade / evaluationSubmissions.length;
      }
    }

    return {
      ...this.formatStudentResponse(
        student,
        student.user,
        latestEnrollment?.status,
      ),
      enrollmentCount: student.enrollments.length,
      className,
      classId,
      grade,
    };
  }

  async updateStudent(
    studentId: number,
    dto: UpdateStudentDto,
  ): Promise<StudentListResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, enrollments: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const updateUserData: any = {};
    if (dto.name !== undefined) {
      updateUserData.name = dto.name;
    }

    const updateStudentData: any = {};
    if (dto.phone !== undefined) {
      updateStudentData.phone = dto.phone;
    }

    if (Object.keys(updateUserData).length > 0) {
      await this.prisma.user.update({
        where: { id: student.userId },
        data: updateUserData,
      });
    }

    if (Object.keys(updateStudentData).length > 0) {
      await this.prisma.student.update({
        where: { id: studentId },
        data: updateStudentData,
      });
    }

    if (dto.status !== undefined) {
      const enrollmentStatus =
        dto.status === 'INACTIVE' ? 'CANCELED' : dto.status;

      await this.prisma.enrollment.updateMany({
        where: {
          studentId: studentId,
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
        data: {
          status: enrollmentStatus as any,
        },
      });
    }

    const updatedStudent = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        enrollments: {
          include: {
            class: true,
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
      },
    });

    const latestEnrollment = updatedStudent!.enrollments[0];
    let className: string | undefined;
    let classId: number | undefined;
    let grade: number | undefined;

    if (latestEnrollment) {
      className = latestEnrollment.class.name;
      classId = latestEnrollment.class.id;

      const evaluationSubmissions =
        await this.prisma.evaluationSubmission.findMany({
          where: {
            studentId: updatedStudent!.id,
            evaluation: {
              classId: latestEnrollment.classId,
            },
            grade: {
              not: null,
            },
          },
          select: {
            grade: true,
          },
        });

      if (evaluationSubmissions.length > 0) {
        const totalGrade = evaluationSubmissions.reduce(
          (sum, sub) => sum + (sub.grade || 0),
          0,
        );
        grade = totalGrade / evaluationSubmissions.length;
      }
    }

    return {
      ...this.formatStudentResponse(
        updatedStudent!,
        updatedStudent!.user,
        latestEnrollment?.status,
      ),
      enrollmentCount: updatedStudent!.enrollments.length,
      className,
      classId,
      grade,
    };
  }

  async deleteStudent(studentId: number): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    await this.prisma.studentLesson.deleteMany({
      where: { studentId },
    });

    await this.prisma.evaluationSubmission.deleteMany({
      where: { studentId },
    });

    await this.prisma.enrollment.deleteMany({
      where: { studentId },
    });

    await this.prisma.student.delete({
      where: { id: studentId },
    });

    await this.prisma.user.delete({
      where: { id: student.userId },
    });
  }

  async getStudentsByClass(classId: number): Promise<StudentListResponse[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: {
          include: { user: true },
        },
      },
      orderBy: { student: { user: { name: 'asc' } } },
    });

    return enrollments.map((enrollment) => ({
      ...this.formatStudentResponse(
        enrollment.student,
        enrollment.student.user,
      ),
      status: enrollment.status === 'CANCELED' ? 'INACTIVE' : enrollment.status,
      className: '',
    }));
  }

  private formatStudentResponse(
    student: any,
    user: any,
    status?: string,
  ): StudentResponse {
    // Mapeia CANCELED para INACTIVE para manter compatibilidade com o frontend
    const mappedStatus =
      status === 'CANCELED' ? 'INACTIVE' : status || 'ACTIVE';

    return {
      id: student.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: student.phone || null,
      status: mappedStatus,
      createdAt: student.createdAt || user.createdAt,
      enrollmentCount: 0,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }
}
