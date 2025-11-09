import { useState, useEffect } from "react";
import { getDashboardStats } from "@/lib/api-client";

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  upcomingEvaluations: number;
  avgStudentScore: number;
  enrollmentTrend: Array<{ month: string; students: number }>;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dashboardStats = await getDashboardStats();

        setStats(dashboardStats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard stats"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return { stats, isLoading, error };
}
