import { formatDateFields } from "@/lib/utils/date";

/**
 * API Client Configuration
 * Centralized API configuration and request handling
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Creates a request with proper headers and authentication
 */
function createHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

interface ApiRequestOptions extends RequestInit {
  includeAuth?: boolean;
}

/**
 * Generic API request handler
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { includeAuth = true, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = createHeaders(includeAuth);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
      credentials: "include", // Include cookies for refresh token
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const error = new Error(
        typeof data === "object" && data !== null && "message" in data
          ? (data as { message: string }).message
          : `API Error: ${response.status}`
      );
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}

/**
 * Login request
 */
export interface LoginUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: LoginUser;
  refreshToken?: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    includeAuth: false,
  });
}

/**
 * Register request
 */
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface RegisterResponse {
  status: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    includeAuth: false,
  });
}

/**
 * Refresh token request
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  return apiRequest<RefreshTokenResponse>("/auth/refresh-token", {
    method: "POST",
    includeAuth: false,
  });
}

/**
 * Logout request
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Logout errors are not critical
    console.error("Logout error:", error);
  }
}

/**
 * Classes API
 */
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
}

export interface UpdateClassPayload {
  name?: string;
  subject?: string;
  description?: string;
  maxCapacity?: number;
  professorId?: number;
}

/**
 * Get all classes with pagination
 */
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

/**
 * Get a single class by ID
 */
export async function getClassById(classId: number): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>(`/classes/${classId}`);
}

/**
 * Create a new class
 */
export async function createClass(
  payload: CreateClassPayload
): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>("/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a class
 */
export async function updateClass(
  classId: number,
  payload: UpdateClassPayload
): Promise<ClassApiResponse> {
  return apiRequest<ClassApiResponse>(`/classes/${classId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a class
 */
export async function deleteClass(classId: number): Promise<void> {
  await apiRequest(`/classes/${classId}`, {
    method: "DELETE",
  });
}

/**
 * Class Students API
 */
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

/**
 * Get all students in a class
 */
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

/**
 * Class Evaluations API
 */
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

/**
 * Get all evaluations in a class
 */
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

/**
 * Update evaluation payload
 */
export interface UpdateEvaluationPayload {
  name?: string;
  dueDate?: string;
  status?: string;
  gradeWeight?: number;
}

/**
 * Update an evaluation
 */
export async function updateEvaluation(
  evaluationId: number,
  payload: UpdateEvaluationPayload
): Promise<ClassEvaluation> {
  return apiRequest<ClassEvaluation>(`/evaluations/${evaluationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Create evaluation payload
 */
export interface CreateEvaluationPayload {
  name: string;
  classId: number;
  dueDate: string;
  gradeWeight?: number;
  status?: "OPEN" | "CLOSED";
}

/**
 * Create a new evaluation
 */
export async function createEvaluation(
  payload: CreateEvaluationPayload
): Promise<ClassEvaluation> {
  return apiRequest<ClassEvaluation>("/evaluations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an evaluation
 */
export async function deleteEvaluation(evaluationId: number): Promise<void> {
  return apiRequest<void>(`/evaluations/${evaluationId}`, {
    method: "DELETE",
  });
}
