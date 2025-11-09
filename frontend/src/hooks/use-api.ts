import { useCallback, useEffect, useRef } from "react";
import { refreshToken as refreshTokenAPI } from "@/lib/api-client";

export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = useCallback((expiresAt?: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeUntilExpiry = expiresAt ? expiresAt - Date.now() : 30 * 60 * 1000;

    const refreshDelay = Math.max(
      Math.min(timeUntilExpiry - 5 * 60 * 1000, timeUntilExpiry),
      60 * 1000
    );

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await refreshTokenAPI();
        localStorage.setItem("accessToken", response.accessToken);

        try {
          const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
          scheduleTokenRefresh(payload.exp * 1000);
        } catch {
          scheduleTokenRefresh();
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        scheduleTokenRefresh(Date.now() + 5 * 60 * 1000);
      }
    }, refreshDelay);
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return { scheduleTokenRefresh };
}

export interface ApiError extends Error {
  status?: number;
  isNetworkError?: boolean;
}

export function useApiError() {
  const isAuthError = useCallback((error: unknown): boolean => {
    return error instanceof Error && "status" in error && error.status === 401;
  }, []);

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (!(error instanceof Error)) {
      return false;
    }
    return error.message.includes("Network") || error.message.includes("fetch");
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }, []);

  return {
    isAuthError,
    isNetworkError,
    getErrorMessage,
  };
}
