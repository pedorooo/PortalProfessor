"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getClassById } from "@/lib/api-client";
import type { ClassApiResponse } from "@/lib/api-client";
import { useToast } from "@/context/ToastContext";

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const toastContext = useToast();
  const [classData, setClassData] = useState<ClassApiResponse | null>(null);

  // Fetch class details from API
  useEffect(() => {
    const fetchClass = async () => {
      try {
        if (!classId) return;
        const classIdNumber = Number.parseInt(classId, 10);
        const data = await getClassById(classIdNumber);
        setClassData(data);
      } catch (error: unknown) {
        console.error("Failed to load class:", error);
        toastContext.error("Erro ao carregar turma");
        // Don't redirect automatically - let child routes handle their own errors
      }
    };

    fetchClass();
  }, [classId, toastContext]);

  const { students } = useClassStudents(classId || "");
  const { lessons } = useClassLessons(classId || "");
  const { evaluations } = useClassEvaluations(classId || "");

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
    (classData.enrollmentCount / classData.maxCapacity) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <ClassHeader
        name={classData.name}
        subject={classData.subject}
        professor={classData.professorName}
        description={classData.description || ""}
      />

      {/* Stats */}
      <ClassStats
        studentCount={classData.enrollmentCount}
        maxCapacity={classData.maxCapacity}
        enrollmentPercentage={enrollmentPercentage}
        barColor={colors.bar}
        classAverage={classData.classAverage}
        averageAttendance={classData.averageAttendance}
      />

      {/* Class Info */}
      <ClassInfo professor={classData.professorName} />

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/dashboard/classes/${classId}/evaluation-config`)
                }
              >
                Configurar Pesos
              </Button>
              <Button
                onClick={() =>
                  navigate(`/dashboard/classes/${classId}/evaluations`)
                }
              >
                Ver Página Completa
              </Button>
            </div>
          </div>
          <EvaluationsList evaluations={evaluations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
