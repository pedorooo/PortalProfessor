import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClassDto } from './dto/create-class.dto';
import type { UpdateClassDto } from './dto/update-class.dto';

export interface ClassResponse {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  maxCapacity: number;
  professorId: number;
  professorName: string;
  enrollmentCount: number;
  createdAt: Date;
  classAverage?: number;
  averageAttendance?: number;
}

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async createClass(dto: CreateClassDto): Promise<ClassResponse> {
    const professor = await this.prisma.professor.findUnique({
      where: { userId: dto.professorId },
      include: { user: true },
    });

    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    const classRecord = await this.prisma.class.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        description: dto.description || null,
        maxCapacity: dto.maxCapacity,
        professorId: professor.id,
      },
      include: {
        professor: {
          include: { user: true },
        },
        enrollments: true,
      },
    });

    return await this.formatClassResponse(classRecord);
  }

  async getAllClasses(
    page: number = 1,
    limit: number = 10,
    search?: string,
    professorId?: number,
    subject?: string,
  ): Promise<{
    classes: ClassResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject) {
      whereClause.subject = { equals: subject, mode: 'insensitive' };
    }

    if (professorId) {
      const professor = await this.prisma.professor.findUnique({
        where: { userId: professorId },
      });

      if (professor) {
        whereClause.professorId = professor.id;
      }
    }

    const total = await this.prisma.class.count({ where: whereClause });

    const classes = await this.prisma.class.findMany({
      where: whereClause,
      include: {
        professor: {
          include: { user: true },
        },
        enrollments: true,
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });

    const formattedClasses = await Promise.all(
      classes.map((c) => this.formatClassResponse(c)),
    );

    return {
      classes: formattedClasses,
      total,
      page,
      limit,
    };
  }

  async getClassById(classId: number): Promise<ClassResponse> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        professor: {
          include: { user: true },
        },
        enrollments: true,
      },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    return await this.formatClassResponse(classRecord);
  }

  async updateClass(
    classId: number,
    dto: UpdateClassDto,
  ): Promise<ClassResponse> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { professor: { include: { user: true } }, enrollments: true },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    let professorInternalId = classRecord.professorId;
    if (dto.professorId !== undefined) {
      const professor = await this.prisma.professor.findUnique({
        where: { userId: dto.professorId },
      });

      if (!professor) {
        throw new BadRequestException('Professor not found');
      }

      professorInternalId = professor.id;
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.subject !== undefined) updateData.subject = dto.subject;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.maxCapacity !== undefined) updateData.maxCapacity = dto.maxCapacity;
    if (dto.professorId !== undefined)
      updateData.professorId = professorInternalId;

    const updatedClass = await this.prisma.class.update({
      where: { id: classId },
      data: updateData,
      include: {
        professor: {
          include: { user: true },
        },
        enrollments: true,
      },
    });

    return await this.formatClassResponse(updatedClass);
  }

  async deleteClass(classId: number): Promise<void> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    await this.prisma.studentLesson.deleteMany({
      where: {
        lesson: {
          classId,
        },
      },
    });

    await this.prisma.lesson.deleteMany({
      where: { classId },
    });

    await this.prisma.enrollment.deleteMany({
      where: { classId },
    });

    await this.prisma.class.delete({
      where: { id: classId },
    });
  }

  async getClassStudents(
    classId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    students: Array<{
      id: number;
      userId: number;
      name: string;
      email: string;
      phone: string | null;
      status: string;
      enrolledAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { classId },
        include: {
          student: {
            include: { user: true },
          },
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where: { classId } }),
    ]);

    const students = enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      userId: enrollment.student.userId,
      name: enrollment.student.user.name,
      email: enrollment.student.user.email,
      phone: enrollment.student.phone,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    }));

    return {
      students,
      total,
      page,
      limit,
    };
  }

  async getClassEvaluations(
    classId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{
    evaluations: Array<{
      id: number;
      name: string;
      dueDate: Date;
      status: string;
      gradeWeight: number;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    const skip = (page - 1) * limit;
    const whereClause: any = { classId };

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      whereClause.status = status;
    }

    const [evaluations, total] = await Promise.all([
      this.prisma.evaluation.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.evaluation.count({ where: whereClause }),
    ]);

    return {
      evaluations: evaluations.map((e) => ({
        id: e.id,
        name: e.name,
        dueDate: e.dueDate,
        status: e.status,
        gradeWeight: e.gradeWeight,
      })),
      total,
      page,
      limit,
    };
  }

  private async formatClassResponse(classRecord: any): Promise<ClassResponse> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { classId: classRecord.id },
      include: {
        submissions: true,
      },
    });

    console.log(
      `[ClassService] Found ${evaluations.length} evaluations for class ${classRecord.id}`,
    );

    let classAverage: number | undefined = undefined;
    if (evaluations.length > 0) {
      const allGrades = evaluations.flatMap((e) =>
        e.submissions.filter((s) => s.grade !== null).map((s) => s.grade!),
      );
      console.log(
        `[ClassService] Found ${allGrades.length} grades:`,
        allGrades,
      );
      if (allGrades.length > 0) {
        const sum = allGrades.reduce((acc, grade) => acc + grade, 0);
        classAverage = sum / allGrades.length;
        console.log(`[ClassService] Calculated class average: ${classAverage}`);
      }
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { classId: classRecord.id },
      include: {
        attendances: true,
      },
    });

    console.log(
      `[ClassService] Found ${lessons.length} lessons for class ${classRecord.id}`,
    );

    let averageAttendance: number | undefined = undefined;
    if (lessons.length > 0) {
      const totalEnrollments = classRecord.enrollments?.length || 0;
      if (totalEnrollments > 0) {
        const totalPossibleAttendances = lessons.length * totalEnrollments;
        const totalActualAttendances = lessons.reduce(
          (acc, lesson) =>
            acc +
            lesson.attendances.filter((a) => a.attendance === true).length,
          0,
        );
        averageAttendance =
          (totalActualAttendances / totalPossibleAttendances) * 100;
        console.log(
          `[ClassService] Calculated average attendance: ${averageAttendance}%`,
        );
      }
    }

    console.log(
      `[ClassService] Returning response with classAverage=${classAverage}, averageAttendance=${averageAttendance}`,
    );

    return {
      id: classRecord.id,
      name: classRecord.name,
      subject: classRecord.subject,
      description: classRecord.description || null,
      maxCapacity: classRecord.maxCapacity,
      professorId: classRecord.professor.userId,
      professorName: classRecord.professor.user.name,
      enrollmentCount: classRecord.enrollments?.length || 0,
      createdAt: classRecord.createdAt,
      classAverage,
      averageAttendance,
    };
  }
}
