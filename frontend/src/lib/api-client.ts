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
