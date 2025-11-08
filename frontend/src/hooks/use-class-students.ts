import { useState, useEffect } from "react";

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: number;
  attendance: number;
  performance?: number;
}

export function useClassStudents(classId: string) {
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Simulando uma chamada API
        // Em produção, seria: const response = await fetch(`/api/classes/${classId}/students`);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockStudents: ClassStudent[] = [
          {
            id: "1",
            name: "Ana Silva",
            email: "ana.silva@email.com",
            phone: "(11) 98765-4321",
            grade: 8.5,
            attendance: 95,
            performance: 92,
          },
          {
            id: "2",
            name: "Daniel Costa",
            email: "daniel.costa@email.com",
            phone: "(11) 98765-4324",
            grade: 6.8,
            attendance: 88,
            performance: 76,
          },
          {
            id: "3",
            name: "Maria Santos",
            email: "maria.santos@email.com",
            phone: "(11) 98765-4325",
            grade: 9.2,
            attendance: 98,
            performance: 95,
          },
          {
            id: "4",
            name: "João Oliveira",
            email: "joao.oliveira@email.com",
            phone: "(11) 98765-4326",
            grade: 7.5,
            attendance: 92,
            performance: 85,
          },
          {
            id: "5",
            name: "Isabella Martins",
            email: "isabella.martins@email.com",
            phone: "(11) 98765-4327",
            grade: 8.9,
            attendance: 96,
            performance: 90,
          },
        ];

        setStudents(mockStudents);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar alunos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  return { students, loading, error };
}
