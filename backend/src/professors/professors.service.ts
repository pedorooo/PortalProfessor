import { Injectable, BadRequestException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { UpdateProfessorDto } from './dto/update-professor.dto';
import type { CreateProfessorDto } from './dto/create-professor.dto';
import type { DashboardStatsResponse } from './dto/dashboard-stats.dto';
import type { Role } from '@prisma/client';

export interface ProfessorResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class ProfessorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new professor
   */
  async createProfessor(dto: CreateProfessorDto): Promise<ProfessorResponse> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create user and professor records
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await this.hashPassword(dto.password),
        name: dto.name,
        role: 'PROFESSOR' as Role,
      },
    });

    const professor = await this.prisma.professor.create({
      data: {
        userId: user.id,
      },
      include: { user: true },
    });

    return this.formatProfessorResponse(professor);
  }

  /**
   * Get all professors with pagination and optional filtering
   */
  async getAllProfessors(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    professors: ProfessorResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.professor.count({ where: whereClause });

    const professors = await this.prisma.professor.findMany({
      where: whereClause,
      include: { user: true },
      skip,
      take: limit,
      orderBy: { user: { name: 'asc' } },
    });

    return {
      professors: professors.map((p) => this.formatProfessorResponse(p)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single professor by ID
   */
  async getProfessorById(professorId: number): Promise<ProfessorResponse> {
    const professor = await this.prisma.professor.findUnique({
      where: { id: professorId },
      include: { user: true },
    });

    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    return this.formatProfessorResponse(professor);
  }

  /**
   * Get professor by userId
   */
  async getProfessorByUserId(userId: number): Promise<ProfessorResponse> {
    const professor = await this.prisma.professor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    return this.formatProfessorResponse(professor);
  }

  /**
   * Update a professor
   */
  async updateProfessor(
    professorId: number,
    dto: UpdateProfessorDto,
  ): Promise<ProfessorResponse> {
    const professor = await this.prisma.professor.findUnique({
      where: { id: professorId },
      include: { user: true },
    });

    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    // Update user fields
    const updateUserData: any = {};
    if (dto.name !== undefined) {
      updateUserData.name = dto.name;
    }

    // Update records
    if (Object.keys(updateUserData).length > 0) {
      await this.prisma.user.update({
        where: { id: professor.userId },
        data: updateUserData,
      });
    }

    // Fetch updated records
    const updatedProfessor = await this.prisma.professor.findUnique({
      where: { id: professorId },
      include: { user: true },
    });

    return this.formatProfessorResponse(updatedProfessor!);
  }

  /**
   * Get dashboard statistics for all students and classes in the system
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    // Get total number of students in the system
    const totalStudents = await this.prisma.student.count();

    // Get total number of classes in the system
    const totalClasses = await this.prisma.class.count();

    // Get upcoming evaluations (next 30 days) across all classes
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingEvaluations = await this.prisma.evaluation.count({
      where: {
        dueDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Get average student score across all evaluation submissions
    const evaluations = await this.prisma.evaluation.findMany({
      select: {
        id: true,
        submissions: {
          select: { grade: true },
        },
      },
    });

    let totalGrades = 0;
    let gradeCount = 0;
    for (const evaluation of evaluations) {
      for (const submission of evaluation.submissions) {
        if (submission.grade !== null) {
          totalGrades += submission.grade;
          gradeCount++;
        }
      }
    }
    const avgStudentScore = gradeCount > 0 ? totalGrades / gradeCount : 0;

    // Get enrollment trend for last 6 months across all classes
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const enrollmentsForTrend = await this.prisma.enrollment.findMany({
      where: {
        enrolledAt: { gte: sixMonthsAgo },
      },
      select: { enrolledAt: true },
      orderBy: { enrolledAt: 'asc' },
    });

    // Group enrollments by month
    const enrollmentsByMonth = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
      enrollmentsByMonth.set(monthKey, 0);
    }

    for (const enrollment of enrollmentsForTrend) {
      const monthKey = enrollment.enrolledAt.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
      if (enrollmentsByMonth.has(monthKey)) {
        enrollmentsByMonth.set(monthKey, enrollmentsByMonth.get(monthKey)! + 1);
      }
    }

    const enrollmentTrend = Array.from(enrollmentsByMonth.entries()).map(
      ([month, students]) => ({ month, students }),
    );

    return {
      totalStudents,
      totalClasses,
      upcomingEvaluations,
      avgStudentScore: Math.round(avgStudentScore * 100) / 100,
      enrollmentTrend,
    };
  }

  /**
   * Helper method to format professor response
   */
  private formatProfessorResponse(professor: any): ProfessorResponse {
    return {
      id: professor.id,
      userId: professor.user.id,
      name: professor.user.name,
      email: professor.user.email,
      createdAt: professor.createdAt,
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }
}
