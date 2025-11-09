
import { apiRequest } from "../api-client";

export interface StudentApiResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  enrollmentCount: number;
  className?: string;
  classId?: number;
  grade?: number;
}

export interface StudentsListResponse {
  data: StudentApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  classId?: number;
}

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export async function getStudents(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  classId?: number
): Promise<StudentsListResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (classId) params.set("classId", classId.toString());

  return apiRequest<StudentsListResponse>(`/students?${params.toString()}`);
}

export async function getStudentById(
  studentId: number
): Promise<StudentApiResponse> {
  return apiRequest<StudentApiResponse>(`/students/${studentId}`);
}

export async function createStudent(
  payload: CreateStudentPayload
): Promise<StudentApiResponse> {
  return apiRequest<StudentApiResponse>("/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStudent(
  studentId: number,
  payload: UpdateStudentPayload
): Promise<StudentApiResponse> {
  return apiRequest<StudentApiResponse>(`/students/${studentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteStudent(studentId: number): Promise<void> {
  await apiRequest(`/students/${studentId}`, {
    method: "DELETE",
  });
}
