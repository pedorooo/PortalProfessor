import { TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ClassStatsProps {
  readonly studentCount: number;
  readonly maxCapacity: number;
  readonly enrollmentPercentage: number;
  readonly barColor: string;
}

export function ClassStats({
  studentCount,
  maxCapacity,
  enrollmentPercentage,
  barColor,
}: Readonly<ClassStatsProps>) {
  return (
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
          <div className="text-2xl font-bold">{studentCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Capacidade: {maxCapacity}
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
              className={`h-full rounded-full transition-all ${barColor}`}
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
          <p className="text-xs text-muted-foreground mt-1">Desempenho geral</p>
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
  );
}
