"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/ui/page-loader";
import { useClassStudents } from "@/hooks/use-class-students";
import { useClassEvaluations } from "@/hooks/use-class-evaluations";
import { ClassHeader } from "@/components/class/ClassHeader";
import { ClassStats } from "@/components/class/ClassStats";
import { ClassInfo } from "@/components/class/ClassInfo";
import { StudentsList } from "@/components/class/StudentsList";
import { EvaluationsList } from "@/components/class/EvaluationsList";
import { EnrollStudentDialog } from "@/components/class/EnrollStudentDialog";
import { SUBJECT_COLORS } from "@/constants/subjects";
import { getClassById } from "@/lib/api-client";
import type { ClassApiResponse } from "@/lib/api/classes";
import { createStudent } from "@/lib/api/students";
import { useToast } from "@/context/ToastContext";
import { Plus, Settings2 } from "lucide-react";

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const toastContext = useToast();
  const [classData, setClassData] = useState<ClassApiResponse | null>(null);
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [studentsRefreshKey, setStudentsRefreshKey] = useState(0);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setIsLoadingClass(true);
        if (!classId) return;
        const classIdNumber = Number.parseInt(classId, 10);
        const data = await getClassById(classIdNumber);
        setClassData(data);
      } catch (error: unknown) {
        console.error("Failed to load class:", error);
        toastContext.error("Erro ao carregar turma");
      } finally {
        setIsLoadingClass(false);
      }
    };

    fetchClass();
  }, [classId, toastContext, studentsRefreshKey]);

  const { students, loading: studentsLoading } = useClassStudents(
    classId || "",
    studentsRefreshKey
  );
  const { evaluations, loading: evaluationsLoading } = useClassEvaluations(
    classId || ""
  );

  const refreshData = async () => {
    if (!classId) return;
    try {
      const classIdNumber = Number.parseInt(classId, 10);
      const data = await getClassById(classIdNumber);
      setClassData(data);
      setStudentsRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to refresh class:", error);
    }
  };

  const handleEnrollStudent = async (studentData: {
    name: string;
    email: string;
    phone?: string;
    status: "active" | "inactive";
    enrollmentDate: string;
  }) => {
    if (!classId) return;

    setIsEnrolling(true);
    try {
      await createStudent({
        name: studentData.name,
        email: studentData.email,
        password: "Senha@123", // Senha padrão temporária
        phone: studentData.phone,
        classId: Number.parseInt(classId, 10),
        status: studentData.status.toUpperCase(),
      });

      setIsEnrollDialogOpen(false);
      toastContext.success("Aluno matriculado com sucesso!");

      await refreshData();
    } catch (error) {
      console.error("Error enrolling student:", error);
      toastContext.error("Erro ao matricular aluno");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoadingClass) {
    return <PageLoader />;
  }

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
      {}
      <ClassHeader
        name={classData.name}
        subject={classData.subject}
        professor={classData.professorName}
        description={classData.description || ""}
      />

      {}
      <ClassStats
        studentCount={classData.enrollmentCount}
        maxCapacity={classData.maxCapacity}
        enrollmentPercentage={enrollmentPercentage}
        barColor={colors.bar}
        classAverage={classData.classAverage}
        averageAttendance={classData.averageAttendance}
      />

      {}
      <ClassInfo
        professor={classData.professorName}
        schedule={classData.schedule}
      />

      {}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="flex w-fit rounded-full">
          <TabsTrigger className="px-4 rounded-full" value="students">
            Alunos
          </TabsTrigger>
          {/* <TabsTrigger value="lessons">Aulas</TabsTrigger> */}
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Alunos Matriculados</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEnrollDialogOpen(true)}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Matricular Aluno
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/dashboard/classes/${classId}/students`)
                }
              >
                Ver Página Completa
              </Button>
            </div>
          </div>
          <StudentsList students={students} isLoading={studentsLoading} />
        </TabsContent>

        {}
        {/* <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Aulas</h2>
            <Button
              onClick={() => navigate(`/dashboard/classes/${classId}/lessons`)}
            >
              Ver Página Completa
            </Button>
          </div>
          <LessonsList lessons={lessons} />
        </TabsContent> */}

        {}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Avaliações</h2>
            <Button
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
              onClick={() =>
                navigate(`/dashboard/classes/${classId}/evaluation-config`)
              }
            >
              <Settings2 className="h-4 w-4" />
              Configurar Pesos
            </Button>
          </div>
          <EvaluationsList
            evaluations={evaluations}
            isLoading={evaluationsLoading}
          />
        </TabsContent>
      </Tabs>

      <EnrollStudentDialog
        isOpen={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        onSubmit={handleEnrollStudent}
        isLoading={isEnrolling}
      />
    </div>
  );
}
