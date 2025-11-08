import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassStats } from "@/components/class/ClassStats";

describe("ClassStats", () => {
  const defaultProps = {
    studentCount: 28,
    maxCapacity: 30,
    enrollmentPercentage: 93.33,
    barColor: "bg-blue-500",
  };

  it("deve renderizar todos os 4 cards de estatísticas", () => {
    render(<ClassStats {...defaultProps} />);

    expect(screen.getByText("Total de Alunos")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Ocupação")).toBeInTheDocument();
    expect(screen.getByText("Média da Turma")).toBeInTheDocument();
    expect(screen.getByText("Frequência Média")).toBeInTheDocument();
  });

  it("deve exibir a contagem correta de alunos", () => {
    render(<ClassStats {...defaultProps} />);

    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Capacidade: 30")).toBeInTheDocument();
  });

  it("deve exibir a taxa de ocupação corretamente arredondada", () => {
    render(<ClassStats {...defaultProps} />);

    expect(screen.getByText("93%")).toBeInTheDocument();
  });

  it("deve exibir a média da turma como 7.8", () => {
    render(<ClassStats {...defaultProps} />);

    const mediaElement = screen.getByText("7.8");
    expect(mediaElement).toHaveClass("text-orange-500");
  });

  it("deve exibir a frequência média como 92%", () => {
    render(<ClassStats {...defaultProps} />);

    const frequenciaElement = screen.getByText("92%");
    expect(frequenciaElement).toHaveClass("text-green-600");
  });

  it("deve renderizar a barra de progresso com a cor correta", () => {
    const { container } = render(<ClassStats {...defaultProps} />);

    const progressBar = container.querySelector(`.${defaultProps.barColor}`);
    expect(progressBar).toBeInTheDocument();
  });

  it("deve calcular a largura da barra de progresso corretamente", () => {
    const { container } = render(
      <ClassStats {...defaultProps} enrollmentPercentage={50} />
    );

    const progressBar = container.querySelector("[style*='width: 50%']");
    expect(progressBar).toBeInTheDocument();
  });

  it("deve exibir corretamente com diferentes percentagens", () => {
    const { rerender } = render(
      <ClassStats {...defaultProps} enrollmentPercentage={100} />
    );

    expect(screen.getByText("100%")).toBeInTheDocument();

    rerender(<ClassStats {...defaultProps} enrollmentPercentage={0} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
