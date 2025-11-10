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

  async createProfessor(dto: CreateProfessorDto): Promise<ProfessorResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

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

    const updateUserData: any = {};
    if (dto.name !== undefined) {
      updateUserData.name = dto.name;
    }

    if (Object.keys(updateUserData).length > 0) {
      await this.prisma.user.update({
        where: { id: professor.userId },
        data: updateUserData,
      });
    }

    const updatedProfessor = await this.prisma.professor.findUnique({
      where: { id: professorId },
      include: { user: true },
    });

    return this.formatProfessorResponse(updatedProfessor!);
  }

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const totalStudents = await this.prisma.student.count();

    const totalClasses = await this.prisma.class.count();

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const enrollmentsForTrend = await this.prisma.enrollment.findMany({
      where: {
        enrolledAt: { gte: sixMonthsAgo },
      },
      select: { enrolledAt: true },
      orderBy: { enrolledAt: 'asc' },
    });

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

  private formatProfessorResponse(professor: any): ProfessorResponse {
    return {
      id: professor.id,
      userId: professor.user.id,
      name: professor.user.name,
      email: professor.user.email,
      createdAt: professor.createdAt,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }
}
