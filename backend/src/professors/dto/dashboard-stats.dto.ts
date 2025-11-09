export interface DashboardStatsResponse {
  totalStudents: number;
  totalClasses: number;
  upcomingEvaluations: number;
  avgStudentScore: number;
  enrollmentTrend: Array<{
    month: string;
    students: number;
  }>;
}
