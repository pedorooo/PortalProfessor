import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClassEvaluation } from "@/lib/api-client";

interface EvaluationListProps {
  readonly evaluations: readonly ClassEvaluation[];
  readonly updatingId: number | null;
  readonly deletingId: number | null;
  readonly onWeightChange: (evaluationId: number, value: string) => void;
  readonly onWeightBlur: (evaluationId: number) => void;
  readonly onDelete: (evaluationId: number) => void;
}

export function EvaluationList({
  evaluations,
  updatingId,
  deletingId,
  onWeightChange,
  onWeightBlur,
  onDelete,
}: EvaluationListProps) {
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma avaliação encontrada nesta turma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evaluations.map((evaluation) => (
        <div
          key={evaluation.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <p className="font-semibold">{evaluation.name}</p>
            <p className="text-sm text-muted-foreground">
              Entrega: {evaluation.dueDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={evaluation.gradeWeight || 0}
                onChange={(e) => onWeightChange(evaluation.id, e.target.value)}
                onBlur={() => onWeightBlur(evaluation.id)}
                disabled={updatingId === evaluation.id}
                className="w-24 text-center"
              />
              <span className="text-sm font-semibold">%</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(evaluation.id)}
              disabled={deletingId === evaluation.id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
