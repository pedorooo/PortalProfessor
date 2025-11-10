import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { login as apiLogin, logout as apiLogout } from "@/lib/api-client";
import { useTokenRefresh } from "@/hooks/use-api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scheduleTokenRefresh } = useTokenRefresh();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");

          if (globalThis.location.pathname !== "/login") {
            globalThis.location.href = "/login";
          }
          setIsLoading(false);
          return;
        }

        setUser(JSON.parse(storedUser));
        scheduleTokenRefresh(expirationTime);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, [scheduleTokenRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!email || !password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const response = await apiLogin(email, password);

        if (!response.accessToken) {
          throw new Error("Invalid response from server: missing access token");
        }

        localStorage.setItem("accessToken", response.accessToken);

        let authenticatedUser: User;

        if (response.user) {
          authenticatedUser = {
            id: String(response.user.id),
            email: response.user.email,
            name: response.user.name,
          };
        } else {
          try {
            const payload = JSON.parse(
              atob(response.accessToken.split(".")[1])
            );

            authenticatedUser = {
              id: String(payload.sub || "unknown"),
              email: payload.email || email,
              name: payload.name || email.split("@")[0],
            };
          } catch (parseError) {
            console.error("Failed to parse token:", parseError);
            authenticatedUser = {
              id: "unknown",
              email: email,
              name: email.split("@")[0],
            };
          }
        }

        if (!authenticatedUser.id || !authenticatedUser.email) {
          throw new Error("Invalid user data received");
        }

        localStorage.setItem("user", JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);

        try {
          const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
          scheduleTokenRefresh(payload.exp * 1000);
        } catch {
          scheduleTokenRefresh();
        }

        globalThis.location.href = "/dashboard";
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [scheduleTokenRefresh]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    globalThis.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      error,
    }),
    [user, isLoading, login, logout, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
