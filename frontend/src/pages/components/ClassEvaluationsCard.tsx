import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import type {
  ClassEvaluation,
  CreateEvaluationPayload,
} from "@/lib/api-client";
import { EvaluationForm } from "./EvaluationForm";
import { EvaluationList } from "./EvaluationList";
import { useEvaluationForm } from "@/hooks/use-evaluation-form";

interface ClassEvaluationsCardProps {
  readonly classId: string | undefined;
  readonly evaluations: ClassEvaluation[];
  readonly totalWeight: number;
  readonly updatingId: number | null;
  readonly deletingId: number | null;
  readonly onWeightChange: (evaluationId: number, value: string) => void;
  readonly onWeightBlur: (evaluationId: number) => Promise<void>;
  readonly onDeleteEvaluation: (evaluationId: number) => Promise<void>;
  readonly onCreateEvaluation: (
    payload: CreateEvaluationPayload
  ) => Promise<any>;
}

export function ClassEvaluationsCard({
  classId,
  evaluations,
  totalWeight,
  updatingId,
  deletingId,
  onWeightChange,
  onWeightBlur,
  onDeleteEvaluation,
  onCreateEvaluation,
}: ClassEvaluationsCardProps) {
  const toastContext = useToast();
  const {
    showForm,
    formData,
    creatingEval,
    openForm,
    closeForm,
    updateFormData,
    setCreating,
  } = useEvaluationForm();

  const handleCreateEvaluation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!classId) return;

      if (!formData.name.trim()) {
        toastContext.error("Nome da avaliação é obrigatório");
        return;
      }

      if (!formData.dueDate) {
        toastContext.error("Data de entrega é obrigatória");
        return;
      }

      try {
        setCreating(true);
        const classIdNumber = Number.parseInt(classId, 10);

        const payload: CreateEvaluationPayload = {
          name: formData.name,
          classId: classIdNumber,
          dueDate: formData.dueDate,
          gradeWeight: formData.gradeWeight,
          status: "OPEN",
        };

        await onCreateEvaluation(payload);
        closeForm();
      } finally {
        setCreating(false);
      }
    },
    [
      classId,
      formData,
      onCreateEvaluation,
      closeForm,
      setCreating,
      toastContext,
    ]
  );

  const handleCancelForm = useCallback(() => {
    closeForm();
  }, [closeForm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Avaliações da Turma</h2>
          <Button
            onClick={showForm ? handleCancelForm : openForm}
            variant="outline"
            size="sm"
          >
            {showForm ? "Cancelar" : "+ Nova Avaliação"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <EvaluationForm
          isOpen={showForm}
          isLoading={creatingEval}
          formData={formData}
          totalExistingWeight={totalWeight}
          onNameChange={(value) => updateFormData({ name: value })}
          onDateChange={(value) => updateFormData({ dueDate: value })}
          onWeightChange={(value) =>
            updateFormData({ gradeWeight: Number.parseInt(value) || 0 })
          }
          onSubmit={handleCreateEvaluation}
          onCancel={handleCancelForm}
        />

        {}
        <EvaluationList
          evaluations={evaluations}
          updatingId={updatingId}
          deletingId={deletingId}
          onWeightChange={onWeightChange}
          onWeightBlur={onWeightBlur}
          onDelete={onDeleteEvaluation}
        />
      </CardContent>
    </Card>
  );
}
