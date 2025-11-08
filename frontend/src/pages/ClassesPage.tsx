"use client";

import { useState, useMemo } from "react";
import { useClasses } from "@/hooks/use-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search, Users, MoreVertical } from "lucide-react";
import { ClassDialog } from "@/components/classes/class-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Class } from "@/types";

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; badge: string; bar: string }
> = {
  Matemática: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    bar: "bg-blue-700",
  },
  Português: {
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-700",
  },
  Química: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    bar: "bg-purple-700",
  },
  Física: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
    bar: "bg-orange-700",
  },
  História: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    bar: "bg-amber-700",
  },
  Geografia: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    badge: "bg-teal-100 text-teal-800",
    bar: "bg-teal-700",
  },
  Inglês: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    bar: "bg-red-700",
  },
  Biologia: {
    bg: "bg-lime-50",
    text: "text-lime-700",
    badge: "bg-lime-100 text-lime-800",
    bar: "bg-lime-700",
  },
};

export default function ClassesPage() {
  const { isLoading, addClass, updateClass, deleteClass, filterClasses } =
    useClasses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = useMemo(
    () => filterClasses(searchTerm),
    [searchTerm, filterClasses]
  );

  const handleAddClass = (classData: Omit<Class, "id">) => {
    addClass(classData);
    setIsDialogOpen(false);
  };

  const handleUpdateClass = (classData: Class | Omit<Class, "id">) => {
    if ("id" in classData) {
      updateClass(classData.id, classData);
    }
    setEditingClass(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (classData: Class) => {
    setEditingClass(classData);
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingClass(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie suas turmas e matrículas
          </p>
        </div>
        <Button
          onClick={() => handleDialogOpenChange(true)}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar Turma
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar turmas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="space-y-3">
              <p className="text-muted-foreground text-lg font-medium">
                Nenhuma turma encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? `Tente ajustar o termo de busca "${searchTerm}"`
                  : "Crie sua primeira turma para começar"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => handleDialogOpenChange(true)}
                  className="gap-2 mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Turma
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classData) => {
            const colors = classData.subject
              ? SUBJECT_COLORS[classData.subject] || SUBJECT_COLORS.Matemática
              : SUBJECT_COLORS.Matemática;

            return (
              <Card
                key={classData.id}
                className="hover:shadow-lg transition-shadow bg-white flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {classData.subject && (
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colors.badge}`}
                            >
                              {classData.subject}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold">{classData.name}</h3>
                        <p className={`text-sm font-medium`}>
                          Prof. {classData.professor}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Class actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(classData)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteClass(classData.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {classData.description && (
                    <p className="text-sm text-muted-foreground">
                      {classData.description}
                    </p>
                  )}
                </CardContent>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Matrícula de Alunos
                    </span>
                    <span className="text-sm font-semibold">
                      {classData.studentCount}/{classData.maxCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full bg-purple-700`}
                      style={{
                        width: `${
                          (classData.studentCount / classData.maxCapacity) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Capacidade
                    </div>
                    <span className="text-sm font-medium">
                      {classData.maxCapacity} alunos
                    </span>
                  </div> */}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClassDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={editingClass ? handleUpdateClass : handleAddClass}
        classData={editingClass || undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
