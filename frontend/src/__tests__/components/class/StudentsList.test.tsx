import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudentsList } from "@/components/class/StudentsList";
import type { ClassStudent } from "@/hooks/use-class-students";

describe("StudentsList", () => {
  const mockStudents: ClassStudent[] = [
    {
      id: 1,
      userId: 101,
      name: "João Silva",
      email: "joao@university.edu",
      phone: "+55 (11) 98765-4321",
      status: "ACTIVE",
      enrolledAt: "2024-01-15",
      grade: 8.5,
      attendance: 95,
      performance: 92,
    },
    {
      id: 2,
      userId: 102,
      name: "Maria Santos",
      email: "maria@university.edu",
      phone: "+55 (11) 98765-4322",
      status: "ACTIVE",
      enrolledAt: "2024-01-15",
      grade: 7.2,
      attendance: 85,
      performance: 78,
    },
    {
      id: 3,
      userId: 103,
      name: "Pedro Oliveira",
      email: "pedro@university.edu",
      phone: "+55 (11) 98765-4323",
      status: "ACTIVE",
      enrolledAt: "2024-01-15",
      grade: 6.5,
      attendance: 70,
      performance: 65,
    },
  ];

  it("deve renderizar lista vazia quando não há alunos", () => {
    render(<StudentsList students={[]} />);

    expect(screen.getByText(/Nenhum aluno/i)).toBeInTheDocument();
  });

  it("deve renderizar estado de carregamento", () => {
    render(<StudentsList students={[]} isLoading={true} />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("deve renderizar todos os alunos", () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Pedro Oliveira")).toBeInTheDocument();
  });

  it("deve renderizar email dos alunos", () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText("joao@university.edu")).toBeInTheDocument();
    expect(screen.getByText("maria@university.edu")).toBeInTheDocument();
    expect(screen.getByText("pedro@university.edu")).toBeInTheDocument();
  });

  it("deve renderizar telefone dos alunos", () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText("+55 (11) 98765-4321")).toBeInTheDocument();
    expect(screen.getByText("+55 (11) 98765-4322")).toBeInTheDocument();
    expect(screen.getByText("+55 (11) 98765-4323")).toBeInTheDocument();
  });

  it("deve renderizar nota dos alunos", () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText("7.2")).toBeInTheDocument();
    expect(screen.getByText("6.5")).toBeInTheDocument();
  });

  it("deve renderizar frequência dos alunos", () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("deve renderizar com um único aluno", () => {
    render(<StudentsList students={[mockStudents[0]]} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
  });

  it("deve aplicar classes de estilo corretas aos cards", () => {
    render(<StudentsList students={mockStudents} />);

    for (const student of mockStudents) {
      const nameElement = screen.getByText(student.name);
      expect(nameElement).toBeInTheDocument();

      const cardDiv = nameElement.closest("div.flex");
      expect(cardDiv).toHaveClass("items-start");
      expect(cardDiv).toHaveClass("justify-between");
    }
  });

  it("deve renderizar com números diferentes de alunos", () => {
    const manyStudents: ClassStudent[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      userId: 200 + i,
      name: `Aluno ${i + 1}`,
      email: `aluno${i + 1}@university.edu`,
      phone: `+55 (11) 9876${i}-${5432 + i}`,
      status: "ACTIVE",
      enrolledAt: "2024-01-15",
      grade: 7 + Math.random(),
      attendance: 80 + Math.random() * 20,
      performance: 70 + Math.random() * 30,
    }));

    render(<StudentsList students={manyStudents} />);

    expect(screen.getByText("Aluno 1")).toBeInTheDocument();
    expect(screen.getByText("Aluno 10")).toBeInTheDocument();
  });
});
