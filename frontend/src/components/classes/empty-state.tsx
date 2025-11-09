import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

export function EmptyState({
  searchTerm,
  onAddClick,
}: Readonly<EmptyStateProps>) {
  return (
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
              onClick={onAddClick}
              className="gap-2 mt-4 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Adicionar Turma
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
