"use client";

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClasses } from "@/hooks/use-classes";
import { useClassStudents } from "@/hooks/use-class-students";
import { useClassLessons } from "@/hooks/use-class-lessons";
import { useClassEvaluations } from "@/hooks/use-class-evaluations";
import { ClassHeader } from "@/components/class/ClassHeader";
import { ClassStats } from "@/components/class/ClassStats";
import { ClassInfo } from "@/components/class/ClassInfo";
import { StudentsList } from "@/components/class/StudentsList";
import { LessonsList } from "@/components/class/LessonsList";
import { EvaluationsList } from "@/components/class/EvaluationsList";
import { SUBJECT_COLORS } from "@/constants/subjects";

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClasses();
  const { students } = useClassStudents(classId || "");
  const { lessons } = useClassLessons(classId || "");
  const { evaluations } = useClassEvaluations(classId || "");

  // Find the class by ID
  const classData = classes.find((cls) => cls.id === classId);

  if (!classData) {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/classes")}
          className="gap-2"
        >
          Voltar para Turmas
        </Button>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Turma não encontrada</p>
        </div>
      </div>
    );
  }

  const colors =
    (classData.subject && SUBJECT_COLORS[classData.subject]) ||
    SUBJECT_COLORS.Matemática;
  const enrollmentPercentage =
    (classData.studentCount / classData.maxCapacity) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ClassHeader
        name={classData.name}
        subject={classData.subject}
        professor={classData.professor}
        description={classData.description || ""}
      />

      {/* Stats */}
      <ClassStats
        studentCount={classData.studentCount}
        maxCapacity={classData.maxCapacity}
        enrollmentPercentage={enrollmentPercentage}
        barColor={colors.bar}
      />

      {/* Class Info */}
      <ClassInfo professor={classData.professor} />

      {/* Tabs Section */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="lessons">Aulas</TabsTrigger>
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Alunos Matriculados</h2>
            <Button
              onClick={() => navigate(`/dashboard/classes/${classId}/students`)}
            >
              Ver Página Completa
            </Button>
          </div>
          <StudentsList students={students} />
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Aulas</h2>
            <Button
              onClick={() => navigate(`/dashboard/classes/${classId}/lessons`)}
            >
              Ver Página Completa
            </Button>
          </div>
          <LessonsList lessons={lessons} />
        </TabsContent>

        {/* Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Avaliações</h2>
            <Button
              onClick={() =>
                navigate(`/dashboard/classes/${classId}/evaluation-config`)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Configurar Avaliações
            </Button>
          </div>
          <EvaluationsList evaluations={evaluations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
