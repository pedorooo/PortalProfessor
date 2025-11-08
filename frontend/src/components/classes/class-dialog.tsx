import type React from "react";

import { useState, useEffect } from "react";
import type { Class } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (classData: Class | Omit<Class, "id">) => void;
  classData?: Class;
  isLoading?: boolean;
}

export function ClassDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  classData,
  isLoading,
}: Readonly<ClassDialogProps>) {
  const [formData, setFormData] = useState({
    name: "",
    maxCapacity: "",
    studentCount: "0",
    professor: "",
    description: "",
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        maxCapacity: classData.maxCapacity.toString(),
        studentCount: classData.studentCount.toString(),
        professor: classData.professor,
        description: classData.description || "",
      });
    } else {
      setFormData({
        name: "",
        maxCapacity: "",
        studentCount: "0",
        professor: "",
        description: "",
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.maxCapacity || !formData.professor) {
      return;
    }

    const newClassData = {
      name: formData.name,
      maxCapacity: Number.parseInt(formData.maxCapacity, 10),
      studentCount: Number.parseInt(formData.studentCount, 10),
      professor: formData.professor,
      description: formData.description || undefined,
    };

    if (classData) {
      onSubmit({
        ...classData,
        ...newClassData,
      });
    } else {
      onSubmit(newClassData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {classData ? "Editar Turma" : "Adicionar Nova Turma"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Turma</Label>
            <Input
              id="name"
              placeholder="Ex: Matemática Avançada"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professor">Professor</Label>
            <Input
              id="professor"
              placeholder="Nome do professor"
              value={formData.professor}
              onChange={(e) =>
                setFormData({ ...formData, professor: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da turma"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Capacidade Máxima</Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                placeholder="30"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, maxCapacity: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentCount">Alunos Atuais</Label>
              <Input
                id="studentCount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.studentCount}
                onChange={(e) =>
                  setFormData({ ...formData, studentCount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {classData ? "Atualizar Turma" : "Adicionar Turma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
