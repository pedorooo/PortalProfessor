import { Card, CardContent } from "@/components/ui/card";
import type { ClassEvaluation } from "@/hooks/use-class-evaluations";
import { FileText, Calendar, TrendingUp } from "lucide-react";

interface EvaluationsListProps {
  readonly evaluations: ClassEvaluation[];
  readonly isLoading?: boolean;
}

export function EvaluationsList({
  evaluations,
  isLoading = false,
}: EvaluationsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Carregando avaliações...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma avaliação encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
            >
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{evaluation.name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{evaluation.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 flex-shrink-0" />
                        <span>Peso: {evaluation.gradeWeight || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 text-right flex-shrink-0">
                <div>
                  <p className="text-xs text-muted-foreground">Entregas</p>
                  <p className="text-lg font-bold text-purple-600">
                    {evaluation.submitted || 0}/{evaluation.total || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      evaluation.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : evaluation.status === "CLOSED"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {evaluation.status === "OPEN"
                      ? "Em Andamento"
                      : evaluation.status === "CLOSED"
                      ? "Fechada"
                      : evaluation.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
