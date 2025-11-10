import { useState, useEffect } from "react";
import { getClassEvaluations } from "@/lib/api-client";

export interface ClassEvaluation {
  id: number;
  name: string;
  dueDate: string;
  status: string;
  gradeWeight?: number;
  submitted?: number;
  total?: number;
  weight?: number;
}

export function useClassEvaluations(classId: string) {
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const classIdNumber = Number.parseInt(classId, 10);
        const response = await getClassEvaluations(classIdNumber, 1, 10);
        const mappedEvaluations = response.data.map((eval_) => ({
          ...eval_,
          weight: eval_.gradeWeight || 0,
          submitted: 0,
          total: 0,
        }));
        setEvaluations(mappedEvaluations);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar avaliações");
        console.error(err);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchEvaluations();
    }
  }, [classId]);

  return { evaluations, loading, error };
}
