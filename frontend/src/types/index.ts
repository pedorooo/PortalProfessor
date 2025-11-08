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

export interface Class {
  id: string;
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
