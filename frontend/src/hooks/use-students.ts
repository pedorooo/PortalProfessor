"use client";

import { useState, useCallback } from "react";
import type { Student } from "@/types";

const mockStudents: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(11) 98765-4321",
    grade: 8.5,
    class: "Class A",
    status: "active",
    enrollmentDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(11) 98765-4322",
    grade: 9.2,
    class: "Class B",
    status: "inactive",
    enrollmentDate: "2024-02-01",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "(11) 98765-4323",
    grade: 7.8,
    class: "Class A",
    status: "inactive",
    enrollmentDate: "2023-12-10",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    phone: "(11) 98765-4324",
    grade: 8.9,
    class: "Class C",
    status: "active",
    enrollmentDate: "2024-01-20",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "(11) 98765-4325",
    grade: 7.5,
    class: "Class B",
    status: "active",
    enrollmentDate: "2024-01-10",
  },
];

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isLoading, setIsLoading] = useState(false);

  const addStudent = useCallback((student: Omit<Student, "id">) => {
    setIsLoading(true);
    setTimeout(() => {
      const newStudent: Student = {
        ...student,
        id: Date.now().toString(),
      };
      setStudents((prev) => [newStudent, ...prev]);
      setIsLoading(false);
    }, 500);
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setIsLoading(true);
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === id ? { ...student, ...updates } : student
        )
      );
      setIsLoading(false);
    }, 500);
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setIsLoading(false);
    }, 500);
  }, []);

  const filterStudents = useCallback(
    (search: string, classFilter: string, statusFilter: string) => {
      return students.filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase());
        const matchesClass =
          classFilter === "all" || student.class === classFilter;
        const matchesStatus =
          statusFilter === "all" || student.status === statusFilter;
        return matchesSearch && matchesClass && matchesStatus;
      });
    },
    [students]
  );

  return {
    students,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    filterStudents,
  };
}
