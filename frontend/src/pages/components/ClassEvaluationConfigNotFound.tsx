import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClassEvaluationConfigNotFound() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/classes")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Turmas
      </Button>
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Turma não encontrada</p>
      </div>
    </div>
  );
}
