import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import {
  getClassEvaluations,
  updateEvaluation,
  createEvaluation,
  deleteEvaluation,
} from "@/lib/api-client";
import type {
  ClassEvaluation,
  CreateEvaluationPayload,
} from "@/lib/api-client";

export function useEvaluationManagement(classId: string | undefined) {
  const toastContext = useToast();
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previousWeights, setPreviousWeights] = useState<Map<number, number>>(
    new Map()
  );

  const fetchEvaluations = useCallback(async () => {
    try {
      if (!classId) return;

      setLoading(true);
      setError(null);

      const classIdNumber = Number.parseInt(classId, 10);
      const evalsRes = await getClassEvaluations(classIdNumber, 1, 100);
      setEvaluations(evalsRes.data);
    } catch (error: unknown) {
      console.error("Failed to load evaluations:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao carregar avaliações: ${errorMessage}`);
      toastContext.error(`Erro ao carregar avaliações: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [classId, toastContext]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const totalWeight = evaluations.reduce(
    (sum, e) => sum + (e.gradeWeight || 0),
    0
  );

  const validateWeight = useCallback(
    (evaluationId: number, newWeight: number): boolean => {
      if (newWeight < 0 || newWeight > 100) {
        toastContext.error("Peso deve estar entre 0 e 100");
        return false;
      }

      const totalOtherWeight = evaluations
        .filter((e) => e.id !== evaluationId)
        .reduce((sum, e) => sum + (e.gradeWeight || 0), 0);

      if (totalOtherWeight + newWeight > 100) {
        toastContext.error(
          `Peso total não pode ultrapassar 100%. Outras avaliações: ${totalOtherWeight}%, ` +
            `definir como ${newWeight}% resultaria em ${
              totalOtherWeight + newWeight
            }%`
        );
        return false;
      }

      return true;
    },
    [evaluations, toastContext]
  );

  const handleWeightChange = useCallback(
    (evaluationId: number, value: string) => {
      const evaluation = evaluations.find((e) => e.id === evaluationId);
      if (evaluation && !previousWeights.has(evaluationId)) {
        setPreviousWeights((prev) =>
          new Map(prev).set(evaluationId, evaluation.gradeWeight)
        );
      }

      const newWeight = Number.parseInt(value) || 0;
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === evaluationId ? { ...e, gradeWeight: newWeight } : e
        )
      );
    },
    [evaluations, previousWeights]
  );

  const handleWeightBlur = useCallback(
    async (evaluationId: number) => {
      const evaluation = evaluations.find((e) => e.id === evaluationId);
      if (!evaluation) return;

      const newWeight = evaluation.gradeWeight || 0;
      const previousWeight = previousWeights.get(evaluationId) || 0;

      if (!validateWeight(evaluationId, newWeight)) {
        setEvaluations((prev) =>
          prev.map((e) =>
            e.id === evaluationId ? { ...e, gradeWeight: previousWeight } : e
          )
        );
        setPreviousWeights((prev) => {
          const newMap = new Map(prev);
          newMap.delete(evaluationId);
          return newMap;
        });
        return;
      }

      try {
        setUpdatingId(evaluationId);
        console.log("Atualizando peso para:", evaluationId, newWeight);
        const updatedEval = await updateEvaluation(evaluationId, {
          gradeWeight: newWeight,
        });
        setEvaluations((prev) =>
          prev.map((e) => (e.id === evaluationId ? updatedEval : e))
        );
        toastContext.success("Peso atualizado com sucesso");
        console.log("Peso atualizado com sucesso:", updatedEval);
      } catch (error) {
        console.error("Error updating weight:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao atualizar peso";
        toastContext.error(errorMessage);
        setEvaluations((prev) =>
          prev.map((e) =>
            e.id === evaluationId ? { ...e, gradeWeight: previousWeight } : e
          )
        );
      } finally {
        setUpdatingId(null);
        setPreviousWeights((prev) => {
          const newMap = new Map(prev);
          newMap.delete(evaluationId);
          return newMap;
        });
      }
    },
    [evaluations, previousWeights, validateWeight, toastContext]
  );

  const handleDeleteEvaluation = useCallback(
    async (evaluationId: number) => {
      if (
        !globalThis.confirm(
          "Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita."
        )
      ) {
        return;
      }

      try {
        setDeletingId(evaluationId);
        console.log("Deletando avaliação:", evaluationId);
        await deleteEvaluation(evaluationId);
        setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
        toastContext.success("Avaliação deletada com sucesso");
        console.log("Avaliação deletada com sucesso");
      } catch (error) {
        console.error("Error deleting evaluation:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao deletar avaliação";
        toastContext.error(errorMessage);
      } finally {
        setDeletingId(null);
      }
    },
    [toastContext]
  );

  const handleCreateEvaluation = useCallback(
    async (payload: CreateEvaluationPayload) => {
      const newWeight = payload.gradeWeight || 0;
      if (newWeight < 0 || newWeight > 100) {
        toastContext.error("Peso da avaliação deve estar entre 0 e 100");
        return;
      }

      const totalExistingWeight = evaluations.reduce(
        (sum, e) => sum + (e.gradeWeight || 0),
        0
      );

      if (totalExistingWeight + newWeight > 100) {
        toastContext.error(
          `Peso total não pode ultrapassar 100%. Peso atual: ${totalExistingWeight}%, ` +
            `adicionando ${newWeight}% resultaria em ${
              totalExistingWeight + newWeight
            }%`
        );
        return;
      }

      try {
        console.log("Criando avaliação com dados:", payload);
        const newEval = await createEvaluation(payload);
        console.log("Avaliação criada com sucesso:", newEval);

        setEvaluations((prev) => [...prev, newEval]);
        toastContext.success("Avaliação criada com sucesso!");
        return newEval;
      } catch (error) {
        console.error("Error creating evaluation:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar avaliação";
        toastContext.error(errorMessage);
        throw error;
      }
    },
    [evaluations, toastContext]
  );

  return {
    evaluations,
    loading,
    error,
    updatingId,
    deletingId,
    totalWeight,
    handleWeightChange,
    handleWeightBlur,
    handleDeleteEvaluation,
    handleCreateEvaluation,
    refetch: fetchEvaluations,
  };
}
