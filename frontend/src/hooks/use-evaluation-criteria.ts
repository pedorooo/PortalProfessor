import { useState, useCallback } from "react";
import { updateEvaluation } from "@/lib/api-client";

export interface EvaluationWeight {
  id: number;
  name: string;
  gradeWeight: number;
}

export function useEvaluationCriteria() {
  const [criteria, setCriteria] = useState<EvaluationWeight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCriteriaForClass = useCallback(() => {
    return criteria;
  }, [criteria]);

  const getTotalWeight = useCallback(() => {
    return criteria.reduce((sum, c) => sum + c.gradeWeight, 0);
  }, [criteria]);

  // Initialize with provided evaluations
  const fetchCriteria = useCallback((evaluations: EvaluationWeight[]) => {
    setCriteria(evaluations);
    setError(null);
  }, []);

  const updateCriteria = useCallback(
    async (id: number, name: string, gradeWeight: number) => {
      try {
        setLoading(true);
        // Update via API
        await updateEvaluation(id, { name, gradeWeight });
        // Update local state
        setCriteria((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name, gradeWeight } : c))
        );
        setError(null);
      } catch (err) {
        console.error("Erro ao atualizar avaliação:", err);
        setError("Erro ao atualizar avaliação");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    criteria,
    loading,
    error,
    getCriteriaForClass,
    getTotalWeight,
    updateCriteria,
    fetchCriteria,
  };
}
