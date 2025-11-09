import { apiRequest } from "../api-client";

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  upcomingEvaluations: number;
  avgStudentScore: number;
  enrollmentTrend: { month: string; students: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiRequest<DashboardStats>("/professors/dashboard");
};
