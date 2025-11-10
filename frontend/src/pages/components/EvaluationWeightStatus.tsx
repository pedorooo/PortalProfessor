import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EvaluationWeightStatusProps {
  readonly totalWeight: number;
}

export function EvaluationWeightStatus({
  totalWeight,
}: Readonly<EvaluationWeightStatusProps>) {
  const isWeightValid = totalWeight === 100;

  return (
    <Card
      className={`border-2 ${
        isWeightValid
          ? "border-green-200 bg-green-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <AlertCircle
            className={`h-5 w-5 ${
              isWeightValid ? "text-green-600" : "text-yellow-600"
            }`}
          />
          <div>
            <p
              className={`font-semibold ${
                isWeightValid ? "text-green-800" : "text-yellow-800"
              }`}
            >
              {isWeightValid
                ? "Configuração Válida"
                : "Configuração Incompleta"}
            </p>
            <p
              className={`text-sm ${
                isWeightValid ? "text-green-700" : "text-yellow-700"
              }`}
            >
              Peso total: <strong>{totalWeight}%</strong> de 100%
              {!isWeightValid && (
                <span> - Faltam {100 - totalWeight}% para completar</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
