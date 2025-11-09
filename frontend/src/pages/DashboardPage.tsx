import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

const mockData = {
  totalStudents: 150,
  totalClasses: 8,
  upcomingEvaluations: 5,
  avgStudentScore: 7.8,
  evaluationTrend: [
    { month: "Jan", students: 120 },
    { month: "Fev", students: 135 },
    { month: "Mar", students: 150 },
    { month: "Abr", students: 145 },
    { month: "Mai", students: 155 },
    { month: "Jun", students: 150 },
  ],
  yearlyStudentAcquisition: [
    { month: "Jan", students: 120 },
    { month: "Fev", students: 135 },
    { month: "Mar", students: 150 },
    { month: "Abr", students: 145 },
    { month: "Mai", students: 155 },
    { month: "Jun", students: 150 },
    { month: "Jul", students: 160 },
    { month: "Ago", students: 165 },
    { month: "Set", students: 158 },
    { month: "Out", students: 162 },
    { month: "Nov", students: 168 },
    { month: "Dez", students: 150 },
  ],
  recentActivities: [
    {
      title: "Nova avaliação criada",
      subtitle: "Matemática 9A",
      time: "Há 2 horas",
    },
    { title: "Notas lançadas", subtitle: "Física 8B", time: "Há 5 horas" },
    { title: "Novo aluno adicionado", subtitle: "Química 7C", time: "Ontem" },
    {
      title: "Frequência atualizada",
      subtitle: "Matemática 9A",
      time: "Ontem",
    },
  ],
  upcomingClasses: [
    {
      name: "Matemática 9A",
      time: "08:00 - 09:30",
      students: 32,
      status: "Próxima",
    },
    { name: "Física 8B", time: "10:00 - 11:30", students: 28, status: null },
    { name: "Química 7C", time: "14:00 - 15:30", students: 25, status: null },
  ],
};

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center py-12">
          <p className="text-lg text-red-500">
            {error || "Falha ao carregar dados do dashboard"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="">
        <h1 className="text-3xl font-bold mb-6">Visão Geral</h1>
        <p className="text-slate-600">Bem-vindo ao seu painel de controle</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Alunos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Total de Turmas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Turmas em ensino</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Avaliações Próximas
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {stats.upcomingEvaluations}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">
              Pontuação Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.avgStudentScore}</div>
            <p className="text-xs text-muted-foreground">De 10</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Aquisição de Alunos ao Longo do Ano</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                activeDot={{ r: 7 }}
                name="Alunos Matriculados"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {mockData.recentActivities.map((activity) => (
              <div
                key={`${activity.title}-${activity.time}`}
                className="flex justify-between items-start pb-4 border-b last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.subtitle}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {activity.time}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Próximas Aulas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {mockData.upcomingClasses.map((classroom) => (
              <div
                key={classroom.name}
                className="pb-4 border-b last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{classroom.name}</p>
                  {classroom.status && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {classroom.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {classroom.time} • {classroom.students} alunos
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
