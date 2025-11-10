import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClassStudents } from "@/hooks/use-class-students";

// Mock do módulo api-client
vi.mock("@/lib/api-client", () => ({
  getClassStudents: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 1,
          userId: 101,
          name: "João Silva",
          email: "joao@university.edu",
          phone: "+55 (11) 98765-4321",
          status: "ACTIVE",
          enrolledAt: "2024-01-15",
          grade: 8.5,
          attendance: 95,
          performance: 92,
        },
        {
          id: 2,
          userId: 102,
          name: "Maria Santos",
          email: "maria@university.edu",
          phone: "+55 (11) 98765-4322",
          status: "ACTIVE",
          enrolledAt: "2024-01-15",
          grade: 7.2,
          attendance: 85,
          performance: 78,
        },
        {
          id: 3,
          userId: 103,
          name: "Pedro Oliveira",
          email: "pedro@university.edu",
          phone: "+55 (11) 98765-4323",
          status: "ACTIVE",
          enrolledAt: "2024-01-15",
          grade: 6.5,
          attendance: 70,
          performance: 65,
        },
      ],
      total: 3,
      page: 1,
      totalPages: 1,
    })
  ),
}));

describe("useClassStudents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar com estado de carregamento", () => {
    const { result } = renderHook(() => useClassStudents("1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.students).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar alunos", async () => {
    const { result } = renderHook(() => useClassStudents("1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students.length).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("deve retornar alunos com estrutura correta", async () => {
    const { result } = renderHook(() => useClassStudents("1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const student = result.current.students[0];
    expect(student).toHaveProperty("id");
    expect(student).toHaveProperty("name");
    expect(student).toHaveProperty("email");
    expect(student).toHaveProperty("phone");
    expect(student).toHaveProperty("grade");
    expect(student).toHaveProperty("attendance");
    expect(student).toHaveProperty("performance");
  });

  it("deve retornar múltiplos alunos", async () => {
    const { result } = renderHook(() => useClassStudents("1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students.length).toBe(3);
  });

  it("deve ter valores válidos para cada aluno", async () => {
    const { result } = renderHook(() => useClassStudents("1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    for (const student of result.current.students) {
      expect(student.id).toBeTruthy();
      expect(student.name).toBeTruthy();
      expect(student.email).toContain("@");
      expect(student.phone).toBeTruthy();
      expect(student.grade).toBeGreaterThanOrEqual(0);
      expect(student.grade).toBeLessThanOrEqual(10);
      expect(student.attendance).toBeGreaterThanOrEqual(0);
      expect(student.attendance).toBeLessThanOrEqual(100);
      expect(student.performance).toBeGreaterThanOrEqual(0);
      expect(student.performance).toBeLessThanOrEqual(100);
    }
  });

  it("deve carregar alunos para diferentes classIds", async () => {
    const { result: result1 } = renderHook(() => useClassStudents("1"));
    const { result: result2 } = renderHook(() => useClassStudents("2"));

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    expect(result1.current.students.length).toBe(3);
    expect(result2.current.students.length).toBe(3);
  });
});
