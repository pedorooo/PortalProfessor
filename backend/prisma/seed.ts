import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados');

  try {
    // Limpar dados existentes
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

    // Criar usuários administradores
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@universidade.edu',
        passwordHash: await bcrypt.hash('senha123', 10),
        name: 'Administrador Sistema',
        role: 'ADMIN',
      },
    });

    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        phone: '11999999999',
      },
    });

    // Criar professores
    const professorUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'professor@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Prof. Maria Silva',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor.maria@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Prof. Maria Silva',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor.carlos@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Prof. Carlos Oliveira',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor.ana@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Prof. Ana Costa',
          role: 'PROFESSOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'professor.paulo@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Prof. Paulo Santos',
          role: 'PROFESSOR',
        },
      }),
    ]);

    const professors = await Promise.all(
      professorUsers.map((user, index) =>
        prisma.professor.create({
          data: {
            userId: user.id,
            phone: `1198888888${index}`,
          },
        }),
      ),
    );

    // Criar estudantes
    const studentUsers = await Promise.all([
      // Primeiro lote de estudantes
      prisma.user.create({
        data: {
          email: 'ana.silva@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Ana Silva',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'joao.santos@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'João Santos',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'maria.oliveira@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Maria Oliveira',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'pedro.costa@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Pedro Costa',
          role: 'STUDENT',
        },
      }),
      // Mais estudantes
      prisma.user.create({
        data: {
          email: 'carla.rodrigues@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Carla Rodrigues',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'lucas.fernandes@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Lucas Fernandes',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'julia.almeida@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Julia Almeida',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'rafael.martins@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Rafael Martins',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'fernanda.lima@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Fernanda Lima',
          role: 'STUDENT',
        },
      }),
      prisma.user.create({
        data: {
          email: 'bruno.souza@universidade.edu',
          passwordHash: await bcrypt.hash('senha123', 10),
          name: 'Bruno Souza',
          role: 'STUDENT',
        },
      }),
    ]);

    const students = await Promise.all(
      studentUsers.map((user, index) =>
        prisma.student.create({
          data: {
            userId: user.id,
            phone: `1197777777${index}`,
          },
        }),
      ),
    );

    // Criar disciplinas
    const classes = await Promise.all([
      // Disciplinas do Prof. Maria
      prisma.class.create({
        data: {
          name: 'MAT101',
          subject: 'Matemática',
          description:
            'Cálculo Diferencial e Integral I - Introdução aos conceitos fundamentais do cálculo',
          maxCapacity: 40,
          professorId: professors[0].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'MAT201',
          subject: 'Matemática',
          description: 'Álgebra Linear - Vetores, matrizes e sistemas lineares',
          maxCapacity: 35,
          professorId: professors[0].id,
        },
      }),

      // Disciplinas do Prof. Carlos
      prisma.class.create({
        data: {
          name: 'FIS101',
          subject: 'Física',
          description: 'Física Geral I - Mecânica clássica e termodinâmica',
          maxCapacity: 45,
          professorId: professors[1].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'FIS201',
          subject: 'Física',
          description: 'Eletromagnetismo - Campos elétricos e magnéticos',
          maxCapacity: 30,
          professorId: professors[1].id,
        },
      }),

      // Disciplinas do Prof. Ana
      prisma.class.create({
        data: {
          name: 'QUI101',
          subject: 'Química',
          description: 'Química Geral - Estrutura atômica e ligações químicas',
          maxCapacity: 50,
          professorId: professors[2].id,
        },
      }),

      // Disciplinas do Prof. Paulo
      prisma.class.create({
        data: {
          name: 'PROG101',
          subject: 'Programação',
          description:
            'Introdução à Programação - Algoritmos e lógica de programação',
          maxCapacity: 25,
          professorId: professors[3].id,
        },
      }),
      prisma.class.create({
        data: {
          name: 'PROG201',
          subject: 'Programação',
          description: 'Estruturas de Dados - Listas, pilhas, filas e árvores',
          maxCapacity: 20,
          professorId: professors[3].id,
        },
      }),
    ]);

    // Criar horários das aulas
    const classSchedules = await Promise.all([
      // Horários para MAT101
      prisma.classSchedule.create({
        data: {
          dayOfWeek: 'SEGUNDA',
          startTime: new Date('2025-01-01T08:00:00'),
          endTime: new Date('2025-01-01T10:00:00'),
          classId: classes[0].id,
        },
      }),
      prisma.classSchedule.create({
        data: {
          dayOfWeek: 'QUARTA',
          startTime: new Date('2025-01-01T08:00:00'),
          endTime: new Date('2025-01-01T10:00:00'),
          classId: classes[0].id,
        },
      }),

      // Horários para MAT201
      prisma.classSchedule.create({
        data: {
          dayOfWeek: 'TERCA',
          startTime: new Date('2025-01-01T10:00:00'),
          endTime: new Date('2025-01-01T12:00:00'),
          classId: classes[1].id,
        },
      }),

      // Horários para FIS101
      prisma.classSchedule.create({
        data: {
          dayOfWeek: 'SEGUNDA',
          startTime: new Date('2025-01-01T14:00:00'),
          endTime: new Date('2025-01-01T16:00:00'),
          classId: classes[2].id,
        },
      }),
      prisma.classSchedule.create({
        data: {
          dayOfWeek: 'QUINTA',
          startTime: new Date('2025-01-01T14:00:00'),
          endTime: new Date('2025-01-01T16:00:00'),
          classId: classes[2].id,
        },
      }),
    ]);

    // Matricular estudantes nas disciplinas
    const enrollments: Awaited<ReturnType<typeof prisma.enrollment.create>>[] =
      [];

    // MAT101 - Todos os estudantes
    for (const student of students) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: classes[0].id,
          },
        }),
      );
    }

    // MAT201 - Primeiros 5 estudantes
    for (let i = 0; i < 5; i++) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: students[i].id,
            classId: classes[1].id,
          },
        }),
      );
    }

    // FIS101 - Últimos 5 estudantes
    for (let i = 5; i < students.length; i++) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: students[i].id,
            classId: classes[2].id,
          },
        }),
      );
    }

    // FIS201 - Estudantes selecionados
    for (let i = 2; i < 7; i++) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: students[i].id,
            classId: classes[3].id,
          },
        }),
      );
    }

    // Criar avaliações
    const evaluations = await Promise.all([
      // Avaliações para MAT101
      prisma.evaluation.create({
        data: {
          name: 'Prova 1 - Limites e Derivadas',
          classId: classes[0].id,
          dueDate: new Date('2025-03-15'),
          status: 'OPEN',
          gradeWeight: 30,
        },
      }),
      prisma.evaluation.create({
        data: {
          name: 'Prova 2 - Integrais',
          classId: classes[0].id,
          dueDate: new Date('2025-05-20'),
          status: 'OPEN',
          gradeWeight: 40,
        },
      }),
      prisma.evaluation.create({
        data: {
          name: 'Trabalho Prático',
          classId: classes[0].id,
          dueDate: new Date('2025-04-10'),
          status: 'CLOSED',
          gradeWeight: 30,
        },
      }),

      // Avaliações para MAT201
      prisma.evaluation.create({
        data: {
          name: 'Prova 1 - Vetores',
          classId: classes[1].id,
          dueDate: new Date('2025-03-20'),
          status: 'OPEN',
          gradeWeight: 35,
        },
      }),

      // Avaliações para FIS101
      prisma.evaluation.create({
        data: {
          name: 'Prova 1 - Mecânica',
          classId: classes[2].id,
          dueDate: new Date('2025-03-10'),
          status: 'CLOSED',
          gradeWeight: 50,
        },
      }),
    ]);

    // Criar submissões de avaliações
    const submissions: Awaited<
      ReturnType<typeof prisma.evaluationSubmission.create>
    >[] = [];

    // Submissões para a primeira avaliação de MAT101
    for (let i = 0; i < students.length; i++) {
      const grade = 5 + Math.random() * 5; // Notas entre 5 e 10
      submissions.push(
        await prisma.evaluationSubmission.create({
          data: {
            studentId: students[i].id,
            evaluationId: evaluations[0].id,
            grade: parseFloat(grade.toFixed(1)),
            submittedAt: new Date('2025-03-14'),
            feedback:
              i % 3 === 0
                ? 'Excelente trabalho!'
                : i % 3 === 1
                  ? 'Bom trabalho, continue assim!'
                  : 'Precisa melhorar alguns conceitos.',
          },
        }),
      );
    }

    // Submissões para a segunda avaliação de MAT101 (alguns estudantes)
    for (let i = 0; i < 6; i++) {
      const grade = 6 + Math.random() * 4;
      submissions.push(
        await prisma.evaluationSubmission.create({
          data: {
            studentId: students[i].id,
            evaluationId: evaluations[1].id,
            grade: parseFloat(grade.toFixed(1)),
            submittedAt: new Date('2025-05-19'),
            feedback: 'Trabalho bem desenvolvido.',
          },
        }),
      );
    }

    // Criar aulas
    const lessons = await Promise.all([
      // Aulas para MAT101
      prisma.lesson.create({
        data: {
          topic: 'Introdução ao Cálculo',
          date: new Date('2025-02-10'),
          status: 'COMPLETED',
          duration: 120,
          content:
            'Conceitos básicos de limites e continuidade. História do cálculo e aplicações práticas.',
          classId: classes[0].id,
        },
      }),
      prisma.lesson.create({
        data: {
          topic: 'Derivadas - Parte 1',
          date: new Date('2025-02-17'),
          status: 'COMPLETED',
          duration: 120,
          content:
            'Definição de derivada. Regras básicas de derivação. Derivada de funções polinomiais.',
          classId: classes[0].id,
        },
      }),
      prisma.lesson.create({
        data: {
          topic: 'Derivadas - Parte 2',
          date: new Date('2025-02-24'),
          status: 'COMPLETED',
          duration: 120,
          content:
            'Regra da cadeia. Derivadas de funções trigonométricas e exponenciais.',
          classId: classes[0].id,
        },
      }),
      prisma.lesson.create({
        data: {
          topic: 'Aplicações de Derivadas',
          date: new Date('2025-03-03'),
          status: 'COMPLETED',
          duration: 120,
          content:
            'Máximos e mínimos. Taxas relacionadas. Problemas de otimização.',
          classId: classes[0].id,
        },
      }),
      prisma.lesson.create({
        data: {
          topic: 'Introdução às Integrais',
          date: new Date('2025-04-07'),
          status: 'PLANNED',
          duration: 120,
          content: 'Integrais indefinidas. Técnicas básicas de integração.',
          classId: classes[0].id,
        },
      }),

      // Aulas para MAT201
      prisma.lesson.create({
        data: {
          topic: 'Introdução à Álgebra Linear',
          date: new Date('2025-02-12'),
          status: 'COMPLETED',
          duration: 90,
          content: 'Vetores no plano e no espaço. Operações com vetores.',
          classId: classes[1].id,
        },
      }),

      // Aulas para FIS101
      prisma.lesson.create({
        data: {
          topic: 'Cinemática',
          date: new Date('2025-02-11'),
          status: 'COMPLETED',
          duration: 90,
          content: 'Movimento retilíneo uniforme e uniformemente variado.',
          classId: classes[2].id,
        },
      }),
    ]);

    // Criar registros de presença nas aulas
    const studentLessons: Awaited<
      ReturnType<typeof prisma.studentLesson.create>
    >[] = [];

    // Presenças para as aulas de MAT101
    for (const lesson of lessons.filter((l) => l.classId === classes[0].id)) {
      for (const student of students) {
        const attendance = Math.random() > 0.15;
        studentLessons.push(
          await prisma.studentLesson.create({
            data: {
              studentId: student.id,
              lessonId: lesson.id,
              attendance,
            },
          }),
        );
      }
    }

    // Presenças para outras aulas (amostra menor)
    for (let i = 5; i < lessons.length; i++) {
      for (let j = 0; j < 5; j++) {
        const attendance = Math.random() > 0.2;
        studentLessons.push(
          await prisma.studentLesson.create({
            data: {
              studentId: students[j].id,
              lessonId: lessons[i].id,
              attendance,
            },
          }),
        );
      }
    }

    // Criar notas adicionais
    const grades: Awaited<ReturnType<typeof prisma.grade.create>>[] = [];
    for (const enrollment of enrollments) {
      // Criar algumas notas para cada matrícula
      for (let i = 0; i < 3; i++) {
        const value = 4 + Math.random() * 6;
        grades.push(
          await prisma.grade.create({
            data: {
              enrollmentId: enrollment.id,
              value: parseFloat(value.toFixed(1)),
            },
          }),
        );
      }
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 Estatísticas:`);
    console.log(`   👨‍🏫 Professores: ${professors.length}`);
    console.log(`   👨‍🎓 Estudantes: ${students.length}`);
    console.log(`   📚 Disciplinas: ${classes.length}`);
    console.log(`   🗓️  Aulas: ${lessons.length}`);
    console.log(`   📝 Avaliações: ${evaluations.length}`);
    console.log(`   📋 Matrículas: ${enrollments.length}`);
    console.log(`   📄 Submissões: ${submissions.length}`);
    console.log(`   ✅ Presenças: ${studentLessons.length}`);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
