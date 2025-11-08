import { Card, CardContent } from "@/components/ui/card";
import type { ClassEvaluation } from "@/hooks/use-class-evaluations";

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
                    <p className="text-xs text-muted-foreground mb-1">Peso</p>
                    <p className="font-semibold">{evaluation.weight}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
