import { useParams } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { ListLoading } from "@/components/ui/list-loading";
import { useClassData } from "@/hooks/use-class-data";
import { useEvaluationManagement } from "@/hooks/use-evaluation-management";
import {
  ClassEvaluationConfigHeader,
  ClassEvaluationConfigError,
  ClassEvaluationConfigNotFound,
  EvaluationWeightStatus,
  ClassEvaluationsCard,
} from "./components";

export default function ClassEvaluationConfigPage() {
  const { classId } = useParams<{ classId: string }>();

  const {
    classData,
    loading: classLoading,
    error: classError,
  } = useClassData(classId);

  const {
    evaluations,
    loading: evaluationsLoading,
    error: evaluationsError,
    updatingId,
    deletingId,
    totalWeight,
    handleWeightChange,
    handleWeightBlur,
    handleDeleteEvaluation,
    handleCreateEvaluation,
  } = useEvaluationManagement(classId);

  const loading = classLoading || evaluationsLoading;
  const error = classError || evaluationsError;

  if (loading) {
    return <ListLoading />;
  }

  if (error) {
    return <ClassEvaluationConfigError error={error} />;
  }

  if (!classData) {
    return <ClassEvaluationConfigNotFound />;
  }

  return (
    <div className="space-y-6">
      <ClassEvaluationConfigHeader classId={classId} classData={classData} />

      {}
      <EvaluationWeightStatus totalWeight={totalWeight} />

      {}
      <ClassEvaluationsCard
        classId={classId}
        evaluations={evaluations}
        totalWeight={totalWeight}
        updatingId={updatingId}
        deletingId={deletingId}
        onWeightChange={handleWeightChange}
        onWeightBlur={handleWeightBlur}
        onDeleteEvaluation={handleDeleteEvaluation}
        onCreateEvaluation={handleCreateEvaluation}
      />

      {}
      <Alert className="border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-900">
          O peso de cada avaliação determina sua contribuição na nota final da
          turma. A soma de todos os pesos deve ser exatamente 100%.
        </p>
      </Alert>
    </div>
  );
}
