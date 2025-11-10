import type React from "react";

import { useState, useEffect } from "react";
import type { Class, ClassSchedule } from "@/types";
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
import { SUBJECTS, DAYS_OF_WEEK, CLASS_TIMES } from "@/constants/subjects";
import { X, Plus } from "lucide-react";

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
    schedule: [] as ClassSchedule[],
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        subject: classData.subject || "",
        maxCapacity: classData.maxCapacity.toString(),
        description: classData.description || "",
        schedule: classData.schedule || [],
      });
    } else {
      setFormData({
        name: "",
        subject: "",
        maxCapacity: "",
        description: "",
        schedule: [],
      });
    }
  }, [classData, isOpen]);

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { dayOfWeek: "", startTime: "", endTime: "" },
      ],
    });
  };

  const removeSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const updateSchedule = (
    index: number,
    field: keyof ClassSchedule,
    value: string
  ) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.maxCapacity || !formData.subject) {
      return;
    }

    // Validar que tenha pelo menos um horário
    if (formData.schedule.length === 0) {
      alert("Adicione pelo menos um horário para a turma");
      return;
    }

    // Validar que todos os horários estejam preenchidos
    const hasIncompleteSchedule = formData.schedule.some(
      (s) => !s.dayOfWeek || !s.startTime || !s.endTime
    );
    if (hasIncompleteSchedule) {
      alert("Preencha todos os campos dos horários");
      return;
    }

    if (classData) {
      const updatedClassData: Class = {
        id: classData.id,
        name: formData.name,
        subject: formData.subject as Class["subject"],
        maxCapacity: Number.parseInt(formData.maxCapacity, 10),
        studentCount: classData.studentCount,
        professor: classData.professor,
        description: formData.description || undefined,
        schedule: formData.schedule,
      };
      onSubmit(updatedClassData);
    } else {
      const newClassData = {
        name: formData.name,
        subject: formData.subject as Class["subject"],
        maxCapacity: Number.parseInt(formData.maxCapacity, 10),
        studentCount: 0,
        professor: "",
        description: formData.description || undefined,
        schedule: formData.schedule,
      };
      onSubmit(newClassData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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

          {/* Horários */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Horários da Turma <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSchedule}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Adicionar Horário
              </Button>
            </div>

            {formData.schedule.length === 0 && (
              <p className="text-sm text-red-500 font-medium">
                Adicione pelo menos um horário para a turma
              </p>
            )}

            <div className="space-y-3">
              {formData.schedule.map((schedule, index) => (
                <div
                  key={`schedule-${index}-${schedule.dayOfWeek}`}
                  className="flex gap-2 items-start p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Select
                      value={schedule.dayOfWeek}
                      onValueChange={(value) =>
                        updateSchedule(index, "dayOfWeek", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Dia da semana" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={schedule.startTime}
                          onValueChange={(value) =>
                            updateSchedule(index, "startTime", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Início" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASS_TIMES.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={schedule.endTime}
                          onValueChange={(value) =>
                            updateSchedule(index, "endTime", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Fim" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASS_TIMES.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchedule(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
