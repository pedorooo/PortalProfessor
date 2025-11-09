import { useState, useCallback } from "react";

export interface EvaluationFormData {
  name: string;
  dueDate: string;
  gradeWeight: number;
}

export function useEvaluationForm() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EvaluationFormData>({
    name: "",
    dueDate: "",
    gradeWeight: 0,
  });
  const [creatingEval, setCreatingEval] = useState(false);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setFormData({ name: "", dueDate: "", gradeWeight: 0 });
  }, []);

  const updateFormData = useCallback((updates: Partial<EvaluationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ name: "", dueDate: "", gradeWeight: 0 });
  }, []);

  const setCreating = useCallback((creating: boolean) => {
    setCreatingEval(creating);
  }, []);

  return {
    showForm,
    formData,
    creatingEval,
    openForm,
    closeForm,
    updateFormData,
    resetForm,
    setCreating,
  };
}
