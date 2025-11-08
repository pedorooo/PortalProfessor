import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClassEvaluations } from "@/hooks/use-class-evaluations";

describe("useClassEvaluations", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it("deve iniciar com estado de carregamento", () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.evaluations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("deve carregar avaliações após 300ms", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    expect(result.current.loading).toBe(true);

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evaluations.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("deve retornar avaliações com estrutura correta", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const evaluation = result.current.evaluations[0];
    expect(evaluation).toHaveProperty("id");
    expect(evaluation).toHaveProperty("name");
    expect(evaluation).toHaveProperty("dueDate");
    expect(evaluation).toHaveProperty("status");
    expect(evaluation).toHaveProperty("submitted");
    expect(evaluation).toHaveProperty("total");
    expect(evaluation).toHaveProperty("weight");
  });

  it("deve retornar múltiplas avaliações", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.evaluations.length).toBeGreaterThan(1);
  });

  it("deve ter status válido para cada avaliação", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const validStatuses = ["Corrigida", "Pendente", "Em Andamento"];
    for (const evaluation of result.current.evaluations) {
      expect(validStatuses).toContain(evaluation.status);
    }
  });

  it("deve ter valores válidos para cada avaliação", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    for (const evaluation of result.current.evaluations) {
      expect(evaluation.id).toBeTruthy();
      expect(evaluation.name).toBeTruthy();
      expect(evaluation.dueDate).toBeTruthy();
      expect(evaluation.submitted).toBeGreaterThanOrEqual(0);
      expect(evaluation.total).toBeGreaterThan(0);
      expect(evaluation.weight).toBeGreaterThan(0);
    }
  });

  it("deve ter submissões menores ou iguais ao total", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    for (const evaluation of result.current.evaluations) {
      expect(evaluation.submitted).toBeLessThanOrEqual(evaluation.total);
    }
  });

  it("deve carregar avaliações para diferentes classIds", async () => {
    const { result: result1 } = renderHook(() =>
      useClassEvaluations("class-1")
    );
    const { result: result2 } = renderHook(() =>
      useClassEvaluations("class-2")
    );

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    expect(result1.current.evaluations.length).toBeGreaterThan(0);
    expect(result2.current.evaluations.length).toBeGreaterThan(0);
  });

  it("deve ter peso válido para avaliações", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    for (const evaluation of result.current.evaluations) {
      expect(evaluation.weight).toBeGreaterThan(0);
      expect(evaluation.weight).toBeLessThanOrEqual(100);
    }
  });

  it("deve ter soma de pesos igual a 100%", async () => {
    const { result } = renderHook(() => useClassEvaluations("class-1"));

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const totalWeight = result.current.evaluations.reduce(
      (sum, evaluation) => sum + evaluation.weight,
      0
    );
    expect(totalWeight).toBe(100);
  });
});
