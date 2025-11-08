export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  grade?: number;
  class: string;
  status: "active" | "inactive";
  enrollmentDate: string;
}
