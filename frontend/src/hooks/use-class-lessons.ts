import { useState, useEffect } from "react";

export interface ClassLesson {
  id: string;
  topic: string;
  date: string;
  status: "Concluída" | "Em Progresso" | "Programada";
  duration?: string;
  content?: string;
}

export function useClassLessons(classId: string) {
  const [lessons, setLessons] = useState<ClassLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockLessons: ClassLesson[] = [
          {
            id: "1",
            topic: "Introdução à Álgebra Linear",
            date: "1 de novembro",
            status: "Concluída",
            duration: "90 minutos",
            content:
              "Conceitos fundamentais de álgebra linear, matrizes e operações básicas.",
          },
          {
            id: "2",
            topic: "Sistemas de Equações Lineares",
            date: "3 de novembro",
            status: "Concluída",
            duration: "90 minutos",
            content:
              "Resolução de sistemas lineares usando diferentes métodos.",
          },
          {
            id: "3",
            topic: "Espaços Vetoriais",
            date: "5 de novembro",
            status: "Concluída",
            duration: "90 minutos",
            content: "Propriedades e definições de espaços vetoriais.",
          },
        ];

        setLessons(mockLessons);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar aulas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchLessons();
    }
  }, [classId]);

  return { lessons, loading, error };
}
