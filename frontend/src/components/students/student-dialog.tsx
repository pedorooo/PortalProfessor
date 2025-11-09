"use client";

import type React from "react";

import { useState, useEffect } from "react";
import type { Student } from "@/types";
import { getClasses, type ClassApiResponse } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (student: Student | Omit<Student, "id">) => void;
  student?: Student;
  isLoading?: boolean;
}

export function StudentDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  student,
  isLoading,
}: Readonly<StudentDialogProps>) {
  const [classes, setClasses] = useState<ClassApiResponse[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone?: string;
    class: string;
    classId?: number;
    status: "active" | "inactive";
    enrollmentDate: string;
  }>({
    name: "",
    email: "",
    phone: "",
    class: "",
    classId: undefined,
    status: "active",
    enrollmentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await getClasses(1, 100);
        setClasses(response.data);
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    if (isOpen) {
      loadClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        class: student.class,
        classId: undefined,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        class: "",
        classId: undefined,
        status: "active",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return;
    }

    if (student) {
      onSubmit({
        ...student,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class: formData.class,
        classId: formData.classId,
        status: formData.status,
        enrollmentDate: formData.enrollmentDate,
      });
    } else {
      onSubmit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class: formData.class,
        classId: formData.classId,
        status: formData.status,
        enrollmentDate: formData.enrollmentDate,
      });
    }
  };

  const handleClassChange = (value: string) => {
    const selectedClass = classes.find((c) => c.id.toString() === value);
    if (selectedClass) {
      setFormData({
        ...formData,
        class: selectedClass.name,
        classId: selectedClass.id,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Student name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+55 11 98765-4321"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={formData.classId?.toString() || ""}
              onValueChange={handleClassChange}
              disabled={loadingClasses || !!student}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "active" | "inactive",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Enrollment Date</Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) =>
                setFormData({ ...formData, enrollmentDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {student ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
