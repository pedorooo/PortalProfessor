
import { apiRequest } from "../api-client";

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

export interface RefreshTokenResponse {
  accessToken: string;
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

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    includeAuth: false,
  });
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  return apiRequest<RefreshTokenResponse>("/auth/refresh-token", {
    method: "POST",
    includeAuth: false,
  });
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
}
