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
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new student
   */
  async createStudent(dto: CreateStudentDto): Promise<StudentResponse> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create user and student records
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

    return this.formatStudentResponse(student, user);
  }

  /**
   * Get all students with pagination and filtering
   */
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

    // Build where clause for filtering
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
      // Filter by enrollment status if classId is provided
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

    // Get total count
    const total = await this.prisma.student.count({ where: whereClause });

    // Get students with pagination
    const students = await this.prisma.student.findMany({
      where: whereClause,
      include: {
        user: true,
        enrollments: true,
      },
      skip,
      take: limit,
      orderBy: { user: { name: 'asc' } },
    });

    const formattedStudents = students.map((student) => ({
      ...this.formatStudentResponse(student, student.user),
      enrollmentCount: student.enrollments.length,
    }));

    return {
      students: formattedStudents,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single student by ID
   */
  async getStudentById(studentId: number): Promise<StudentResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, enrollments: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    return {
      ...this.formatStudentResponse(student, student.user),
      enrollmentCount: student.enrollments.length,
    };
  }

  /**
   * Update a student
   */
  async updateStudent(
    studentId: number,
    dto: UpdateStudentDto,
  ): Promise<StudentResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, enrollments: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Update user fields
    const updateUserData: any = {};
    if (dto.name !== undefined) {
      updateUserData.name = dto.name;
    }

    const updateStudentData: any = {};
    if (dto.phone !== undefined) {
      updateStudentData.phone = dto.phone;
    }

    // Update records
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

    // Fetch updated records
    const updatedStudent = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, enrollments: true },
    });

    return {
      ...this.formatStudentResponse(updatedStudent!, updatedStudent!.user),
      enrollmentCount: updatedStudent!.enrollments.length,
    };
  }

  /**
   * Delete a student
   */
  async deleteStudent(studentId: number): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Delete related records first
    await this.prisma.studentLesson.deleteMany({
      where: { studentId },
    });

    await this.prisma.evaluationSubmission.deleteMany({
      where: { studentId },
    });

    await this.prisma.enrollment.deleteMany({
      where: { studentId },
    });

    // Delete student record
    await this.prisma.student.delete({
      where: { id: studentId },
    });

    // Delete user record
    await this.prisma.user.delete({
      where: { id: student.userId },
    });
  }

  /**
   * Get students by class with enrollment status
   */
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
      status: enrollment.status,
      className: '', // Will be populated by the controller if needed
    }));
  }

  /**
   * Helper method to format student response
   */
  private formatStudentResponse(student: any, user: any): StudentResponse {
    return {
      id: student.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: student.phone || null,
      status: 'ACTIVE',
      createdAt: student.createdAt || user.createdAt,
      enrollmentCount: 0,
    };
  }

  /**
   * Hash password - delegated to UsersService
   */
  private async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }
}
