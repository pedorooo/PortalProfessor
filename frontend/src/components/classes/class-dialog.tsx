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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from "@/constants/subjects";

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
    subject: "" as Class["subject"] | "",
    maxCapacity: "",
    description: "",
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        subject: classData.subject || "",
        maxCapacity: classData.maxCapacity.toString(),
        description: classData.description || "",
      });
    } else {
      setFormData({
        name: "",
        subject: "",
        maxCapacity: "",
        description: "",
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.maxCapacity || !formData.subject) {
      return;
    }

    if (classData) {
      // Editing: include the id
      const updatedClassData: Class = {
        id: classData.id,
        name: formData.name,
        subject: formData.subject as Class["subject"],
        maxCapacity: Number.parseInt(formData.maxCapacity, 10),
        studentCount: classData.studentCount,
        professor: classData.professor,
        description: formData.description || undefined,
      };
      onSubmit(updatedClassData);
    } else {
      // Creating new: no id needed
      const newClassData = {
        name: formData.name,
        subject: formData.subject as Class["subject"],
        maxCapacity: Number.parseInt(formData.maxCapacity, 10),
        studentCount: 0,
        professor: "",
        description: formData.description || undefined,
      };
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
              placeholder="Ex: Turma A - Matemática"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Disciplina</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) =>
                setFormData({ ...formData, subject: value as Class["subject"] })
              }
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da turma (opcional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

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
