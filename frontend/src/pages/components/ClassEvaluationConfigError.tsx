import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface ClassEvaluationConfigErrorProps {
  readonly error: string;
}

export function ClassEvaluationConfigError({
  error,
}: ClassEvaluationConfigErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <p className="text-sm text-red-900">{error}</p>
      </Alert>
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Não foi possível carregar os dados
        </p>
      </div>
    </div>
  );
}
