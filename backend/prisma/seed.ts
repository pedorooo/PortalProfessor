import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.evaluationSubmission.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.evaluationCriterion.deleteMany();
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

    // Create users (Professors)
    console.log('👨‍🏫 Creating professors...');
    const professorUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'professor1@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Dr. Maria Silva',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor2@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Prof. João Santos',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor3@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Prof. Ana Costa',
          role: 'PROFESSOR',
        },
      }),
    ]);

    // Create professors
    const professors = await Promise.all([
      prisma.professor.create({
        data: {
          userId: professorUsers[0].id,
          phone: '+55 11 98765-4321',
        },
      }),
      prisma.professor.create({
        data: {
          userId: professorUsers[1].id,
          phone: '+55 21 99876-5432',
        },
      }),
      prisma.professor.create({
        data: {
          userId: professorUsers[2].id,
          phone: '+55 31 99999-1111',
        },
      }),
    ]);

    // Create users (Students)
    console.log('👨‍🎓 Creating students...');
    const studentUsers = await Promise.all(
      Array.from({ length: 15 }, async (_, i) =>
        prisma.user.create({
          data: {
            email: `student${i + 1}@example.com`,
            passwordHash: await bcrypt.hash('password123', 10),
            name: `Student ${i + 1}`,
            role: 'STUDENT',
          },
        }),
      ),
    );

    // Create students
    const students = await Promise.all(
      studentUsers.map((user) =>
        prisma.student.create({
          data: {
            userId: user.id,
            phone: `+55 11 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          },
        }),
      ),
    );

    // Create classes
    console.log('📚 Creating classes...');
    const classes = await Promise.all([
      prisma.class.create({
        data: {
          name: 'Mathematics 101',
          subject: 'Mathematics',
          description: 'Introduction to Calculus',
          maxCapacity: 30,
          professorId: professors[0].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'Physics 101',
          subject: 'Physics',
          description: 'Introduction to Classical Mechanics',
          maxCapacity: 25,
          professorId: professors[1].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'Chemistry 101',
          subject: 'Chemistry',
          description: 'General Chemistry Fundamentals',
          maxCapacity: 28,
          professorId: professors[2].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'Advanced Mathematics',
          subject: 'Mathematics',
          description: 'Linear Algebra and Differential Equations',
          maxCapacity: 20,
          professorId: professors[0].id,
        },
      }),
    ]);

    // Create class schedules
    console.log('📅 Creating class schedules...');
    await Promise.all(
      classes.map((classItem) =>
        prisma.classSchedule.create({
          data: {
            dayOfWeek: 'Monday',
            startTime: new Date('2025-01-13T09:00:00'),
            endTime: new Date('2025-01-13T10:30:00'),
            classId: classItem.id,
          },
        }),
      ),
    );

    // Create enrollments
    console.log('✅ Creating enrollments...');
    for (let i = 0; i < classes.length; i++) {
      const enrollmentCount = i === 0 ? 10 : i === 1 ? 8 : i === 2 ? 12 : 6;
      for (let j = 0; j < enrollmentCount; j++) {
        await prisma.enrollment.create({
          data: {
            studentId: students[j].id,
            classId: classes[i].id,
            status: 'ACTIVE',
          },
        });
      }
    }

    // Create evaluations with criteria
    console.log('📝 Creating evaluations with criteria...');

    // Evaluations for Mathematics 101
    const mathEval1 = await prisma.evaluation.create({
      data: {
        name: 'Midterm Exam',
        classId: classes[0].id,
        dueDate: new Date('2025-03-15'),
        status: 'OPEN',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Multiple Choice',
          weight: 40,
          description: 'Multiple choice questions (10 questions)',
          evaluationId: mathEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Short Answer',
          weight: 30,
          description: 'Short answer questions (5 questions)',
          evaluationId: mathEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Problem Solving',
          weight: 30,
          description: 'Complex problem solving (3 problems)',
          evaluationId: mathEval1.id,
        },
      }),
    ]);

    const mathEval2 = await prisma.evaluation.create({
      data: {
        name: 'Final Project',
        classId: classes[0].id,
        dueDate: new Date('2025-05-30'),
        status: 'OPEN',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Presentation',
          weight: 50,
          description: 'Quality of presentation',
          evaluationId: mathEval2.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Content Quality',
          weight: 50,
          description: 'Depth and correctness of content',
          evaluationId: mathEval2.id,
        },
      }),
    ]);

    // Evaluations for Physics 101
    const physicsEval1 = await prisma.evaluation.create({
      data: {
        name: 'Lab Report 1',
        classId: classes[1].id,
        dueDate: new Date('2025-02-28'),
        status: 'OPEN',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Methodology',
          weight: 35,
          description: 'Correctness of experimental methodology',
          evaluationId: physicsEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Data Analysis',
          weight: 35,
          description: 'Quality of data analysis and graphs',
          evaluationId: physicsEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Conclusions',
          weight: 30,
          description: 'Validity and clarity of conclusions',
          evaluationId: physicsEval1.id,
        },
      }),
    ]);

    const physicsEval2 = await prisma.evaluation.create({
      data: {
        name: 'Midterm Quiz',
        classId: classes[1].id,
        dueDate: new Date('2025-04-10'),
        status: 'CLOSED',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Conceptual Understanding',
          weight: 60,
          description: 'Understanding of core physics concepts',
          evaluationId: physicsEval2.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Problem Solving',
          weight: 40,
          description: 'Application of concepts to problems',
          evaluationId: physicsEval2.id,
        },
      }),
    ]);

    // Evaluations for Chemistry 101
    const chemEval1 = await prisma.evaluation.create({
      data: {
        name: 'Lab Practicum',
        classId: classes[2].id,
        dueDate: new Date('2025-03-22'),
        status: 'OPEN',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Safety Compliance',
          weight: 25,
          description: 'Adherence to lab safety protocols',
          evaluationId: chemEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Technique',
          weight: 35,
          description: 'Proper experimental technique',
          evaluationId: chemEval1.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Results',
          weight: 40,
          description: 'Accuracy and interpretation of results',
          evaluationId: chemEval1.id,
        },
      }),
    ]);

    // Evaluations for Advanced Mathematics
    const advMathEval = await prisma.evaluation.create({
      data: {
        name: 'Comprehensive Exam',
        classId: classes[3].id,
        dueDate: new Date('2025-05-10'),
        status: 'OPEN',
      },
    });

    await Promise.all([
      prisma.evaluationCriterion.create({
        data: {
          name: 'Theoretical Understanding',
          weight: 40,
          description: 'Mastery of theoretical concepts',
          evaluationId: advMathEval.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Problem Solving',
          weight: 40,
          description: 'Ability to solve complex problems',
          evaluationId: advMathEval.id,
        },
      }),
      prisma.evaluationCriterion.create({
        data: {
          name: 'Proof Writing',
          weight: 20,
          description: 'Quality of mathematical proofs',
          evaluationId: advMathEval.id,
        },
      }),
    ]);

    // Create some grades
    console.log('⭐ Creating sample grades...');
    const enrollmentsWithGrades = await prisma.enrollment.findMany({
      take: 5,
    });

    const criteria = await prisma.evaluationCriterion.findMany({
      take: 3,
    });

    for (const enrollment of enrollmentsWithGrades) {
      for (const criterion of criteria) {
        await prisma.grade.create({
          data: {
            enrollmentId: enrollment.id,
            criterionId: criterion.id,
            value: Math.round(Math.random() * 100) / 10, // Random grade from 0 to 10
          },
        });
      }
    }

    // Create evaluation submissions
    console.log('📬 Creating evaluation submissions...');
    const evaluations = await prisma.evaluation.findMany({
      take: 4,
    });

    for (const evaluation of evaluations) {
      const classEnrollments = await prisma.enrollment.findMany({
        where: { classId: evaluation.classId },
        take: 3,
      });

      for (const enrollment of classEnrollments) {
        await prisma.evaluationSubmission.create({
          data: {
            studentId: enrollment.studentId,
            evaluationId: evaluation.id,
            grade: Math.round(Math.random() * 100) / 10,
            submittedAt: new Date(),
            feedback: 'Good work! Keep improving.',
          },
        });
      }
    }

    console.log('✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✓ 3 Professors created');
    console.log('✓ 15 Students created');
    console.log('✓ 4 Classes created');
    console.log('✓ 8 Evaluations created');
    console.log('✓ 24 Evaluation Criteria created');
    console.log('✓ Sample grades and submissions created');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
