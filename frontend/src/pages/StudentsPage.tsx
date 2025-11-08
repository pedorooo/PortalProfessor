"use client";

import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { StudentDialog } from "@/components/students/student-dialog";
import type { Student } from "@/types";

export default function StudentsPage() {
  const { students, isLoading, addStudent, updateStudent } = useStudents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass =
        classFilter === "all" || student.class === classFilter;
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [searchTerm, classFilter, statusFilter, students]);

  const classes = useMemo(
    () => ["all", ...new Set(students.map((s) => s.class))],
    [students]
  );

  const handleAddStudent = (student: Omit<Student, "id">) => {
    addStudent(student);
    setIsDialogOpen(false);
  };

  const handleUpdateStudent = (student: Student) => {
    updateStudent(student.id, student);
    setEditingStudent(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (student: Student | Omit<Student, "id">) => {
    if ("id" in student) {
      handleUpdateStudent(student);
    } else {
      handleAddStudent(student);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingStudent(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-slate-600 mt-1">
            Gerencie e acompanhe seus alunos
          </p>
        </div>
        <Button onClick={() => handleDialogOpenChange(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Aluno
        </Button>
      </div>

      {/* Students Table with Search and Filters Inside */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2>Lista de alunos</h2>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alunos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>Filtros:</span>
                </div>
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40 bg-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls === "all" ? "Todas as turmas" : cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto">
                {filteredStudents.length} aluno
                {filteredStudents.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Table */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum aluno encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-3">Nome</TableHead>
                    <TableHead className="py-3">Contato</TableHead>
                    <TableHead className="py-3">Turma</TableHead>
                    <TableHead className="py-3 text-right">Média</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="border-b">
                      <TableCell className="py-4 font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`mailto:${student.email}`}
                            className="text-sm hover:underline"
                          >
                            {student.email}
                          </a>
                          <a
                            href={`tel:${student.phone || ""}`}
                            className="text-sm hover:underline"
                          >
                            {student.phone || "N/A"}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{student.class}</TableCell>
                      <TableCell className="py-4 text-right font-semibold text-orange-500">
                        {student.grade || "N/A"}
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            student.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.status === "active" ? "ativo" : "inativo"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Student Dialog */}
      <StudentDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        student={editingStudent || undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
