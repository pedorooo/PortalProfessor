import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('��� Seed database');

  try {
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
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

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

    const user3 = await prisma.user.create({
      data: {
        email: 'student2@university.edu',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'João Silva',
        role: 'STUDENT',
      },
    });

    const user4 = await prisma.user.create({
      data: {
        email: 'student3@university.edu',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Maria Santos',
        role: 'STUDENT',
      },
    });

    const user5 = await prisma.user.create({
      data: {
        email: 'student4@university.edu',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Pedro Costa',
        role: 'STUDENT',
      },
    });

    const prof = await prisma.professor.create({
      data: {
        userId: user1.id,
        phone: '11999999999',
      },
    });

    const student1 = await prisma.student.create({
      data: {
        userId: user2.id,
        phone: '11988888888',
      },
    });

    const student2 = await prisma.student.create({
      data: {
        userId: user3.id,
        phone: '11977777777',
      },
    });

    const student3 = await prisma.student.create({
      data: {
        userId: user4.id,
        phone: '11966666666',
      },
    });

    const student4 = await prisma.student.create({
      data: {
        userId: user5.id,
        phone: '11955555555',
      },
    });

    const classRoom = await prisma.class.create({
      data: {
        name: 'Math 101',
        subject: 'Matemática',
        description: 'Introduction to Calculus',
        maxCapacity: 30,
        professorId: prof.id,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        classId: classRoom.id,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        classId: classRoom.id,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student3.id,
        classId: classRoom.id,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student4.id,
        classId: classRoom.id,
      },
    });

    const evaluation1 = await prisma.evaluation.create({
      data: {
        name: 'Midterm',
        classId: classRoom.id,
        dueDate: new Date('2025-03-15'),
        status: 'OPEN',
        gradeWeight: 40,
      },
    });

    const evaluation2 = await prisma.evaluation.create({
      data: {
        name: 'Final',
        classId: classRoom.id,
        dueDate: new Date('2025-05-20'),
        status: 'OPEN',
        gradeWeight: 60,
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student1.id,
        evaluationId: evaluation1.id,
        grade: 8.5,
        submittedAt: new Date('2025-03-14'),
        feedback: 'Excelente trabalho!',
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student2.id,
        evaluationId: evaluation1.id,
        grade: 7,
        submittedAt: new Date('2025-03-14'),
        feedback: 'Bom trabalho.',
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student3.id,
        evaluationId: evaluation1.id,
        grade: 9,
        submittedAt: new Date('2025-03-15'),
        feedback: 'Muito bom!',
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student4.id,
        evaluationId: evaluation1.id,
        grade: 6.5,
        submittedAt: new Date('2025-03-15'),
        feedback: 'Precisa melhorar alguns conceitos.',
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student1.id,
        evaluationId: evaluation2.id,
        grade: 9.5,
        submittedAt: new Date('2025-05-19'),
        feedback: 'Excelente progresso!',
      },
    });

    await prisma.evaluationSubmission.create({
      data: {
        studentId: student2.id,
        evaluationId: evaluation2.id,
        grade: 8,
        submittedAt: new Date('2025-05-19'),
        feedback: 'Muito bom!',
      },
    });

    const lesson1 = await prisma.lesson.create({
      data: {
        topic: 'Introduction to Calculus',
        date: new Date('2025-02-10'),
        status: 'COMPLETED',
        duration: 90,
        content: 'Basic concepts of derivatives',
        classId: classRoom.id,
      },
    });

    const lesson2 = await prisma.lesson.create({
      data: {
        topic: 'Limits and Continuity',
        date: new Date('2025-02-15'),
        status: 'COMPLETED',
        duration: 90,
        content: 'Understanding limits',
        classId: classRoom.id,
      },
    });

    const lesson3 = await prisma.lesson.create({
      data: {
        topic: 'Derivatives',
        date: new Date('2025-02-20'),
        status: 'COMPLETED',
        duration: 90,
        content: 'Derivative rules and applications',
        classId: classRoom.id,
      },
    });

    const lesson4 = await prisma.lesson.create({
      data: {
        topic: 'Integration',
        date: new Date('2025-02-25'),
        status: 'COMPLETED',
        duration: 90,
        content: 'Basic integration techniques',
        classId: classRoom.id,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student1.id,
        lessonId: lesson1.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student2.id,
        lessonId: lesson1.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student3.id,
        lessonId: lesson1.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student4.id,
        lessonId: lesson1.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student1.id,
        lessonId: lesson2.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student2.id,
        lessonId: lesson2.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student3.id,
        lessonId: lesson2.id,
        attendance: false,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student4.id,
        lessonId: lesson2.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student1.id,
        lessonId: lesson3.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student2.id,
        lessonId: lesson3.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student3.id,
        lessonId: lesson3.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student4.id,
        lessonId: lesson3.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student1.id,
        lessonId: lesson4.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student2.id,
        lessonId: lesson4.id,
        attendance: false,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student3.id,
        lessonId: lesson4.id,
        attendance: true,
      },
    });

    await prisma.studentLesson.create({
      data: {
        studentId: student4.id,
        lessonId: lesson4.id,
        attendance: false,
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
