import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClasses } from "@/hooks/use-classes";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/context/ToastContext";
import { ClassDialog } from "@/components/classes/class-dialog";
import { ClassesHeader } from "@/components/classes/classes-header";
import { ClassesFilters } from "@/components/classes/classes-filters";
import { ClassesGrid } from "@/components/classes/classes-grid";
import { EmptyState } from "@/components/classes/empty-state";
import { DeleteConfirmDialog } from "@/components/classes/delete-confirm-dialog";
import { PageLoader } from "@/components/ui/page-loader";
import type { Class } from "@/types";

export default function ClassesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { classes, isLoading, addClass, updateClass, deleteClass } = useClasses(
    {
      searchTerm: debouncedSearchTerm,
      subject: selectedSubject,
    }
  );

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingClass(null);
    }
  };

  const handleAddClick = () => {
    handleDialogOpenChange(true);
  };

  const handleAddClass = async (classData: Omit<Class, "id">) => {
    try {
      await addClass(classData);
      toast.success(`Turma "${classData.name}" criada com sucesso!`);
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar turma";
      toast.error(errorMessage);
      console.error("Error adding class:", err);
    }
  };

  const handleUpdateClass = async (classData: Class | Omit<Class, "id">) => {
    try {
      if ("id" in classData) {
        await updateClass(classData.id, classData);
        toast.success(`Turma "${classData.name}" atualizada com sucesso!`);
        setEditingClass(null);
        setIsDialogOpen(false);
      } else {
        toast.error("Erro ao atualizar turma: ID não encontrado");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar turma";
      toast.error(errorMessage);
      console.error("Error updating class:", err);
    }
  };

  const handleEdit = (classData: Class) => {
    setEditingClass(classData);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (classData: Class) => {
    setClassToDelete(classData);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass(classToDelete.id);
        toast.success(`Turma "${classToDelete.name}" deletada com sucesso!`);
        setDeleteConfirmOpen(false);
        setClassToDelete(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao deletar turma";
        toast.error(errorMessage);
        console.error("Error deleting class:", err);
      }
    }
  };

  const handleClassClick = (classId: number) => {
    navigate(`/dashboard/classes/${classId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <ClassesHeader onAddClick={handleAddClick} />

      <ClassesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      {isLoading ? (
        <PageLoader message="Carregando turmas..." />
      ) : classes.length === 0 ? (
        <EmptyState searchTerm={searchTerm} onAddClick={handleAddClick} />
      ) : (
        <ClassesGrid
          classes={classes}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onClassClick={handleClassClick}
        />
      )}

      <ClassDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={editingClass ? handleUpdateClass : handleAddClass}
        classData={editingClass || undefined}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        classToDelete={classToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
