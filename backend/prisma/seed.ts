import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('��� Seed database');

  try {
    // Clean up
    await prisma.evaluationSubmission.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.studentLesson.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.classSchedule.deleteMany();
    await prisma.class.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const user1 = await prisma.user.create({
      data: {
        email: 'professor1@university.edu',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Prof. Maria',
        role: 'PROFESSOR',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'student1@university.edu',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Ana Student',
        role: 'STUDENT',
      },
    });

    // Create professor
    const prof = await prisma.professor.create({
      data: {
        userId: user1.id,
        phone: '11999999999',
      },
    });

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user2.id,
        phone: '11988888888',
      },
    });

    // Create class
    const classRoom = await prisma.class.create({
      data: {
        name: 'Math 101',
        subject: 'Matemática',
        description: 'Introduction to Calculus',
        maxCapacity: 30,
        professorId: prof.id,
      },
    });

    // Enroll student
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: classRoom.id,
      },
    });

    // Create evaluations with weights
    await prisma.evaluation.create({
      data: {
        name: 'Midterm',
        classId: classRoom.id,
        dueDate: new Date('2025-03-15'),
        status: 'OPEN',
        gradeWeight: 40,
      },
    });

    await prisma.evaluation.create({
      data: {
        name: 'Final',
        classId: classRoom.id,
        dueDate: new Date('2025-05-20'),
        status: 'OPEN',
        gradeWeight: 60,
      },
    });

    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
