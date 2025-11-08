import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useClasses } from "@/hooks/use-classes";
import type { Class } from "@/types";

describe("useClasses hook", () => {
  it("should initialize with mock classes", () => {
    const { result } = renderHook(() => useClasses());

    expect(result.current.classes).toHaveLength(4);
    expect(result.current.classes[0].name).toBe("Matemática Avançada");
    expect(result.current.isLoading).toBe(false);
  });

  describe("addClass", () => {
    it("should add a new class", async () => {
      const { result } = renderHook(() => useClasses());

      const newClass: Omit<Class, "id"> = {
        name: "Nova Turma",
        maxCapacity: 30,
        studentCount: 0,
        professor: "Prof. Test",
        subject: "Matemática",
        description: "Test class",
      };

      act(() => {
        result.current.addClass(newClass);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.classes).toHaveLength(5);
      expect(result.current.classes[0].name).toBe("Nova Turma");
    });

    it("should generate unique id for new class", async () => {
      const { result } = renderHook(() => useClasses());

      const newClass: Omit<Class, "id"> = {
        name: "Class 1",
        maxCapacity: 30,
        studentCount: 0,
        professor: "Prof. A",
        subject: "Português",
        description: "Test",
      };

      act(() => {
        result.current.addClass(newClass);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const addedClass = result.current.classes[0];
      expect(addedClass.id).toBeDefined();
      expect(typeof addedClass.id).toBe("string");
    });
  });

  describe("updateClass", () => {
    it("should update an existing class", async () => {
      const { result } = renderHook(() => useClasses());

      const classIdToUpdate = result.current.classes[0].id;
      const updates = {
        name: "Updated Name",
        studentCount: 25,
      };

      act(() => {
        result.current.updateClass(classIdToUpdate, updates);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedClass = result.current.classes.find(
        (cls) => cls.id === classIdToUpdate
      );
      expect(updatedClass?.name).toBe("Updated Name");
      expect(updatedClass?.studentCount).toBe(25);
    });

    it("should preserve other fields when updating", async () => {
      const { result } = renderHook(() => useClasses());

      const originalClass = result.current.classes[0];
      const classIdToUpdate = originalClass.id;

      act(() => {
        result.current.updateClass(classIdToUpdate, {
          name: "New Name",
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedClass = result.current.classes.find(
        (cls) => cls.id === classIdToUpdate
      );
      expect(updatedClass?.professor).toBe(originalClass.professor);
      expect(updatedClass?.maxCapacity).toBe(originalClass.maxCapacity);
      expect(updatedClass?.subject).toBe(originalClass.subject);
    });
  });

  describe("deleteClass", () => {
    it("should delete a class", async () => {
      const { result } = renderHook(() => useClasses());

      const initialCount = result.current.classes.length;
      const classIdToDelete = result.current.classes[0].id;

      act(() => {
        result.current.deleteClass(classIdToDelete);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.classes).toHaveLength(initialCount - 1);
      expect(
        result.current.classes.find((cls) => cls.id === classIdToDelete)
      ).toBeUndefined();
    });

    it("should not affect other classes when deleting", async () => {
      const { result } = renderHook(() => useClasses());

      const secondClassName = result.current.classes[1].name;
      const classIdToDelete = result.current.classes[0].id;

      act(() => {
        result.current.deleteClass(classIdToDelete);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.classes[0].name).toBe(secondClassName);
    });
  });

  describe("filterClasses", () => {
    it("should filter classes by name", () => {
      const { result } = renderHook(() => useClasses());

      const filtered = result.current.filterClasses("Matemática");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Matemática Avançada");
    });

    it("should perform case-insensitive search", () => {
      const { result } = renderHook(() => useClasses());

      const filteredLower = result.current.filterClasses("física");
      const filteredUpper = result.current.filterClasses("FÍSICA");

      expect(filteredLower).toHaveLength(1);
      expect(filteredUpper).toHaveLength(1);
      expect(filteredLower[0].name).toBe("Fundamentos de Física");
    });

    it("should return all classes when search is empty", () => {
      const { result } = renderHook(() => useClasses());

      const filtered = result.current.filterClasses("");

      expect(filtered).toHaveLength(result.current.classes.length);
    });

    it("should return empty array when no matches found", () => {
      const { result } = renderHook(() => useClasses());

      const filtered = result.current.filterClasses("NonexistentClass");

      expect(filtered).toHaveLength(0);
    });

    it("should filter by partial name match", () => {
      const { result } = renderHook(() => useClasses());

      const filtered = result.current.filterClasses("Lab");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toContain("Lab");
    });
  });

  describe("multiple operations", () => {
    it("should handle add and then delete", async () => {
      const { result } = renderHook(() => useClasses());

      const initialCount = result.current.classes.length;
      let newClassId: string;

      // Add new class
      act(() => {
        result.current.addClass({
          name: "Test Class",
          maxCapacity: 30,
          studentCount: 0,
          professor: "Prof. Test",
          subject: "Matemática",
          description: "Test",
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      newClassId = result.current.classes[0].id;
      expect(result.current.classes).toHaveLength(initialCount + 1);

      // Delete the new class
      act(() => {
        result.current.deleteClass(newClassId);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.classes).toHaveLength(initialCount);
    });

    it("should handle add, update, and filter", async () => {
      const { result } = renderHook(() => useClasses());

      let newClassId: string;

      // Add new class
      act(() => {
        result.current.addClass({
          name: "Python Programming",
          maxCapacity: 25,
          studentCount: 0,
          professor: "Prof. Coder",
          subject: "Inglês",
          description: "Test",
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      newClassId = result.current.classes[0].id;

      // Update the new class
      act(() => {
        result.current.updateClass(newClassId, {
          studentCount: 20,
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Filter for the new class
      const filtered = result.current.filterClasses("Python");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].studentCount).toBe(20);
    });
  });
});
