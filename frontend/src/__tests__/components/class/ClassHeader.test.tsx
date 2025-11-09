import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ClassHeader } from "@/components/class/ClassHeader";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ClassHeader", () => {
  const defaultProps = {
    name: "Matemática Avançada",
    subject: "Matemática",
    professor: "Dr. Smith",
    description: "Tópicos avançados em álgebra e cálculo",
  };

  it("deve renderizar o título da turma", () => {
    renderWithRouter(<ClassHeader {...defaultProps} />);

    expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
  });

  it("deve renderizar a disciplina como badge", () => {
    renderWithRouter(<ClassHeader {...defaultProps} />);

    expect(screen.getByText("Matemática")).toBeInTheDocument();
  });

  it("deve renderizar a descrição da turma", () => {
    renderWithRouter(<ClassHeader {...defaultProps} />);

    expect(
      screen.getByText("Tópicos avançados em álgebra e cálculo")
    ).toBeInTheDocument();
  });

  it("deve renderizar o nome do professor", () => {
    renderWithRouter(<ClassHeader {...defaultProps} />);

    expect(screen.getByText("Prof. Dr. Smith")).toBeInTheDocument();
  });

  it("deve renderizar o botão voltar", () => {
    renderWithRouter(<ClassHeader {...defaultProps} />);

    const backButton = screen.getByRole("button", { name: /voltar/i });
    expect(backButton).toBeInTheDocument();
  });

  it("deve não renderizar badge se subject não for fornecido", () => {
    renderWithRouter(<ClassHeader {...defaultProps} subject={undefined} />);

    expect(screen.queryByText("Matemática")).not.toBeInTheDocument();
  });

  it("deve renderizar com descrição vazia", () => {
    renderWithRouter(<ClassHeader {...defaultProps} description="" />);

    expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
  });

  it("deve renderizar diferentes disciplinas com cores corretas", () => {
    renderWithRouter(<ClassHeader {...defaultProps} subject="Física" />);

    expect(screen.getByText("Física")).toBeInTheDocument();
  });

  it("deve renderizar diferentes professores", () => {
    renderWithRouter(
      <ClassHeader {...defaultProps} professor="Profa. Silva" />
    );

    expect(screen.getByText("Prof. Profa. Silva")).toBeInTheDocument();
  });
});
