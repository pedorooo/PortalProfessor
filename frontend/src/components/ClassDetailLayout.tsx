import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SUBJECT_COLORS } from "@/constants/subjects";

interface ClassDetailLayoutProps {
  classData: {
    id: string;
    name: string;
    description: string;
    subject: string;
    professor: string;
    studentCount: number;
    maxCapacity: number;
  };
  title: string;
  children: React.ReactNode;
  showStats?: boolean;
}

export function ClassDetailLayout({
  classData,
  title,
  children,
  showStats = true,
}: ClassDetailLayoutProps) {
  const navigate = useNavigate();
  const classId = classData.id;

  const colors =
    (classData.subject && SUBJECT_COLORS[classData.subject]) ||
    SUBJECT_COLORS.Matemática;
  const enrollmentPercentage =
    (classData.studentCount / classData.maxCapacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dashboard/classes/${classId}`)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Detalhes
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{title}</h1>
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
      {showStats && (
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
      )}

      {/* Content */}
      {children}
    </div>
  );
}
