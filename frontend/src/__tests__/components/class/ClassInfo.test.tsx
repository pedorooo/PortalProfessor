import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassInfo } from "@/components/class/ClassInfo";

describe("ClassInfo", () => {
  const defaultProps = {
    professor: "Dr. Smith",
  };

  it("deve renderizar o card de informações da turma", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("Horário da Aula")).toBeInTheDocument();
    expect(screen.getByText("Professor Responsável")).toBeInTheDocument();
  });

  it("deve renderizar o card de horário", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("Horário da Aula")).toBeInTheDocument();
  });

  it("deve renderizar os dias da semana", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("Seg/Qua/Sex")).toBeInTheDocument();
  });

  it("deve renderizar a hora da aula", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("08:00 - 09:30")).toBeInTheDocument();
  });

  it("deve renderizar o card de professor", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("Professor Responsável")).toBeInTheDocument();
  });

  it("deve renderizar o nome do professor", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
  });

  it("deve renderizar o email do professor", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("professor@email.com")).toBeInTheDocument();
  });

  it("deve renderizar o telefone do professor", () => {
    render(<ClassInfo {...defaultProps} />);

    expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
  });

  it("deve renderizar com professor diferente", () => {
    render(<ClassInfo professor="Profa. Silva" />);

    expect(screen.getByText("Profa. Silva")).toBeInTheDocument();
  });

  it("deve manter os ícones nos cards", () => {
    const { container } = render(<ClassInfo {...defaultProps} />);

    // Verifica se há elementos com role de img (ícones)
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });
});
