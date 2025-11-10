"use client";

import type React from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import { register } from "@/lib/api-client";

type TabType = "signin" | "signup";

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      await login(email, password);
      // Redireciona após login bem-sucedido
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError("As senhas não coincidem");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      // Register the user as a professor
      await register({
        email,
        password,
        name,
        role: "PROFESSOR",
      });

      // After successful registration, log them in
      await login(email, password);
      // Redireciona após registro e login bem-sucedidos
      navigate("/dashboard");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Falha ao criar conta"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-purple-700">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Portal do Professor</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            {/* Tab Selector */}
            <div className="flex rounded-lg bg-purple-100/50 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "signin"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-purple-700 hover:text-purple-900 hover:bg-purple-50"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "signup"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-purple-700 hover:text-purple-900 hover:bg-purple-50"
                }`}
              >
                Cadastrar
              </button>
            </div>

            <CardTitle>
              {activeTab === "signin" ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {activeTab === "signin"
                ? "Insira suas credenciais para acessar o sistema de gestão acadêmica"
                : "Preencha os dados abaixo para criar sua conta de professor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === "signin" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(error || localError) && (
                  <Alert variant="destructive">
                    <AlertDescription>{error || localError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="professor@escola.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Credenciais de teste:
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    <strong>Usuário</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email:{" "}
                    <code className="bg-muted px-1 rounded">
                      professor@example.com
                    </code>
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Senha:{" "}
                    <code className="bg-muted px-1 rounded">password123</code>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {localError && (
                  <Alert variant="destructive">
                    <AlertDescription>{localError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="professor@escola.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
