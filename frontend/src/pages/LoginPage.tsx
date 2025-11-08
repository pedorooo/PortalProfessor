"use client";

import type React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
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

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Portal do Professor</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Insira suas credenciais para acessar o sistema de gestão acadêmica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || localError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="professor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Credenciais de teste:
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  <strong>Usuário 1:</strong>
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
                <p className="text-xs text-muted-foreground mb-1">
                  <strong>Usuário 2:</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Email:{" "}
                  <code className="bg-muted px-1 rounded">
                    teacher@example.com
                  </code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Senha:{" "}
                  <code className="bg-muted px-1 rounded">teacher123</code>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
