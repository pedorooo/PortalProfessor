"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EnrollStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (student: {
    name: string;
    email: string;
    phone?: string;
    status: "active" | "inactive";
    enrollmentDate: string;
  }) => void;
  isLoading?: boolean;
}

export function EnrollStudentDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: Readonly<EnrollStudentDialogProps>) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone?: string;
    status: "active" | "inactive";
    enrollmentDate: string;
  }>({
    name: "",
    email: "",
    phone: "",
    status: "active",
    enrollmentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "active",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Matricular Novo Aluno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Digite o nome do aluno"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="aluno@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Data de Matrícula</Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) =>
                setFormData({ ...formData, enrollmentDate: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Matriculando..." : "Matricular Aluno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
