import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassApiResponse } from "@/lib/api-client";

interface ClassEvaluationConfigHeaderProps {
  readonly classId: string | undefined;
  readonly classData: ClassApiResponse | null;
}

export function ClassEvaluationConfigHeader({
  classId,
  classData,
}: ClassEvaluationConfigHeaderProps) {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate(`/dashboard/classes/${classId}`)}
        className="gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Detalhes
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Configuração de Pesos de Avaliações
        </h1>
        <p className="text-muted-foreground">{classData?.name}</p>
      </div>
    </div>
  );
}
