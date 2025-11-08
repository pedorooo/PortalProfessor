import { useState, useCallback } from "react";
import type { Class } from "@/types";

const mockClasses: Class[] = [
  {
    id: "1",
    name: "Matemática Avançada",
    maxCapacity: 30,
    studentCount: 28,
    professor: "Dr. Smith",
    subject: "Matemática",
    description: "Tópicos avançados em álgebra, geometria e cálculo",
  },
  {
    id: "2",
    name: "Fundamentos de Física",
    maxCapacity: 35,
    studentCount: 32,
    professor: "Prof. Johnson",
    subject: "Física",
    description: "Introdução à mecânica e termodinâmica",
  },
  {
    id: "3",
    name: "Laboratório de Química",
    maxCapacity: 25,
    studentCount: 22,
    professor: "Dr. Williams",
    subject: "Química",
    description: "Experimentos práticos de laboratório e reações químicas",
  },
  {
    id: "4",
    name: "Literatura em Inglês",
    maxCapacity: 40,
    studentCount: 38,
    professor: "Ms. Brown",
    subject: "Inglês",
    description: "Explore a literatura inglesa clássica e contemporânea",
  },
];

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [isLoading, setIsLoading] = useState(false);

  const addClass = useCallback((classData: Omit<Class, "id">) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newClass: Class = {
        ...classData,
        id: Date.now().toString(),
      };
      setClasses((prev) => [newClass, ...prev]);
      setIsLoading(false);
    }, 500);
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<Class>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setClasses((prev) =>
        prev.map((cls) => (cls.id === id ? { ...cls, ...updates } : cls))
      );
      setIsLoading(false);
    }, 500);
  }, []);

  const deleteClass = useCallback((id: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
      setIsLoading(false);
    }, 500);
  }, []);

  const filterClasses = useCallback(
    (search: string) => {
      return classes.filter((cls) =>
        cls.name.toLowerCase().includes(search.toLowerCase())
      );
    },
    [classes]
  );

  return {
    classes,
    isLoading,
    addClass,
    updateClass,
    deleteClass,
    filterClasses,
  };
}
