import { useCallback, useEffect, useRef } from "react";
import { refreshToken as refreshTokenAPI } from "@/lib/api-client";

/**
 * Hook to handle API token refresh logic
 * Automatically refreshes token when it's about to expire
 */
export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = useCallback((expiresAt?: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // If no expiration time, try to refresh in 30 minutes
    const timeUntilExpiry = expiresAt ? expiresAt - Date.now() : 30 * 60 * 1000;

    // Refresh when 5 minutes are left (or at least after 1 minute)
    const refreshDelay = Math.max(
      Math.min(timeUntilExpiry - 5 * 60 * 1000, timeUntilExpiry),
      60 * 1000
    );

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await refreshTokenAPI();
        localStorage.setItem("accessToken", response.accessToken);

        // Parse token to get expiration time
        try {
          const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
          scheduleTokenRefresh(payload.exp * 1000);
        } catch {
          // If we can't parse the token, schedule another refresh in 30 minutes
          scheduleTokenRefresh();
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Try again in 5 minutes
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

/**
 * Hook for API error handling and retry logic
 */
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
