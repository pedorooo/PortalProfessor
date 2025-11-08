import { useState, useCallback } from "react";

export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
}

interface EvaluationCriteriaState {
  [classId: string]: EvaluationCriteria[];
}

export function useEvaluationCriteria() {
  const [criteriaByClass, setCriteriaByClass] =
    useState<EvaluationCriteriaState>({
      // Mock initial data
      "1": [
        { id: "1", name: "Prova 1", weight: 30 },
        { id: "2", name: "Prova 2", weight: 30 },
        { id: "3", name: "Trabalho", weight: 20 },
        { id: "4", name: "Participação", weight: 20 },
      ],
    });

  const getCriteriaForClass = useCallback(
    (classId: string) => {
      return criteriaByClass[classId] || [];
    },
    [criteriaByClass]
  );

  const getTotalWeight = useCallback(
    (classId: string) => {
      const criteria = getCriteriaForClass(classId);
      return criteria.reduce((sum, c) => sum + c.weight, 0);
    },
    [getCriteriaForClass]
  );

  const addCriteria = useCallback(
    (classId: string, name: string, weight: number) => {
      setCriteriaByClass((prev) => {
        const classCriteria = prev[classId] || [];
        return {
          ...prev,
          [classId]: [
            ...classCriteria,
            { id: Date.now().toString(), name, weight },
          ],
        };
      });
    },
    []
  );

  const updateCriteria = useCallback(
    (classId: string, id: string, name: string, weight: number) => {
      setCriteriaByClass((prev) => {
        const classCriteria = prev[classId] || [];
        return {
          ...prev,
          [classId]: classCriteria.map((c) =>
            c.id === id ? { ...c, name, weight } : c
          ),
        };
      });
    },
    []
  );

  const removeCriteria = useCallback((classId: string, id: string) => {
    setCriteriaByClass((prev) => {
      const classCriteria = prev[classId] || [];
      return {
        ...prev,
        [classId]: classCriteria.filter((c) => c.id !== id),
      };
    });
  }, []);

  return {
    getCriteriaForClass,
    getTotalWeight,
    addCriteria,
    updateCriteria,
    removeCriteria,
  };
}
