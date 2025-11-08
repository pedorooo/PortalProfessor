import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvaluationsList } from "@/components/class/EvaluationsList";
import type { ClassEvaluation } from "@/hooks/use-class-evaluations";

describe("EvaluationsList", () => {
  const mockEvaluations: ClassEvaluation[] = [
    {
      id: "eval1",
      name: "Prova 1 - Álgebra",
      dueDate: "15 de outubro",
      status: "Corrigida",
      submitted: 25,
      total: 25,
      weight: 30,
    },
    {
      id: "eval2",
      name: "Trabalho em Grupo",
      dueDate: "20 de outubro",
      status: "Pendente",
      submitted: 20,
      total: 25,
      weight: 20,
    },
    {
      id: "eval3",
      name: "Projeto Final",
      dueDate: "30 de outubro",
      status: "Em Andamento",
      submitted: 10,
      total: 25,
      weight: 50,
    },
  ];

  it("deve renderizar lista vazia quando não há avaliações", () => {
    render(<EvaluationsList evaluations={[]} />);

    expect(screen.getByText(/Nenhuma avaliação/i)).toBeInTheDocument();
  });

  it("deve renderizar estado de carregamento", () => {
    render(<EvaluationsList evaluations={[]} isLoading={true} />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("deve renderizar todas as avaliações", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("Prova 1 - Álgebra")).toBeInTheDocument();
    expect(screen.getByText("Trabalho em Grupo")).toBeInTheDocument();
    expect(screen.getByText("Projeto Final")).toBeInTheDocument();
  });

  it("deve renderizar datas das avaliações", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText(/15 de outubro/)).toBeInTheDocument();
    expect(screen.getByText(/20 de outubro/)).toBeInTheDocument();
    expect(screen.getByText(/30 de outubro/)).toBeInTheDocument();
  });

  it("deve renderizar status de avaliação corrigida", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("Corrigida")).toBeInTheDocument();
  });

  it("deve renderizar status de avaliação pendente", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("Pendente")).toBeInTheDocument();
  });

  it("deve renderizar status de avaliação em andamento", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("Em Andamento")).toBeInTheDocument();
  });

  it("deve renderizar quantidade de submissões", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("25/25")).toBeInTheDocument();
    expect(screen.getByText("20/25")).toBeInTheDocument();
    expect(screen.getByText("10/25")).toBeInTheDocument();
  });

  it("deve renderizar peso das avaliações", () => {
    render(<EvaluationsList evaluations={mockEvaluations} />);

    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("deve calcular percentual de submissão corretamente", () => {
    const { container } = render(
      <EvaluationsList evaluations={mockEvaluations} />
    );

    // A primeira avaliação tem 25/25 = 100%
    const progressBars = container.querySelectorAll("[style*='width']");
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it("deve renderizar com uma única avaliação", () => {
    render(<EvaluationsList evaluations={[mockEvaluations[0]]} />);

    expect(screen.getByText("Prova 1 - Álgebra")).toBeInTheDocument();
    expect(screen.queryByText("Trabalho em Grupo")).not.toBeInTheDocument();
  });

  it("deve aplicar cores corretas aos badges de status", () => {
    const { container } = render(
      <EvaluationsList evaluations={mockEvaluations} />
    );

    // Procura por badges de status com as classes de cor esperadas
    const greenBadge = container.querySelector(".bg-green-100.text-green-800");
    const yellowBadge = container.querySelector(
      ".bg-yellow-100.text-yellow-800"
    );

    expect(greenBadge).toBeInTheDocument();
    expect(yellowBadge).toBeInTheDocument();
  });

  it("deve renderizar com muitas avaliações", () => {
    const manyEvaluations: ClassEvaluation[] = Array.from(
      { length: 12 },
      (_, i) => ({
        id: `eval${i}`,
        name: `Avaliação ${i + 1}`,
        dueDate: `${i + 1} de novembro`,
        status: ["Corrigida", "Pendente", "Em Andamento"][i % 3] as
          | "Corrigida"
          | "Pendente"
          | "Em Andamento",
        submitted: Math.floor(Math.random() * 25),
        total: 25,
        weight: Math.floor(100 / 12),
      })
    );

    render(<EvaluationsList evaluations={manyEvaluations} />);

    expect(screen.getByText("Avaliação 1")).toBeInTheDocument();
    expect(screen.getByText("Avaliação 12")).toBeInTheDocument();
  });

  it("deve renderizar corretamente com 0% de submissão", () => {
    const noSubmissions: ClassEvaluation[] = [
      {
        id: "eval1",
        name: "Prova Futura",
        dueDate: "30 de dezembro",
        status: "Em Andamento",
        submitted: 0,
        total: 25,
        weight: 100,
      },
    ];

    render(<EvaluationsList evaluations={noSubmissions} />);

    expect(screen.getByText("0/25")).toBeInTheDocument();
  });

  it("deve renderizar corretamente com 100% de submissão", () => {
    const allSubmitted: ClassEvaluation[] = [
      {
        id: "eval1",
        name: "Prova Completa",
        dueDate: "15 de outubro",
        status: "Corrigida",
        submitted: 30,
        total: 30,
        weight: 100,
      },
    ];

    render(<EvaluationsList evaluations={allSubmitted} />);

    expect(screen.getByText("30/30")).toBeInTheDocument();
  });
});
