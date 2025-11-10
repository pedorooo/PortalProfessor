import { useState, useEffect } from "react";
import { getClassById } from "@/lib/api-client";
import type { ClassApiResponse } from "@/lib/api-client";

export function useClassData(classId: string | undefined) {
  const [classData, setClassData] = useState<ClassApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!classId) {
          setError("ID da turma não encontrado");
          return;
        }

        setLoading(true);
        setError(null);

        const classIdNumber = Number.parseInt(classId, 10);
        const classRes = await getClassById(classIdNumber);
        setClassData(classRes);
      } catch (error: unknown) {
        console.error("Failed to load class data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Erro ao carregar dados da turma: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  return { classData, loading, error };
}
