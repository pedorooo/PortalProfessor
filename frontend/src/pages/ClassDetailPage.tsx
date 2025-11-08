"use client";

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClasses } from "@/hooks/use-classes";
import { useClassStudents } from "@/hooks/use-class-students";
import { useClassLessons } from "@/hooks/use-class-lessons";
import { useClassEvaluations } from "@/hooks/use-class-evaluations";
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
          <ArrowLeft className="h-4 w-4" />
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

  // Mock student data
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/classes")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Turmas
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{classData.name}</h1>
              {classData.subject && (
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${colors.badge}`}
                >
                  {classData.subject}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              {classData.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Prof. {classData.professor}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total de Alunos
              </span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.studentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Capacidade: {classData.maxCapacity}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Taxa de Ocupação
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(enrollmentPercentage)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-full rounded-full transition-all ${colors.bar}`}
                style={{ width: `${enrollmentPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Média da Turma
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">7.8</div>
            <p className="text-xs text-muted-foreground mt-1">
              Desempenho geral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Frequência Média
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <p className="text-xs text-muted-foreground mt-1">Presença</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário da Aula
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">Seg/Qua/Sex</p>
            <p className="text-2xl font-bold text-purple-600">08:00 - 09:30</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Professor Responsável
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{classData.professor}</p>
            <p className="text-sm text-muted-foreground mt-2">
              professor@email.com
            </p>
            <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
          </CardContent>
        </Card>
      </div>
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

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{student.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {student.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Média</p>
                        <p className="text-lg font-bold text-orange-500">
                          {student.grade}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Frequência
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {student.attendance}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  let statusClass = "bg-green-100 text-green-800";
                  if (lesson.status === "Em Progresso") {
                    statusClass = "bg-blue-100 text-blue-800";
                  }

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{lesson.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.date}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                      >
                        {lesson.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {evaluations.map((evaluation) => {
                  let statusClass = "bg-blue-100 text-blue-800";
                  if (evaluation.status === "Corrigida") {
                    statusClass = "bg-green-100 text-green-800";
                  } else if (evaluation.status === "Pendente") {
                    statusClass = "bg-yellow-100 text-yellow-800";
                  }

                  const submissionPercentage =
                    (evaluation.submitted / evaluation.total) * 100;

                  return (
                    <div
                      key={evaluation.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{evaluation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Data de entrega: {evaluation.dueDate}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                        >
                          {evaluation.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Entregas
                          </p>
                          <p className="font-semibold">
                            {evaluation.submitted}/{evaluation.total}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Taxa de Entrega
                          </p>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${submissionPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Peso
                          </p>
                          <p className="font-semibold">{evaluation.weight}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
