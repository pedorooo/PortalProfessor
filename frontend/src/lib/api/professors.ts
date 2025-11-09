import { apiRequest } from "../api-client";

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  upcomingEvaluations: number;
  avgStudentScore: number;
  enrollmentTrend: { month: string; students: number }[];
}

/**
 * Get dashboard statistics for all students and classes in the system
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiRequest<DashboardStats>("/professors/dashboard");
};
