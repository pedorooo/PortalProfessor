
import { apiRequest } from "../api-client";
import { formatDateFields } from "@/lib/utils/date";

export interface ClassEvaluation {
  id: number;
  name: string;
  dueDate: string;
  status: string;
  gradeWeight: number;
}

export interface ClassEvaluationsResponse {
  data: ClassEvaluation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UpdateEvaluationPayload {
  name?: string;
  dueDate?: string;
  status?: string;
  gradeWeight?: number;
}

export interface CreateEvaluationPayload {
  name: string;
  classId: number;
  dueDate: string;
  gradeWeight?: number;
  status?: "OPEN" | "CLOSED";
}

export async function getClassEvaluations(
  classId: number,
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
): Promise<ClassEvaluationsResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const response = await apiRequest<ClassEvaluationsResponse>(
    `/classes/${classId}/evaluations?${params.toString()}`
  );

  response.data = formatDateFields(response.data);

  return response;
}

export async function createEvaluation(
  payload: CreateEvaluationPayload
): Promise<ClassEvaluation> {
  return apiRequest<ClassEvaluation>("/evaluations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEvaluation(
  evaluationId: number,
  payload: UpdateEvaluationPayload
): Promise<ClassEvaluation> {
  return apiRequest<ClassEvaluation>(`/evaluations/${evaluationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEvaluation(evaluationId: number): Promise<void> {
  return apiRequest<void>(`/evaluations/${evaluationId}`, {
    method: "DELETE",
  });
}
