import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EvaluationFormProps {
  readonly isOpen: boolean;
  readonly isLoading: boolean;
  readonly formData: {
    readonly name: string;
    readonly dueDate: string;
    readonly gradeWeight: number;
  };
  readonly totalExistingWeight: number;
  readonly onNameChange: (value: string) => void;
  readonly onDateChange: (value: string) => void;
  readonly onWeightChange: (value: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
}

export function EvaluationForm({
  isOpen,
  isLoading,
  formData,
  totalExistingWeight,
  onNameChange,
  onDateChange,
  onWeightChange,
  onSubmit,
  onCancel,
}: EvaluationFormProps) {
  if (!isOpen) return null;

  const remainingWeight = 100 - totalExistingWeight;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h3 className="font-semibold text-lg">Criar Nova Avaliação</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="eval-name"
            className="text-sm font-medium text-gray-700"
          >
            Nome da Avaliação *
          </label>
          <Input
            id="eval-name"
            type="text"
            value={formData.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Prova 1, Trabalho Final"
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="eval-date"
            className="text-sm font-medium text-gray-700"
          >
            Data de Entrega *
          </label>
          <Input
            id="eval-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="eval-weight"
            className="text-sm font-medium text-gray-700"
          >
            Peso (%) - Máximo disponível: {remainingWeight}%
          </label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="eval-weight"
              type="number"
              min="0"
              max={remainingWeight}
              value={formData.gradeWeight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-32"
            />
            <span className="text-sm font-semibold">%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Avaliação"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
