"use client";

import { useState, useEffect, useCallback } from "react";
import type { Student } from "@/types";
import {
  getStudents,
  createStudent,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent,
  type StudentApiResponse,
  type CreateStudentPayload,
  type UpdateStudentPayload,
} from "@/lib/api-client";

function transformStudent(apiStudent: StudentApiResponse): Student {
  return {
    id: apiStudent.id.toString(),
    name: apiStudent.name,
    email: apiStudent.email,
    phone: apiStudent.phone || undefined,
    class: apiStudent.className || "N/A",
    classId: apiStudent.classId,
    status: apiStudent.status.toLowerCase() as "active" | "inactive",
    enrollmentDate: apiStudent.createdAt,
    grade: apiStudent.grade,
  };
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudents(1, 100);
      const transformedStudents = response.data.map(transformStudent);
      setStudents(transformedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
      console.error("Error loading students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = useCallback(async (student: Omit<Student, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: CreateStudentPayload = {
        name: student.name,
        email: student.email,
        password: "password123",
        phone: student.phone,
        classId: student.classId,
        status: student.status?.toUpperCase(),
      };

      const newStudent = await createStudent(payload);
      const transformed = transformStudent(newStudent);
      setStudents((prev) => [transformed, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
      console.error("Error creating student:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStudent = useCallback(
    async (id: string, updates: Partial<Student>) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload: UpdateStudentPayload = {};

        if (updates.name) payload.name = updates.name;
        if (updates.email) payload.email = updates.email;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.status) payload.status = updates.status.toUpperCase();

        const updated = await apiUpdateStudent(
          Number.parseInt(id, 10),
          payload
        );
        const transformed = transformStudent(updated);

        setStudents((prev) =>
          prev.map((student) => (student.id === id ? transformed : student))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update student"
        );
        console.error("Error updating student:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteStudent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiDeleteStudent(Number.parseInt(id, 10));
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
      console.error("Error deleting student:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
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
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    filterStudents,
    refreshStudents: loadStudents,
  };
}
