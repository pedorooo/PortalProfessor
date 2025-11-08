import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClassStudents } from "@/hooks/use-class-students";

describe("useClassStudents", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it("deve iniciar com estado de carregamento", () => {
    const { result } = renderHook(() => useClassStudents("class-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.students).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar alunos após 300ms", async () => {
    const { result } = renderHook(() => useClassStudents("class-1"));

    expect(result.current.loading).toBe(true);

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("deve retornar alunos com estrutura correta", async () => {
    const { result } = renderHook(() => useClassStudents("class-1"));

    vi.advanceTimersByTime(300);

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
    const { result } = renderHook(() => useClassStudents("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.students.length).toBeGreaterThan(1);
  });

  it("deve ter valores válidos para cada aluno", async () => {
    const { result } = renderHook(() => useClassStudents("class-1"));

    vi.advanceTimersByTime(300);

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
    const { result: result1 } = renderHook(() => useClassStudents("class-1"));
    const { result: result2 } = renderHook(() => useClassStudents("class-2"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    expect(result1.current.students.length).toBeGreaterThan(0);
    expect(result2.current.students.length).toBeGreaterThan(0);
  });
});
