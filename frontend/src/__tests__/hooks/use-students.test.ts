import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStudents } from "@/hooks/use-students";

// Mock do módulo api-client
vi.mock("@/lib/api-client", () => ({
  getStudents: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 1,
          name: "John Doe",
          email: "john@university.edu",
          phone: "11988887777",
          className: "Class A",
          classId: 1,
          status: "ACTIVE",
          createdAt: "2024-01-15",
          grade: 8.5,
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@university.edu",
          phone: "11977776666",
          className: "Class B",
          classId: 2,
          status: "ACTIVE",
          createdAt: "2024-01-20",
          grade: 9,
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@university.edu",
          phone: "11966665555",
          className: "Class A",
          classId: 1,
          status: "INACTIVE",
          createdAt: "2024-02-01",
          grade: 7.5,
        },
        {
          id: 4,
          name: "Alice Brown",
          email: "alice@university.edu",
          phone: "11955554444",
          className: "Class C",
          classId: 3,
          status: "ACTIVE",
          createdAt: "2024-02-10",
          grade: 8.8,
        },
        {
          id: 5,
          name: "Charlie Wilson",
          email: "charlie@university.edu",
          phone: "11944443333",
          className: "Class B",
          classId: 2,
          status: "INACTIVE",
          createdAt: "2024-02-15",
          grade: 6.9,
        },
      ],
      total: 5,
      page: 1,
      totalPages: 1,
    })
  ),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
}));

describe("useStudents hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty students and load them", async () => {
    const { result } = renderHook(() => useStudents());

    // Initially empty
    expect(result.current.students).toHaveLength(0);

    // Wait for students to load
    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });
  });

  it("should have students with required properties", async () => {
    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });

    const firstStudent = result.current.students[0];
    expect(firstStudent).toHaveProperty("id");
    expect(firstStudent).toHaveProperty("name");
    expect(firstStudent).toHaveProperty("email");
    expect(firstStudent).toHaveProperty("class");
    expect(firstStudent).toHaveProperty("status");
    expect(firstStudent).toHaveProperty("enrollmentDate");
  });

  it("should have isLoading state", () => {
    const { result } = renderHook(() => useStudents());
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("should have required methods", () => {
    const { result } = renderHook(() => useStudents());

    expect(typeof result.current.addStudent).toBe("function");
    expect(typeof result.current.updateStudent).toBe("function");
    expect(typeof result.current.deleteStudent).toBe("function");
    expect(typeof result.current.filterStudents).toBe("function");
  });

  it("should filter students by name", async () => {
    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });

    const filtered = result.current.filterStudents("John", "all", "all");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].name).toContain("John");
  });

  it("should filter students by class", async () => {
    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });

    const filtered = result.current.filterStudents("", "Class A", "all");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((s) => s.class === "Class A")).toBe(true);
  });

  it("should filter students by status", async () => {
    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });

    const filtered = result.current.filterStudents("", "all", "active");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((s) => s.status === "active")).toBe(true);
  });

  it("should return all students when no filters applied", async () => {
    const { result } = renderHook(() => useStudents());

    await waitFor(() => {
      expect(result.current.students).toHaveLength(5);
    });

    const filtered = result.current.filterStudents("", "all", "all");
    expect(filtered.length).toBe(result.current.students.length);
  });
});
