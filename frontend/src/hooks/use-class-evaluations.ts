import { useState, useEffect } from "react";

export interface ClassEvaluation {
  id: string;
  name: string;
  dueDate: string;
  status: "Corrigida" | "Pendente" | "Em Andamento";
  submitted: number;
  total: number;
  weight: number;
}

export function useClassEvaluations(classId: string) {
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        // Simulando uma chamada API
        // Em produção, seria: const response = await fetch(`/api/classes/${classId}/evaluations`);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockEvaluations: ClassEvaluation[] = [
          {
            id: "eval1",
            name: "Prova 1 - Álgebra",
            dueDate: "15 de outubro",
            status: "Corrigida",
            submitted: 25,
            total: 25,
            weight: 30,
          },
          {
            id: "eval2",
            name: "Trabalho em Grupo",
            dueDate: "20 de outubro",
            status: "Pendente",
            submitted: 23,
            total: 25,
            weight: 20,
          },
          {
            id: "eval3",
            name: "Prova 2 - Geometria",
            dueDate: "25 de outubro",
            status: "Corrigida",
            submitted: 25,
            total: 25,
            weight: 30,
          },
        ];

        setEvaluations(mockEvaluations);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar avaliações");
        console.error(err);
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
