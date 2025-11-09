export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  grade?: number;
  class: string;
  classId?: number;
  status: "active" | "inactive";
  enrollmentDate: string;
}

export interface Class {
  id: number;
  name: string;
  maxCapacity: number;
  studentCount: number;
  professor: string;
  description?: string;
  subject?:
    | "Matemática"
    | "Português"
    | "Química"
    | "Física"
    | "História"
    | "Geografia"
    | "Inglês"
    | "Biologia";
}
