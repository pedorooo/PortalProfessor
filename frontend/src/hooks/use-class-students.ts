import { useState, useEffect } from "react";
import { getClassStudents } from "@/lib/api-client";

export interface ClassStudent {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  enrolledAt: string;
  grade?: number;
  attendance?: number;
  performance?: number;
}

export function useClassStudents(classId: string, refreshKey?: number) {
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const classIdNumber = Number.parseInt(classId, 10);
        const response = await getClassStudents(classIdNumber, 1, 10);
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar alunos");
        console.error(err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId, refreshKey]);

  return { students, loading, error };
}
