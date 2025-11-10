import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardStats } from "./professors";
import * as apiClient from "../api-client";

vi.mock("../api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("professors API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardStats", () => {
    it("should call apiRequest with correct endpoint", async () => {
      const mockStats = {
        totalStudents: 50,
        totalClasses: 10,
        upcomingEvaluations: 5,
        avgStudentScore: 85.5,
        enrollmentTrend: [
          { month: "jun 2025", students: 10 },
          { month: "jul 2025", students: 15 },
        ],
      };

      vi.mocked(apiClient.apiRequest).mockResolvedValue(mockStats);

      const result = await getDashboardStats();

      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        "/professors/dashboard"
      );
      expect(result).toEqual(mockStats);
    });

    it("should return dashboard stats with correct structure", async () => {
      const mockStats = {
        totalStudents: 100,
        totalClasses: 20,
        upcomingEvaluations: 8,
        avgStudentScore: 78.3,
        enrollmentTrend: [
          { month: "jun 2025", students: 5 },
          { month: "jul 2025", students: 10 },
          { month: "ago 2025", students: 15 },
          { month: "set 2025", students: 20 },
          { month: "out 2025", students: 25 },
          { month: "nov 2025", students: 30 },
        ],
      };

      vi.mocked(apiClient.apiRequest).mockResolvedValue(mockStats);

      const result = await getDashboardStats();

      expect(result).toHaveProperty("totalStudents");
      expect(result).toHaveProperty("totalClasses");
      expect(result).toHaveProperty("upcomingEvaluations");
      expect(result).toHaveProperty("avgStudentScore");
      expect(result).toHaveProperty("enrollmentTrend");
      expect(Array.isArray(result.enrollmentTrend)).toBe(true);
      expect(result.enrollmentTrend).toHaveLength(6);
    });

    it("should handle empty stats", async () => {
      const emptyStats = {
        totalStudents: 0,
        totalClasses: 0,
        upcomingEvaluations: 0,
        avgStudentScore: 0,
        enrollmentTrend: [],
      };

      vi.mocked(apiClient.apiRequest).mockResolvedValue(emptyStats);

      const result = await getDashboardStats();

      expect(result.totalStudents).toBe(0);
      expect(result.totalClasses).toBe(0);
      expect(result.upcomingEvaluations).toBe(0);
      expect(result.avgStudentScore).toBe(0);
      expect(result.enrollmentTrend).toHaveLength(0);
    });

    it("should propagate errors from apiRequest", async () => {
      const error = new Error("Network error");
      vi.mocked(apiClient.apiRequest).mockRejectedValue(error);

      await expect(getDashboardStats()).rejects.toThrow("Network error");
      expect(apiClient.apiRequest).toHaveBeenCalledWith(
        "/professors/dashboard"
      );
    });

    it("should validate enrollment trend item structure", async () => {
      const mockStats = {
        totalStudents: 50,
        totalClasses: 10,
        upcomingEvaluations: 5,
        avgStudentScore: 85.5,
        enrollmentTrend: [
          { month: "jun 2025", students: 10 },
          { month: "jul 2025", students: 15 },
          { month: "ago 2025", students: 20 },
        ],
      };

      vi.mocked(apiClient.apiRequest).mockResolvedValue(mockStats);

      const result = await getDashboardStats();

      for (const item of result.enrollmentTrend) {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("students");
        expect(typeof item.month).toBe("string");
        expect(typeof item.students).toBe("number");
      }
    });

    it("should handle API responses with decimal scores", async () => {
      const mockStats = {
        totalStudents: 50,
        totalClasses: 10,
        upcomingEvaluations: 5,
        avgStudentScore: 85.67,
        enrollmentTrend: [],
      };

      vi.mocked(apiClient.apiRequest).mockResolvedValue(mockStats);

      const result = await getDashboardStats();

      expect(result.avgStudentScore).toBe(85.67);
      expect(typeof result.avgStudentScore).toBe("number");
    });
  });
});
