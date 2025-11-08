import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useClasses } from "@/hooks/use-classes";
import { useEvaluationCriteria } from "@/hooks/use-evaluation-criteria";

export default function ClassEvaluationConfigPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClasses();
  const {
    getCriteriaForClass,
    getTotalWeight,
    addCriteria,
    updateCriteria,
    removeCriteria,
  } = useEvaluationCriteria();

  const classData = classes.find((cls) => cls.id === classId);
  const criteria = getCriteriaForClass(classId || "");
  const totalWeight = getTotalWeight(classId || "");

  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaWeight, setNewCriteriaWeight] = useState<number | "">();

  if (!classData) {
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

  const handleAddCriteria = () => {
    if (!newCriteriaName.trim() || !newCriteriaWeight) {
      return;
    }

    const newWeight =
      typeof newCriteriaWeight === "number" ? newCriteriaWeight : 0;
    if (totalWeight + newWeight > 100) {
      return;
    }

    addCriteria(classId || "", newCriteriaName, newWeight);
    setNewCriteriaName("");
    setNewCriteriaWeight("");
  };

  const handleUpdateCriteria = (id: string, newWeight: number) => {
    const currentCriteria = criteria.find((c) => c.id === id);
    if (!currentCriteria) return;

    const weightDiff = newWeight - currentCriteria.weight;
    if (totalWeight + weightDiff > 100) {
      return;
    }

    updateCriteria(classId || "", id, currentCriteria.name, newWeight);
  };

  const handleRemoveCriteria = (id: string) => {
    removeCriteria(classId || "", id);
  };

  const isWeightValid = totalWeight === 100;
  const canAddMore = totalWeight < 100;

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold">Configuração de Avaliações</h1>
          <p className="text-muted-foreground">{classData.name}</p>
        </div>
      </div>

      {/* Weight Status Alert */}
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

      {/* Current Criteria */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Critérios de Avaliação</h2>
        </CardHeader>
        <CardContent>
          {criteria.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                Nenhum critério adicionado. Adicione o primeiro critério abaixo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{criterion.name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) => {
                          const newWeight =
                            Number.parseInt(e.target.value) || 0;
                          handleUpdateCriteria(criterion.id, newWeight);
                        }}
                        className="w-20 text-center"
                      />
                      <span className="text-sm font-semibold">%</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCriteria(criterion.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Criteria */}
      {canAddMore && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Adicionar Novo Critério</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="criteria-name" className="text-sm font-semibold">
                Nome do Critério
              </label>
              <Input
                id="criteria-name"
                placeholder="Ex: Prova Final, Lista de Exercícios, etc."
                value={newCriteriaName}
                onChange={(e) => setNewCriteriaName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Peso Percentual (%)
                {totalWeight > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Disponível: {100 - totalWeight}%
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="0"
                max={100 - totalWeight}
                placeholder="0"
                value={newCriteriaWeight || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number.parseInt(e.target.value)
                    : "";
                  setNewCriteriaWeight(value);
                }}
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-900">
                A soma total dos pesos deve ser sempre 100%. Atualmente você
                pode adicionar até <strong>{100 - totalWeight}%</strong>.
              </p>
            </Alert>

            <Button
              onClick={handleAddCriteria}
              disabled={
                !newCriteriaName.trim() ||
                !newCriteriaWeight ||
                totalWeight +
                  (typeof newCriteriaWeight === "number"
                    ? newCriteriaWeight
                    : 0) >
                  100
              }
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Adicionar Critério
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 space-y-2">
            <p className="font-semibold">💡 Dicas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Você pode editar os pesos clicando nos campos de percentual
              </li>
              <li>Use a lixeira para remover um critério</li>
              <li>A soma deve ser exatamente 100% para configuração válida</li>
              <li>Você não pode exceder 100% na soma total</li>
            </ul>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
