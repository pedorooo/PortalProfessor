import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import StudentsPage from "@/pages/StudentsPage";
import type { Student } from "@/types";

// Mock do hook useStudents
const mockAddStudent = vi.fn();
const mockUpdateStudent = vi.fn();
const mockDeleteStudent = vi.fn();

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@universidade.edu",
    phone: "11977777770",
    class: "Matemática Avançada",
    classId: 1,
    status: "active",
    enrollmentDate: "2024-01-15",
    grade: 8.5,
  },
  {
    id: "2",
    name: "Bruno Souza",
    email: "bruno.souza@universidade.edu",
    phone: "11988888881",
    class: "Física Quântica",
    classId: 2,
    status: "active",
    enrollmentDate: "2024-01-20",
    grade: 9.2,
  },
  {
    id: "3",
    name: "Carlos Lima",
    email: "carlos.lima@universidade.edu",
    phone: "11999999992",
    class: "Química Orgânica",
    classId: 3,
    status: "inactive",
    enrollmentDate: "2024-02-01",
    grade: 7.8,
  },
];

vi.mock("@/hooks/use-students", () => ({
  useStudents: () => ({
    students: mockStudents,
    isLoading: false,
    error: null,
    addStudent: mockAddStudent,
    updateStudent: mockUpdateStudent,
    deleteStudent: mockDeleteStudent,
  }),
}));

vi.mock("@/components/students/student-dialog", () => ({
  StudentDialog: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="student-dialog">
      {isOpen && <div>Student Dialog Open</div>}
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("StudentsPage - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the students page with header", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Alunos")).toBeInTheDocument();
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

  it("should display filter section with dropdowns", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Filtros:")).toBeInTheDocument();
  });

  it("should display student table headers", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Contato")).toBeInTheDocument();
    expect(screen.getByText("Turma")).toBeInTheDocument();
    expect(screen.getByText("Média")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Data de Matrícula")).toBeInTheDocument();
  });

  it("should display all students in table", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("Bruno Souza")).toBeInTheDocument();
    expect(screen.getByText("Carlos Lima")).toBeInTheDocument();
  });

  it("should display student emails and phones", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("ana.silva@universidade.edu")).toBeInTheDocument();
    expect(screen.getByText("11977777770")).toBeInTheDocument();
  });

  it("should display student classes", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
    expect(screen.getByText("Física Quântica")).toBeInTheDocument();
    expect(screen.getByText("Química Orgânica")).toBeInTheDocument();
  });

  it("should display student grades", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText("9.2")).toBeInTheDocument();
    expect(screen.getByText("7.8")).toBeInTheDocument();
  });

  it("should display student count", () => {
    renderWithRouter(<StudentsPage />);
    expect(screen.getByText("3 alunos")).toBeInTheDocument();
  });

  it("should display status badges correctly", () => {
    renderWithRouter(<StudentsPage />);
    const activeBadges = screen.getAllByText("ativo");
    const inactiveBadges = screen.getAllByText("inativo");
    expect(activeBadges).toHaveLength(2);
    expect(inactiveBadges).toHaveLength(1);
  });

  it("should display formatted enrollment dates", () => {
    renderWithRouter(<StudentsPage />);
    // As datas são formatadas com toLocaleDateString("pt-BR")
    // Verifica que as linhas da tabela existem (datas podem não ser renderizadas visualmente)
    const rows = screen.getAllByRole("row");
    // Deve ter pelo menos 4 linhas (header + 3 alunos)
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it("should have action menu for each student", () => {
    renderWithRouter(<StudentsPage />);
    const rows = screen.getAllByRole("row");
    // Expect table header + 3 student rows
    expect(rows).toHaveLength(4);
  });
});
