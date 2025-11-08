import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStudents } from "@/hooks/use-students";

describe("useStudents hook", () => {
  it("should initialize with mock students", () => {
    const { result } = renderHook(() => useStudents());
    expect(result.current.students).toHaveLength(5);
  });

  it("should have students with required properties", () => {
    const { result } = renderHook(() => useStudents());
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
    expect(result.current.isLoading).toBe(false);
  });

  it("should have required methods", () => {
    const { result } = renderHook(() => useStudents());

    expect(typeof result.current.addStudent).toBe("function");
    expect(typeof result.current.updateStudent).toBe("function");
    expect(typeof result.current.deleteStudent).toBe("function");
    expect(typeof result.current.filterStudents).toBe("function");
  });

  it("should filter students by name", () => {
    const { result } = renderHook(() => useStudents());

    const filtered = result.current.filterStudents("John", "all", "all");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].name).toContain("John");
  });

  it("should filter students by class", () => {
    const { result } = renderHook(() => useStudents());

    const filtered = result.current.filterStudents("", "Class A", "all");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((s) => s.class === "Class A")).toBe(true);
  });

  it("should filter students by status", () => {
    const { result } = renderHook(() => useStudents());

    const filtered = result.current.filterStudents("", "all", "active");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((s) => s.status === "active")).toBe(true);
  });

  it("should return all students when no filters applied", () => {
    const { result } = renderHook(() => useStudents());

    const filtered = result.current.filterStudents("", "all", "all");
    expect(filtered.length).toBe(result.current.students.length);
  });
});
