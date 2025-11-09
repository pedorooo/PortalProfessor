import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { ClassEvaluation } from "@/hooks/use-class-evaluations";

interface EvaluationsListProps {
  readonly evaluations: ClassEvaluation[];
  readonly isLoading?: boolean;
  readonly classId?: string;
}

export function EvaluationsList({
  evaluations,
  isLoading = false,
  classId,
}: EvaluationsListProps) {
  const navigate = useNavigate();
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
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                    >
                      {evaluation.status}
                    </span>
                    {classId && (
                      <Button
                        onClick={() =>
                          navigate(
                            `/dashboard/classes/${classId}/evaluations/${evaluation.id}/config`
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-sm"
                      >
                        Configurar
                      </Button>
                    )}
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
