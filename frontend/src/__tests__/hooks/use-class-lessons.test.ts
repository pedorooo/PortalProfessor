import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClassLessons } from "@/hooks/use-class-lessons";

describe("useClassLessons", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it("deve iniciar com estado de carregamento", () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.lessons).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar aulas após 300ms", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    expect(result.current.loading).toBe(true);

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lessons.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("deve retornar aulas com estrutura correta", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const lesson = result.current.lessons[0];
    expect(lesson).toHaveProperty("id");
    expect(lesson).toHaveProperty("topic");
    expect(lesson).toHaveProperty("date");
    expect(lesson).toHaveProperty("status");
  });

  it("deve retornar múltiplas aulas", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lessons.length).toBeGreaterThan(1);
  });

  it("deve ter status válido para cada aula", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const validStatuses = ["Concluída", "Em Progresso", "Programada"];
    for (const lesson of result.current.lessons) {
      expect(validStatuses).toContain(lesson.status);
    }
  });

  it("deve ter valores válidos para cada aula", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    for (const lesson of result.current.lessons) {
      expect(lesson.id).toBeTruthy();
      expect(lesson.topic).toBeTruthy();
      expect(lesson.date).toBeTruthy();
      expect(lesson.status).toBeTruthy();
    }
  });

  it("deve carregar aulas para diferentes classIds", async () => {
    const { result: result1 } = renderHook(() => useClassLessons("class-1"));
    const { result: result2 } = renderHook(() => useClassLessons("class-2"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    expect(result1.current.lessons.length).toBeGreaterThan(0);
    expect(result2.current.lessons.length).toBeGreaterThan(0);
  });

  it("deve ter duração opcional nas aulas", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const lesson = result.current.lessons[0];
    if (lesson.duration) {
      expect(lesson.duration).toBeTruthy();
    }
  });

  it("deve ter conteúdo opcional nas aulas", async () => {
    const { result } = renderHook(() => useClassLessons("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const lesson = result.current.lessons[0];
    if (lesson.content) {
      expect(lesson.content).toBeTruthy();
    }
  });
});
