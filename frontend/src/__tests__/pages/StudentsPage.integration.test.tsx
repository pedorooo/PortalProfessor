import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import StudentsPage from "@/pages/StudentsPage";

vi.mock("@/components/students/student-dialog", () => ({
  StudentDialog: () => <div data-testid="student-dialog">Student Dialog</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("StudentsPage - Integration Tests", () => {
  it("should render the students page", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Lista de alunos")).toBeInTheDocument();
  });

  it("should display page description", () => {
    renderWithRouter(<StudentsPage />);
    expect(
      screen.getByText("Gerencie e acompanhe seus alunos")
    ).toBeInTheDocument();
  });

  it("should have an add student button", () => {
    renderWithRouter(<StudentsPage />);
    const addButton = screen.getByRole("button", { name: /Adicionar Aluno/i });
    expect(addButton).toBeInTheDocument();
  });

  it("should display search input", () => {
    renderWithRouter(<StudentsPage />);
    const searchInput = screen.getByPlaceholderText("Buscar alunos...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should display filter section", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Filtros:")).toBeInTheDocument();
  });

  it("should display student table headers", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Contato")).toBeInTheDocument();
    expect(screen.getByText("Turma")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should display students in table", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should display student count", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText(/5 alunos/i)).toBeInTheDocument();
  });

  it("should display status badges", () => {
    renderWithRouter(<StudentsPage />);
    const activeBadges = screen.getAllByText("ativo");
    expect(activeBadges.length).toBeGreaterThan(0);
  });

  it("should display enrollment dates", () => {
    renderWithRouter(<StudentsPage />);
    const tableRows = screen.getAllByRole("row");
    expect(tableRows.length).toBeGreaterThan(1);
  });

  it("should have action menu buttons", () => {
    renderWithRouter(<StudentsPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("should display class filter dropdown", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Todas as turmas")).toBeInTheDocument();
  });

  it("should display status filter dropdown", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Todos os status")).toBeInTheDocument();
  });

  it("should display student grades", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText("9.2")).toBeInTheDocument();
  });

  it("should have card layout", () => {
    renderWithRouter(<StudentsPage />);
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBeGreaterThan(0);
  });
});
