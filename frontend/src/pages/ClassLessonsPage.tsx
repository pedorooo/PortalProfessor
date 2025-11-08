import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useClasses } from "@/hooks/use-classes";

export default function ClassLessonsPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClasses();

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

  // Mock lesson data
  const mockLessons = [
    {
      id: "1",
      topic: "Introdução à Álgebra Linear",
      date: "1 de novembro",
      duration: "90 minutos",
      status: "Concluída",
      content:
        "Conceitos fundamentais de álgebra linear, matrizes e operações básicas.",
    },
    {
      id: "2",
      topic: "Sistemas de Equações Lineares",
      date: "3 de novembro",
      duration: "90 minutos",
      status: "Concluída",
      content: "Resolução de sistemas lineares usando diferentes métodos.",
    },
    {
      id: "3",
      topic: "Espaços Vetoriais",
      date: "5 de novembro",
      duration: "90 minutos",
      status: "Concluída",
      content: "Propriedades e definições de espaços vetoriais.",
    },
    {
      id: "4",
      topic: "Transformações Lineares",
      date: "8 de novembro",
      duration: "90 minutos",
      status: "Em Progresso",
      content: "Estudo de transformações lineares e suas aplicações.",
    },
    {
      id: "5",
      topic: "Autovalores e Autovetores",
      date: "10 de novembro",
      duration: "90 minutos",
      status: "Programada",
      content: "Cálculo e interpretação de autovalores e autovetores.",
    },
    {
      id: "6",
      topic: "Diagonalização de Matrizes",
      date: "12 de novembro",
      duration: "90 minutos",
      status: "Programada",
      content: "Processo de diagonalização e aplicações práticas.",
    },
  ];

  const getStatusBadge = (status: string) => {
    let classes = "px-3 py-1 text-xs font-semibold rounded-full";
    if (status === "Concluída") {
      classes += " bg-green-100 text-green-800";
    } else if (status === "Em Progresso") {
      classes += " bg-blue-100 text-blue-800";
    } else if (status === "Programada") {
      classes += " bg-gray-100 text-gray-800";
    }
    return classes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/classes/${classId}`)}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Detalhes
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Aulas</h1>
          <p className="text-muted-foreground">{classData.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">
              Total de Aulas
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLessons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Concluídas</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockLessons.filter((l) => l.status === "Concluída").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm text-muted-foreground">Programadas</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {mockLessons.filter((l) => l.status === "Programada").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Histórico de Aulas</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">{lesson.topic}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lesson.content}
                    </p>
                  </div>
                  <span className={getStatusBadge(lesson.status)}>
                    {lesson.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {lesson.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {lesson.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
