import { useState, useCallback, useEffect } from "react";
import type { Class } from "@/types";
import {
  getClasses,
  createClass as apiCreateClass,
  updateClass as apiUpdateClass,
  deleteClass as apiDeleteClass,
} from "@/lib/api-client";

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(100); // Fetch all at once for simpler filtering

  // Fetch classes on mount and when pagination changes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getClasses(page, limit);

        // Transform API response to frontend Class type
        const transformedClasses: Class[] = response.data.map((apiClass) => ({
          id: apiClass.id,
          name: apiClass.name,
          subject: apiClass.subject as Class["subject"],
          description: apiClass.description || undefined,
          maxCapacity: apiClass.maxCapacity,
          studentCount: apiClass.enrollmentCount,
          professor: apiClass.professorName,
        }));

        setClasses(transformedClasses);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch classes";
        setError(errorMessage);
        console.error("Error fetching classes:", err);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [page, limit]);

  const addClass = useCallback(async (classData: Omit<Class, "id">) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user ID from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not authenticated");
      const user = JSON.parse(userStr);

      // Validate that subject is provided
      if (!classData.subject) {
        throw new Error("Subject is required");
      }

      // Convert user.id to number if it's a string
      const professorId =
        typeof user.id === "string" ? Number.parseInt(user.id, 10) : user.id;

      const response = await apiCreateClass({
        name: classData.name,
        subject: classData.subject,
        description: classData.description,
        maxCapacity: classData.maxCapacity,
        professorId,
      });

      // Transform and add to local state
      const newClass: Class = {
        id: response.id,
        name: response.name,
        subject: response.subject as Class["subject"],
        description: response.description || undefined,
        maxCapacity: response.maxCapacity,
        studentCount: response.enrollmentCount,
        professor: response.professorName,
      };

      setClasses((prev) => [newClass, ...prev]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create class";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClass = useCallback(
    async (id: number, updates: Partial<Class>) => {
      try {
        setIsLoading(true);
        setError(null);

        const classId = id;
        const response = await apiUpdateClass(classId, {
          name: updates.name,
          subject: updates.subject,
          description: updates.description,
          maxCapacity: updates.maxCapacity,
          // professorId can be updated if needed
        });

        // Transform and update local state
        const updatedClass: Class = {
          id: response.id,
          name: response.name,
          subject: response.subject as Class["subject"],
          description: response.description || undefined,
          maxCapacity: response.maxCapacity,
          studentCount: response.enrollmentCount,
          professor: response.professorName,
        };

        setClasses((prev) =>
          prev.map((cls) => (cls.id === id ? updatedClass : cls))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update class";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteClass = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const classId = id;
      await apiDeleteClass(classId);

      setClasses((prev) => prev.filter((cls) => cls.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete class";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterClasses = useCallback(
    (search: string) => {
      if (!search.trim()) return classes;
      return classes.filter((cls) =>
        cls.name.toLowerCase().includes(search.toLowerCase())
      );
    },
    [classes]
  );

  return {
    classes,
    isLoading,
    error,
    addClass,
    updateClass,
    deleteClass,
    filterClasses,
    page,
    setPage,
  };
}
