import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ClassDetailPage from "@/pages/ClassDetailPage";

// Mock dos hooks
vi.mock("@/hooks/use-classes", () => ({
  useClasses: () => ({
    classes: [
      {
        id: "class-1",
        name: "Matemática Avançada",
        subject: "Matemática",
        professor: "Dr. Smith",
        description: "Tópicos avançados em álgebra e cálculo",
        maxCapacity: 40,
        studentCount: 30,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/use-class-students", () => ({
  useClassStudents: () => ({
    students: [
      {
        id: "1",
        name: "Ana Silva",
        email: "ana@university.edu",
        phone: "(11) 98765-4321",
        grade: 8.5,
        attendance: 95,
        performance: 92,
      },
      {
        id: "2",
        name: "Daniel Costa",
        email: "daniel@university.edu",
        phone: "(11) 98765-4322",
        grade: 7.5,
        attendance: 85,
        performance: 78,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/use-class-lessons", () => ({
  useClassLessons: () => ({
    lessons: [
      {
        id: "1",
        topic: "Álgebra Linear",
        date: "1 de novembro",
        status: "Concluída",
        duration: "90 minutos",
      },
      {
        id: "2",
        topic: "Cálculo Diferencial",
        date: "3 de novembro",
        status: "Em Progresso",
        duration: "90 minutos",
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/use-class-evaluations", () => ({
  useClassEvaluations: () => ({
    evaluations: [
      {
        id: "eval1",
        name: "Prova 1",
        dueDate: "15 de outubro",
        status: "Corrigida",
        submitted: 30,
        total: 30,
        weight: 50,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/constants/subjects", () => ({
  SUBJECT_COLORS: {
    Matemática: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard/classes/:classId" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe("ClassDetailPage", () => {
  beforeEach(() => {
    globalThis.history.pushState({}, "test page", "/dashboard/classes/class-1");
  });

  it("deve renderizar o cabeçalho da turma", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
    });
  });

  it("deve renderizar o card de estatísticas", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Total de Alunos")).toBeInTheDocument();
    });
  });

  it("deve renderizar as abas de conteúdo", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alunos")).toBeInTheDocument();
      expect(screen.getByText("Aulas")).toBeInTheDocument();
      expect(screen.getByText("Avaliações")).toBeInTheDocument();
    });
  });

  it("deve renderizar os dados da turma corretamente", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();
      expect(
        screen.getByText("Tópicos avançados em álgebra e cálculo")
      ).toBeInTheDocument();
      expect(screen.getByText("Prof. Dr. Smith")).toBeInTheDocument();
    });
  });

  it("deve renderizar os alunos na aba de alunos", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    });
  });

  it("deve calcular corretamente a taxa de ocupação", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      // 30/40 = 75%
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  it("deve renderizar o botão de voltar", async () => {
    renderWithRouter(<ClassDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Voltar/i })
      ).toBeInTheDocument();
    });
  });
});
