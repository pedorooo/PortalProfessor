import { apiRequest } from "../api-client";
import type { ClassSchedule } from "@/types";

export interface ClassApiResponse {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  maxCapacity: number;
  professorId: number;
  professorName: string;
  enrollmentCount: number;
  createdAt: string;
  classAverage?: number;
  averageAttendance?: number;
  schedule?: ClassSchedule[];
}

export interface ClassesListResponse {
  data: ClassApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateClassPayload {
  name: string;
  subject: string;
  description?: string;
  maxCapacity: number;
  professorId: number;
  schedule: ClassSchedule[];
}

export interface UpdateClassPayload {
  name?: string;
  subject?: string;
  description?: string;
  maxCapacity?: number;
  professorId?: number;
  schedule?: ClassSchedule[];
}

export async function getClasses(
  page: number = 1,
  limit: number = 10,
  search?: string,
  subject?: string
): Promise<ClassesListResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (search) params.set("search", search);
  if (subject && subject !== "all") params.set("subject", subject);

  return apiRequest<ClassesListResponse>(`/classes?${params.toString()}`);
}

export async function getClassById(classId: number): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>(`/classes/${classId}`);
}

export async function createClass(
  payload: CreateClassPayload
): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>("/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClass(
  classId: number,
  payload: UpdateClassPayload
): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>(`/classes/${classId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteClass(classId: number): Promise<void> {
  await apiRequest(`/classes/${classId}`, {
    method: "DELETE",
  });
}

export interface ClassStudent {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  enrolledAt: string;
}

export interface ClassStudentsResponse {
  data: ClassStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getClassStudents(
  classId: number,
  page: number = 1,
  limit: number = 10
): Promise<ClassStudentsResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  return apiRequest<ClassStudentsResponse>(
    `/classes/${classId}/students?${params.toString()}`
  );
}
