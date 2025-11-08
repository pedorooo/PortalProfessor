import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

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

// Mock database de usuários - em produção seria da API
const MOCK_USERS: Record<string, { password: string; name: string }> = {
  "professor@example.com": {
    password: "password123",
    name: "Professor Demo",
  },
  "teacher@example.com": {
    password: "teacher123",
    name: "Teacher Example",
  },
};

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }

      // Validar credenciais contra usuários mockados
      const mockUser = MOCK_USERS[email];

      if (!mockUser?.password || mockUser.password !== password) {
        throw new Error("Email ou senha inválidos");
      }

      // Criar usuário autenticado
      const authenticatedUser: User = {
        id: "1",
        email: email,
        name: mockUser.name,
      };

      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

      // Store in localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      // Use standard navigation to avoid depending on next/navigation types
      globalThis.location.href = "/dashboard";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Use standard navigation to avoid depending on next/navigation types
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
