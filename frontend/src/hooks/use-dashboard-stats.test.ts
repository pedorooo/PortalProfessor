import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDashboardStats } from "./use-dashboard-stats";
import * as apiClient from "@/lib/api-client";

// Mock the API client
vi.mock("@/lib/api-client", () => ({
  getDashboardStats: vi.fn(),
}));

describe("useDashboardStats", () => {
  const mockDashboardStats = {
    totalStudents: 50,
    totalClasses: 10,
    upcomingEvaluations: 5,
    avgStudentScore: 85.5,
    enrollmentTrend: [
      { month: "jun 2025", students: 10 },
      { month: "jul 2025", students: 15 },
      { month: "ago 2025", students: 20 },
      { month: "set 2025", students: 25 },
      { month: "out 2025", students: 30 },
      { month: "nov 2025", students: 35 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for expected errors in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and return dashboard stats successfully", async () => {
    vi.mocked(apiClient.getDashboardStats).mockResolvedValue(
      mockDashboardStats
    );

    const { result } = renderHook(() => useDashboardStats());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have stats
    expect(result.current.stats).toEqual(mockDashboardStats);
    expect(result.current.error).toBeNull();
    expect(apiClient.getDashboardStats).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors gracefully", async () => {
    const errorMessage = "Failed to fetch dashboard stats";
    vi.mocked(apiClient.getDashboardStats).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useDashboardStats());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it("should handle non-Error exceptions", async () => {
    vi.mocked(apiClient.getDashboardStats).mockRejectedValue("String error");

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load dashboard stats");
  });

  it("should return correct data structure", async () => {
    vi.mocked(apiClient.getDashboardStats).mockResolvedValue(
      mockDashboardStats
    );

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const stats = result.current.stats;
    expect(stats).toHaveProperty("totalStudents");
    expect(stats).toHaveProperty("totalClasses");
    expect(stats).toHaveProperty("upcomingEvaluations");
    expect(stats).toHaveProperty("avgStudentScore");
    expect(stats).toHaveProperty("enrollmentTrend");
    expect(Array.isArray(stats?.enrollmentTrend)).toBe(true);
  });

  it("should handle empty stats", async () => {
    const emptyStats = {
      totalStudents: 0,
      totalClasses: 0,
      upcomingEvaluations: 0,
      avgStudentScore: 0,
      enrollmentTrend: [],
    };

    vi.mocked(apiClient.getDashboardStats).mockResolvedValue(emptyStats);

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(emptyStats);
    expect(result.current.stats?.totalStudents).toBe(0);
    expect(result.current.stats?.enrollmentTrend).toHaveLength(0);
  });

  it("should validate enrollment trend structure", async () => {
    vi.mocked(apiClient.getDashboardStats).mockResolvedValue(
      mockDashboardStats
    );

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const trend = result.current.stats?.enrollmentTrend;
    expect(trend).toHaveLength(6);

    if (trend) {
      for (const item of trend) {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("students");
        expect(typeof item.month).toBe("string");
        expect(typeof item.students).toBe("number");
      }
    }
  });

  it("should only fetch data once on mount", async () => {
    vi.mocked(apiClient.getDashboardStats).mockResolvedValue(
      mockDashboardStats
    );

    const { result, rerender } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Rerender the hook
    rerender();

    // Should still only have called the API once
    expect(apiClient.getDashboardStats).toHaveBeenCalledTimes(1);
  });
});
