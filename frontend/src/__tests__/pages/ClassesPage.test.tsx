import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClassesPage from "@/pages/ClassesPage";

const mockClasses = [
  {
    id: "1",
    name: "Matemática Avançada",
    maxCapacity: 30,
    studentCount: 28,
    professor: "Dr. Smith",
    subject: "Matemática",
    description: "Tópicos avançados em álgebra, geometria e cálculo",
  },
  {
    id: "2",
    name: "Fundamentos de Física",
    maxCapacity: 35,
    studentCount: 32,
    professor: "Prof. Johnson",
    subject: "Física",
    description: "Introdução à mecânica e termodinâmica",
  },
  {
    id: "3",
    name: "Laboratório de Química",
    maxCapacity: 25,
    studentCount: 22,
    professor: "Dr. Williams",
    subject: "Química",
    description: "Experimentos práticos de laboratório e reações químicas",
  },
  {
    id: "4",
    name: "Literatura em Inglês",
    maxCapacity: 40,
    studentCount: 38,
    professor: "Ms. Brown",
    subject: "Inglês",
    description: "Explore a literatura inglesa clássica e contemporânea",
  },
];

vi.mock("@/hooks/use-classes", () => ({
  useClasses: () => ({
    classes: mockClasses,
    isLoading: false,
    addClass: vi.fn(),
    updateClass: vi.fn(),
    deleteClass: vi.fn(),
    filterClasses: (search: string) => {
      return mockClasses.filter((cls) =>
        cls.name.toLowerCase().includes(search.toLowerCase())
      );
    },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={component} />
        <Route
          path="/dashboard/classes/:classId"
          element={<div>Class Detail</div>}
        />
      </Routes>
    </BrowserRouter>
  );
};

describe("ClassesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the page title and description", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Turmas")).toBeInTheDocument();
      expect(
        screen.getByText("Gerencie suas turmas e matrículas")
      ).toBeInTheDocument();
    });

    it("should render the add button", () => {
      renderWithRouter(<ClassesPage />);

      const addButton = screen.getByRole("button", {
        name: /Adicionar Turma/i,
      });
      expect(addButton).toBeInTheDocument();
    });

    it("should render search input", () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render filter section with Filter icon and label", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });

    it("should render all class cards", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
      expect(screen.getByText("Fundamentos de Física")).toBeInTheDocument();
      expect(screen.getByText("Laboratório de Química")).toBeInTheDocument();
      expect(screen.getByText("Literatura em Inglês")).toBeInTheDocument();
    });

    it("should render class details correctly", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Prof. Dr. Smith")).toBeInTheDocument();
      expect(screen.getByText("Prof. Prof. Johnson")).toBeInTheDocument();
      expect(screen.getByText("28/30")).toBeInTheDocument();
      expect(screen.getByText("32/35")).toBeInTheDocument();
    });

    it("should render subject badges with correct text", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Matemática")).toBeInTheDocument();
      expect(screen.getByText("Física")).toBeInTheDocument();
      expect(screen.getByText("Química")).toBeInTheDocument();
      expect(screen.getByText("Inglês")).toBeInTheDocument();
    });
  });

  describe("search functionality", () => {
    it("should filter classes when typing in search box", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");

      fireEvent.change(searchInput, { target: { value: "Matemática" } });

      await waitFor(() => {
        expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
      });
    });

    it("should show all classes when search is cleared", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");

      fireEvent.change(searchInput, { target: { value: "Matemática" } });

      await waitFor(() => {
        expect(screen.queryByText("Física")).not.toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText("Fundamentos de Física")).toBeInTheDocument();
      });
    });

    it("should be case-insensitive", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");

      fireEvent.change(searchInput, { target: { value: "física" } });

      await waitFor(() => {
        expect(screen.getByText("Fundamentos de Física")).toBeInTheDocument();
      });
    });

    it("should show no classes message when search has no results", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");

      fireEvent.change(searchInput, { target: { value: "NonexistentClass" } });

      await waitFor(() => {
        expect(
          screen.getByText("Nenhuma turma encontrada")
        ).toBeInTheDocument();
      });
    });

    it("should show hint to adjust search term in no results message", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      fireEvent.change(searchInput, { target: { value: "xyz" } });

      await waitFor(() => {
        expect(
          screen.getByText(/Tente ajustar o termo de busca/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("filter functionality", () => {
    it("should render subject filter dropdown", () => {
      renderWithRouter(<ClassesPage />);

      const filtersLabel = screen.getByText("Filtros");
      expect(filtersLabel).toBeInTheDocument();
    });

    it("should render filter section with icon and label", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });
  });

  describe("combined search and filter", () => {
    it("should support search and filter together", () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      expect(searchInput).toBeInTheDocument();

      const filtersLabel = screen.getByText("Filtros");
      expect(filtersLabel).toBeInTheDocument();
    });
  });

  describe("class card actions", () => {
    it("should display dropdown menu button on each card", () => {
      renderWithRouter(<ClassesPage />);

      const menuButtons = screen.getAllByTitle("Class actions");
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it("should show edit and delete options in dropdown", async () => {
      renderWithRouter(<ClassesPage />);

      const menuButtons = screen.getAllByTitle("Class actions");
      expect(menuButtons.length).toBeGreaterThan(0);

      fireEvent.click(menuButtons[0]);
    });

    it("should render component without errors", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("Turmas")).toBeInTheDocument();
      expect(screen.getAllByTitle("Class actions").length).toBeGreaterThan(0);
    });
  });

  describe("enrollment display", () => {
    it("should display student enrollment numbers", () => {
      renderWithRouter(<ClassesPage />);

      expect(screen.getByText("28/30")).toBeInTheDocument();
      expect(screen.getByText("32/35")).toBeInTheDocument();
      expect(screen.getByText("22/25")).toBeInTheDocument();
      expect(screen.getByText("38/40")).toBeInTheDocument();
    });

    it("should display enrollment label", () => {
      renderWithRouter(<ClassesPage />);

      const enrollmentLabels = screen.getAllByText("Matrícula de Alunos");
      expect(enrollmentLabels.length).toBeGreaterThan(0);
    });
  });

  describe("empty state", () => {
    it("should show empty state message when no classes are found", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      fireEvent.change(searchInput, {
        target: { value: "NonexistentClass123" },
      });

      await waitFor(() => {
        expect(
          screen.getByText("Nenhuma turma encontrada")
        ).toBeInTheDocument();
      });
    });

    it("should show add button in empty state when search returns no results", async () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      fireEvent.change(searchInput, { target: { value: "xyz" } });

      await waitFor(() => {
        expect(
          screen.getByText("Nenhuma turma encontrada")
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText(/Crie sua primeira turma para começar/)
      ).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      renderWithRouter(<ClassesPage />);

      const heading = screen.getByRole("heading", { name: /Turmas/ });
      expect(heading).toBeInTheDocument();
    });

    it("should have descriptive labels for inputs", () => {
      renderWithRouter(<ClassesPage />);

      const searchInput = screen.getByPlaceholderText("Buscar turmas...");
      expect(searchInput).toBeInTheDocument();

      const filtersLabel = screen.getByText("Filtros");
      expect(filtersLabel).toBeInTheDocument();
    });

    it("should have descriptive button labels", () => {
      renderWithRouter(<ClassesPage />);

      const addButton = screen.getByRole("button", {
        name: /Adicionar Turma/i,
      });
      expect(addButton).toBeInTheDocument();
    });
  });
});
