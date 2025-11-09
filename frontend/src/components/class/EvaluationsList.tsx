import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ClassEvaluation } from "@/hooks/use-class-evaluations";
import { FileText, Calendar } from "lucide-react";

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-3 font-normal text-gray-600 text-sm">
                  Avaliação
                </th>
                <th className="pb-3 font-normal text-gray-600 text-sm">Data</th>
                <th className="pb-3 font-normal text-gray-600 text-sm">
                  Pontuação
                </th>
                <th className="pb-3 font-normal text-gray-600 text-sm">
                  Entregas
                </th>
                <th className="pb-3 font-normal text-gray-600 text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr
                  key={evaluation.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{evaluation.name}</p>
                        <p className="text-sm text-gray-500">Prova</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{evaluation.dueDate}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium">
                      {evaluation.gradeWeight || 0} %
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {evaluation.submitted || 0}/{evaluation.total || 32}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{
                            width: `${
                              ((evaluation.submitted || 0) /
                                (evaluation.total || 32)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={evaluation.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
