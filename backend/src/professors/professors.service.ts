import { Injectable, BadRequestException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { UpdateProfessorDto } from './dto/update-professor.dto';
import type { CreateProfessorDto } from './dto/create-professor.dto';
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
