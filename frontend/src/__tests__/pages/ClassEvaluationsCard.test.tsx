import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClassEvaluationsCard } from "@/pages/components/ClassEvaluationsCard";
import type { ClassEvaluation } from "@/lib/api-client";

// Mock the toast context
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/context/ToastContext", () => ({
  useToast: () => mockToast,
}));

// Mock the EvaluationForm component
vi.mock("@/pages/components/EvaluationForm", () => ({
  EvaluationForm: ({
    isOpen,
    isLoading,
    formData,
    totalExistingWeight,
    onNameChange,
    onDateChange,
    onWeightChange,
    onSubmit,
    onCancel,
  }: any) => (
    <div data-testid="evaluation-form">
      <div>Form is {isOpen ? "open" : "closed"}</div>
      <div>Loading: {isLoading ? "true" : "false"}</div>
      <div>Name: {formData.name}</div>
      <div>Date: {formData.dueDate}</div>
      <div>Weight: {formData.gradeWeight}</div>
      <div>Total Existing Weight: {totalExistingWeight}</div>
      <button onClick={() => onNameChange("Test Evaluation")}>
        Change Name
      </button>
      <button onClick={() => onDateChange("2025-12-01")}>Change Date</button>
      <button onClick={() => onWeightChange("25")}>Change Weight</button>
      <button onClick={onSubmit}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock the EvaluationList component
vi.mock("@/pages/components/EvaluationList", () => ({
  EvaluationList: ({ evaluations, updatingId, deletingId }: any) => (
    <div data-testid="evaluation-list">
      <div>Evaluations count: {evaluations.length}</div>
      <div>Updating ID: {updatingId || "none"}</div>
      <div>Deleting ID: {deletingId || "none"}</div>
      {evaluations.map((evaluation: ClassEvaluation) => (
        <div key={evaluation.id} data-testid={`evaluation-${evaluation.id}`}>
          {evaluation.name} - {evaluation.gradeWeight}%
        </div>
      ))}
    </div>
  ),
}));

describe("ClassEvaluationsCard", () => {
  const mockProps = {
    classId: "class-1",
    evaluations: [
      {
        id: 1,
        name: "Prova 1",
        dueDate: "2025-12-01",
        status: "OPEN",
        gradeWeight: 30,
      },
      {
        id: 2,
        name: "Trabalho",
        dueDate: "2025-12-15",
        status: "OPEN",
        gradeWeight: 20,
      },
    ] as ClassEvaluation[],
    totalWeight: 50,
    updatingId: null,
    deletingId: null,
    onWeightChange: vi.fn(),
    onWeightBlur: vi.fn(),
    onDeleteEvaluation: vi.fn(),
    onCreateEvaluation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o card com o título correto", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    expect(screen.getByText("Avaliações da Turma")).toBeInTheDocument();
  });

  it("deve renderizar o botão para nova avaliação", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    expect(screen.getByText("+ Nova Avaliação")).toBeInTheDocument();
  });

  it("deve mostrar o formulário quando o botão é clicado", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    const button = screen.getByText("+ Nova Avaliação");
    fireEvent.click(button);

    expect(screen.getByText("Form is open")).toBeInTheDocument();
  });

  it("deve mostrar 'Cancelar' quando o formulário está aberto", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    const button = screen.getByText("+ Nova Avaliação");
    fireEvent.click(button);

    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("deve fechar o formulário quando cancelar é clicado", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Cancelar
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.getByText("Form is closed")).toBeInTheDocument();
    expect(screen.getByText("+ Nova Avaliação")).toBeInTheDocument();
  });

  it("deve renderizar a lista de avaliações", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    expect(screen.getByTestId("evaluation-list")).toBeInTheDocument();
    expect(screen.getByText("Evaluations count: 2")).toBeInTheDocument();
    expect(screen.getByTestId("evaluation-1")).toBeInTheDocument();
    expect(screen.getByTestId("evaluation-2")).toBeInTheDocument();
  });

  it("deve passar as props corretas para EvaluationList", () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    expect(screen.getByText("Updating ID: none")).toBeInTheDocument();
    expect(screen.getByText("Deleting ID: none")).toBeInTheDocument();
  });

  it("deve mostrar estado de atualização", () => {
    const propsWithUpdating = {
      ...mockProps,
      updatingId: 1,
    };

    render(<ClassEvaluationsCard {...propsWithUpdating} />);

    expect(screen.getByText("Updating ID: 1")).toBeInTheDocument();
  });

  it("deve mostrar estado de exclusão", () => {
    const propsWithDeleting = {
      ...mockProps,
      deletingId: 2,
    };

    render(<ClassEvaluationsCard {...propsWithDeleting} />);

    expect(screen.getByText("Deleting ID: 2")).toBeInTheDocument();
  });

  it("deve chamar onCreateEvaluation quando o formulário é submetido com dados válidos", async () => {
    const mockCreateEvaluation = vi.fn().mockResolvedValue({ id: 3 });
    const propsWithMock = {
      ...mockProps,
      onCreateEvaluation: mockCreateEvaluation,
    };

    render(<ClassEvaluationsCard {...propsWithMock} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Preencher formulário
    fireEvent.click(screen.getByText("Change Name"));
    fireEvent.click(screen.getByText("Change Date"));
    fireEvent.click(screen.getByText("Change Weight"));

    // Submeter
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockCreateEvaluation).toHaveBeenCalledWith({
        name: "Test Evaluation",
        classId: 1,
        dueDate: "2025-12-01",
        gradeWeight: 25,
        status: "OPEN",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Avaliação criada com sucesso!"
    );
  });

  it("deve mostrar erro quando o nome da avaliação está vazio", async () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Tentar submeter sem nome
    fireEvent.click(screen.getByText("Submit"));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Nome da avaliação é obrigatório"
    );
  });

  it("deve mostrar erro quando a data está vazia", async () => {
    render(<ClassEvaluationsCard {...mockProps} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Preencher nome mas não data
    fireEvent.click(screen.getByText("Change Name"));

    // Tentar submeter
    fireEvent.click(screen.getByText("Submit"));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Data de entrega é obrigatória"
    );
  });

  it("deve mostrar erro quando onCreateEvaluation falha", async () => {
    const mockCreateEvaluation = vi
      .fn()
      .mockRejectedValue(new Error("API Error"));
    const propsWithMock = {
      ...mockProps,
      onCreateEvaluation: mockCreateEvaluation,
    };

    render(<ClassEvaluationsCard {...propsWithMock} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Preencher formulário
    fireEvent.click(screen.getByText("Change Name"));
    fireEvent.click(screen.getByText("Change Date"));
    fireEvent.click(screen.getByText("Change Weight"));

    // Submeter
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao criar avaliação");
    });
  });

  it("deve mostrar estado de carregamento durante criação", async () => {
    const mockCreateEvaluation = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
    const propsWithMock = {
      ...mockProps,
      onCreateEvaluation: mockCreateEvaluation,
    };

    render(<ClassEvaluationsCard {...propsWithMock} />);

    // Abrir formulário
    const newEvalButton = screen.getByText("+ Nova Avaliação");
    fireEvent.click(newEvalButton);

    // Preencher formulário
    fireEvent.click(screen.getByText("Change Name"));
    fireEvent.click(screen.getByText("Change Date"));
    fireEvent.click(screen.getByText("Change Weight"));

    // Submeter
    fireEvent.click(screen.getByText("Submit"));

    // Verificar estado de carregamento
    expect(screen.getByText("Loading: true")).toBeInTheDocument();

    // Aguardar conclusão
    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });
  });
});
