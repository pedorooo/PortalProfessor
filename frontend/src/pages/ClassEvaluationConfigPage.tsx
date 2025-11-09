import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/context/ToastContext";
import {
  getClassById,
  getClassEvaluations,
  updateEvaluation,
  createEvaluation,
  deleteEvaluation,
} from "@/lib/api-client";
import type { ClassApiResponse, ClassEvaluation } from "@/lib/api-client";
import { EvaluationWeightStatus } from "./components/EvaluationWeightStatus";
import { EvaluationForm } from "./components/EvaluationForm";
import { EvaluationList } from "./components/EvaluationList";

export default function ClassEvaluationConfigPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const toastContext = useToast();
  const [classData, setClassData] = useState<ClassApiResponse | null>(null);
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state for new evaluation
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    gradeWeight: 0,
  });
  const [creatingEval, setCreatingEval] = useState(false);
  const [previousWeights, setPreviousWeights] = useState<Map<number, number>>(
    new Map()
  );

  // Fetch class and evaluations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!classId) {
          console.warn("classId não definido");
          setError("ID da turma não encontrado");
          return;
        }
        setLoading(true);
        setError(null);
        const classIdNumber = Number.parseInt(classId, 10);
        console.log("Carregando dados para classId:", classIdNumber);

        // Fetch class data
        console.log("Fetchando classe...");
        const classRes = await getClassById(classIdNumber);
        console.log("Classe carregada:", classRes);
        setClassData(classRes);

        // Fetch evaluations
        console.log("Fetchando avaliações...");
        const evalsRes = await getClassEvaluations(classIdNumber, 1, 100);
        console.log("Avaliações carregadas:", evalsRes);
        setEvaluations(evalsRes.data);
      } catch (error: unknown) {
        console.error("Failed to load data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Erro ao carregar dados: ${errorMessage}`);
        toastContext.error(`Erro ao carregar dados: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleWeightChange = (evaluationId: number, value: string) => {
    // Store previous weight if not already stored
    const evaluation = evaluations.find((e) => e.id === evaluationId);
    if (evaluation && !previousWeights.has(evaluationId)) {
      setPreviousWeights((prev) =>
        new Map(prev).set(evaluationId, evaluation.gradeWeight)
      );
    }

    // Update local state immediately for better UX
    const newWeight = Number.parseInt(value) || 0;
    setEvaluations((prev) =>
      prev.map((e) =>
        e.id === evaluationId ? { ...e, gradeWeight: newWeight } : e
      )
    );
  };

  const handleWeightBlur = async (evaluationId: number) => {
    const evaluation = evaluations.find((e) => e.id === evaluationId);
    if (!evaluation) return;

    const newWeight = evaluation.gradeWeight || 0;
    const previousWeight = previousWeights.get(evaluationId) || 0;

    // Validate individual weight
    if (newWeight < 0 || newWeight > 100) {
      toastContext.error("Peso deve estar entre 0 e 100");
      // Revert locally
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === evaluationId ? { ...e, gradeWeight: previousWeight } : e
        )
      );
      setPreviousWeights((prev) => {
        const newMap = new Map(prev);
        newMap.delete(evaluationId);
        return newMap;
      });
      return;
    }

    // Calculate total weight with other evaluations
    const totalOtherWeight = evaluations
      .filter((e) => e.id !== evaluationId)
      .reduce((sum, e) => sum + (e.gradeWeight || 0), 0);

    // Validate total weight
    if (totalOtherWeight + newWeight > 100) {
      toastContext.error(
        `Peso total não pode ultrapassar 100%. Outras avaliações: ${totalOtherWeight}%, ` +
          `definir como ${newWeight}% resultaria em ${
            totalOtherWeight + newWeight
          }%`
      );
      // Revert locally
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === evaluationId ? { ...e, gradeWeight: previousWeight } : e
        )
      );
      setPreviousWeights((prev) => {
        const newMap = new Map(prev);
        newMap.delete(evaluationId);
        return newMap;
      });
      return;
    }

    try {
      setUpdatingId(evaluationId);
      console.log("Atualizando peso para:", evaluationId, newWeight);
      const updatedEval = await updateEvaluation(evaluationId, {
        gradeWeight: newWeight,
      });
      // Update state with server response
      setEvaluations((prev) =>
        prev.map((e) => (e.id === evaluationId ? updatedEval : e))
      );
      toastContext.success("Peso atualizado com sucesso");
      console.log("Peso atualizado com sucesso:", updatedEval);
    } catch (error) {
      console.error("Error updating weight:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar peso";
      toastContext.error(errorMessage);
      // Revert on error
      setEvaluations((prev) =>
        prev.map((e) =>
          e.id === evaluationId ? { ...e, gradeWeight: previousWeight } : e
        )
      );
    } finally {
      setUpdatingId(null);
      setPreviousWeights((prev) => {
        const newMap = new Map(prev);
        newMap.delete(evaluationId);
        return newMap;
      });
    }
  };

  const handleDeleteEvaluation = async (evaluationId: number) => {
    if (
      !globalThis.confirm(
        "Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setDeletingId(evaluationId);
      console.log("Deletando avaliação:", evaluationId);
      await deleteEvaluation(evaluationId);
      // Remove from state
      setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
      toastContext.success("Avaliação deletada com sucesso");
      console.log("Avaliação deletada com sucesso");
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao deletar avaliação";
      toastContext.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classId) return;

    if (!formData.name.trim()) {
      toastContext.error("Nome da avaliação é obrigatório");
      return;
    }

    if (!formData.dueDate) {
      toastContext.error("Data de entrega é obrigatória");
      return;
    }

    const newWeight = formData.gradeWeight || 0;

    // Validate individual weight
    if (newWeight < 0 || newWeight > 100) {
      toastContext.error("Peso da avaliação deve estar entre 0 e 100");
      return;
    }

    // Calculate total weight with existing evaluations
    const totalExistingWeight = evaluations.reduce(
      (sum, e) => sum + (e.gradeWeight || 0),
      0
    );

    // Validate total weight
    if (totalExistingWeight + newWeight > 100) {
      toastContext.error(
        `Peso total não pode ultrapassar 100%. Peso atual: ${totalExistingWeight}%, ` +
          `adicionando ${newWeight}% resultaria em ${
            totalExistingWeight + newWeight
          }%`
      );
      return;
    }

    try {
      setCreatingEval(true);
      const classIdNumber = Number.parseInt(classId, 10);

      console.log("Criando avaliação com dados:", {
        name: formData.name,
        classId: classIdNumber,
        dueDate: formData.dueDate,
        gradeWeight: newWeight,
        status: "OPEN",
      });

      const newEval = await createEvaluation({
        name: formData.name,
        classId: classIdNumber,
        dueDate: formData.dueDate,
        gradeWeight: newWeight,
        status: "OPEN",
      });

      console.log("Avaliação criada com sucesso:", newEval);

      setEvaluations((prev) => [...prev, newEval]);
      toastContext.success("Avaliação criada com sucesso!");

      // Reset form
      setFormData({ name: "", dueDate: "", gradeWeight: 0 });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating evaluation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar avaliação";
      toastContext.error(errorMessage);
    } finally {
      setCreatingEval(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  const totalWeight = evaluations.reduce(
    (sum, e) => sum + (e.gradeWeight || 0),
    0
  );

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
          <h1 className="text-3xl font-bold">
            Configuração de Pesos de Avaliações
          </h1>
          <p className="text-muted-foreground">{classData.name}</p>
        </div>
      </div>

      {/* Weight Status Alert */}
      <EvaluationWeightStatus totalWeight={totalWeight} />

      {/* Evaluations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Avaliações da Turma</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              size="sm"
            >
              {showForm ? "Cancelar" : "+ Nova Avaliação"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Evaluation Form */}
          <EvaluationForm
            isOpen={showForm}
            isLoading={creatingEval}
            formData={formData}
            totalExistingWeight={totalWeight}
            onNameChange={(value) => setFormData({ ...formData, name: value })}
            onDateChange={(value) =>
              setFormData({ ...formData, dueDate: value })
            }
            onWeightChange={(value) =>
              setFormData({
                ...formData,
                gradeWeight: Number.parseInt(value) || 0,
              })
            }
            onSubmit={handleCreateEvaluation}
            onCancel={() => {
              setShowForm(false);
              setFormData({ name: "", dueDate: "", gradeWeight: 0 });
            }}
          />

          {/* Evaluations List */}
          <EvaluationList
            evaluations={evaluations}
            updatingId={updatingId}
            deletingId={deletingId}
            onWeightChange={handleWeightChange}
            onWeightBlur={handleWeightBlur}
            onDelete={handleDeleteEvaluation}
          />
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-900">
          O peso de cada avaliação determina sua contribuição na nota final da
          turma. A soma de todos os pesos deve ser exatamente 100%.
        </p>
      </Alert>
    </div>
  );
}
