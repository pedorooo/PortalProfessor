import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassesHeaderProps {
  onAddClick: () => void;
}

export function ClassesHeader({ onAddClick }: Readonly<ClassesHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Turmas</h1>
        <p className="text-muted-foreground">
          Gerencie suas turmas e matrículas
        </p>
      </div>
      <Button
        onClick={onAddClick}
        className="gap-2 bg-purple-600 hover:bg-purple-700"
      >
        <Plus className="h-4 w-4" />
        Adicionar Turma
      </Button>
    </div>
  );
}
