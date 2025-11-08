import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonsList } from "@/components/class/LessonsList";
import type { ClassLesson } from "@/hooks/use-class-lessons";

describe("LessonsList", () => {
  const mockLessons: ClassLesson[] = [
    {
      id: "1",
      topic: "Introdução à Álgebra Linear",
      date: "1 de novembro",
      status: "Concluída",
      duration: "90 minutos",
      content: "Conceitos fundamentais de álgebra linear",
    },
    {
      id: "2",
      topic: "Sistemas de Equações Lineares",
      date: "3 de novembro",
      status: "Em Progresso",
      duration: "90 minutos",
      content: "Resolução de sistemas lineares",
    },
    {
      id: "3",
      topic: "Transformações Lineares",
      date: "5 de novembro",
      status: "Programada",
      duration: "90 minutos",
      content: "Mapeamento linear entre espaços vetoriais",
    },
  ];

  it("deve renderizar lista vazia quando não há aulas", () => {
    render(<LessonsList lessons={[]} />);

    expect(screen.getByText(/Nenhuma aula/i)).toBeInTheDocument();
  });

  it("deve renderizar estado de carregamento", () => {
    render(<LessonsList lessons={[]} isLoading={true} />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("deve renderizar todas as aulas", () => {
    render(<LessonsList lessons={mockLessons} />);

    expect(screen.getByText("Introdução à Álgebra Linear")).toBeInTheDocument();
    expect(
      screen.getByText("Sistemas de Equações Lineares")
    ).toBeInTheDocument();
    expect(screen.getByText("Transformações Lineares")).toBeInTheDocument();
  });

  it("deve renderizar datas das aulas", () => {
    render(<LessonsList lessons={mockLessons} />);

    expect(screen.getByText("1 de novembro")).toBeInTheDocument();
    expect(screen.getByText("3 de novembro")).toBeInTheDocument();
    expect(screen.getByText("5 de novembro")).toBeInTheDocument();
  });

  it("deve renderizar status de aula concluída", () => {
    render(<LessonsList lessons={mockLessons} />);

    expect(screen.getByText("Concluída")).toBeInTheDocument();
  });

  it("deve renderizar status de aula em progresso", () => {
    render(<LessonsList lessons={mockLessons} />);

    const inProgressBadge = screen.getByText("Em Progresso");
    expect(inProgressBadge).toBeInTheDocument();
  });

  it("deve renderizar status de aula programada", () => {
    render(<LessonsList lessons={mockLessons} />);

    expect(screen.getByText("Programada")).toBeInTheDocument();
  });

  it("deve aplicar cores corretas aos badges de status", () => {
    const { container } = render(<LessonsList lessons={mockLessons} />);

    // Verifica se há badges com classes de cor para cada status
    const greenBadge = container.querySelector(".bg-green-100.text-green-800");
    const blueBadge = container.querySelector(".bg-blue-100.text-blue-800");
    const grayBadge = container.querySelector(".bg-gray-100.text-gray-800");

    expect(greenBadge).toBeInTheDocument();
    expect(blueBadge).toBeInTheDocument();
    expect(grayBadge).toBeInTheDocument();
  });

  it("deve renderizar com uma única aula", () => {
    render(<LessonsList lessons={[mockLessons[0]]} />);

    expect(screen.getByText("Introdução à Álgebra Linear")).toBeInTheDocument();
    expect(
      screen.queryByText("Sistemas de Equações Lineares")
    ).not.toBeInTheDocument();
  });

  it("deve renderizar com muitas aulas", () => {
    const manyLessons: ClassLesson[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      topic: `Aula ${i + 1}`,
      date: `${i + 1} de novembro`,
      status: ["Concluída", "Em Progresso", "Programada"][i % 3] as
        | "Concluída"
        | "Em Progresso"
        | "Programada",
      duration: "90 minutos",
      content: `Conteúdo da aula ${i + 1}`,
    }));

    render(<LessonsList lessons={manyLessons} />);

    expect(screen.getByText("Aula 1")).toBeInTheDocument();
    expect(screen.getByText("Aula 15")).toBeInTheDocument();
  });
});
